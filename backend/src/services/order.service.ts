import type { FilterQuery, Types } from "mongoose";
import mongoose from "mongoose";
import { Order, type IOrder } from "../models/Order";
import { Product } from "../models/Product";
import { Address } from "../models/Address";
import { Coupon } from "../models/Coupon";
import { Cart } from "../models/Cart";
import { User } from "../models/User";
import { badRequest, notFound } from "../utils/ApiError";
import { deliveryFeeFor } from "./product.service";
import { generateRandomToken } from "../utils/helpers";
import { notify } from "./notification.service";

export interface OrderItemInput {
  product: string;
  quantity: number;
  variant?: Record<string, unknown>;
}

export async function createOrderService(
  userId: string,
  items: OrderItemInput[],
  opts: {
    shippingAddressId?: string;
    shippingAddress?: {
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      district: string;
      postalCode?: string;
      deliveryInstructions?: string;
    };
    couponCode?: string;
    paymentMethod?: string;
  }
): Promise<IOrder> {
  if (!items.length) throw badRequest("Order must have at least one item");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Resolve shipping address
    let shipping = opts.shippingAddress;
    if (opts.shippingAddressId && !shipping) {
      const addr = await Address.findOne({
        _id: opts.shippingAddressId,
        user: userId,
      }).session(session);
      if (!addr) throw badRequest("Shipping address not found");
      shipping = {
        fullName: addr.fullName,
        phone: addr.phone,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 ?? "",
        city: addr.city,
        district: addr.district,
        postalCode: addr.postalCode ?? "",
        deliveryInstructions: addr.deliveryInstructions ?? "",
      };
    }
    if (!shipping) throw badRequest("Shipping address is required");

    // 2. Fetch products and validate
    const productIds = items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds }, published: true }).session(session);
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.product);
      if (!product) throw badRequest("One of the products is not available");
      if (product.stock < item.quantity) {
        throw badRequest(`Only ${product.stock} units of "${product.name}" are available`);
      }
      const unitPrice = product.offerPrice ?? product.price;
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      orderItems.push({
        product: product._id,
        nameSnapshot: product.name,
        imageSnapshot: product.images?.[0] ?? "",
        priceSnapshot: product.price,
        offerPriceSnapshot: product.offerPrice ?? product.price,
        quantity: item.quantity,
        variant: item.variant ?? null,
      });
    }

    // 3. Coupon
    let couponDiscount = 0;
    let couponCode: string | null = null;
    if (opts.couponCode) {
      const coupon = await Coupon.findOne({
        code: opts.couponCode.toUpperCase(),
        active: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      }).session(session);
      if (coupon) {
        if (coupon.minOrder && subtotal < coupon.minOrder) {
          throw badRequest(`Minimum order for coupon is Rs.${coupon.minOrder}`);
        }
        if (coupon.maxUses && (coupon.uses ?? 0) >= coupon.maxUses) {
          throw badRequest("Coupon usage limit reached");
        }
        let d = coupon.type === "percentage" ? (subtotal * coupon.value) / 100 : coupon.value;
        if (coupon.maxDiscount) d = Math.min(d, coupon.maxDiscount);
        couponDiscount = Math.round(Math.min(d, subtotal));
        couponCode = coupon.code;
        await Coupon.updateOne({ _id: coupon._id }, { $inc: { uses: 1 } }).session(session);
      }
    }

    const deliveryFee = deliveryFeeFor(subtotal);
    const total = Math.max(0, subtotal + deliveryFee - couponDiscount);

    // 4. Create order
    const orderNumber = `JMZ-${Date.now()}-${generateRandomToken(4).toUpperCase()}`;
    const [order] = await Order.create(
      [
        {
          user: userId,
          orderNumber,
          items: orderItems,
          subtotal: Math.round(subtotal),
          discount: Math.round(couponDiscount),
          deliveryFee,
          total: Math.round(total),
          couponCode,
          shippingAddress: shipping,
          paymentStatus: "paid",
          orderStatus: "confirmed",
          paymentMethod: opts.paymentMethod ?? "cod",
        },
      ],
      { session }
    );

    // 5. Reduce stock & bump sales
    for (const item of items) {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: -item.quantity, salesCount: item.quantity } }
      ).session(session);
    }

    // 6. Clear cart
    await Cart.updateOne({ user: userId }, { $set: { items: [] } }).session(session);

    // 7. Notify customer
    try {
      await notify({
        user: new mongoose.Types.ObjectId(userId),
        type: "order_confirmed",
        title: "Order confirmed",
        message: `Your order ${orderNumber} has been confirmed. Total ${order.total.toLocaleString()} LKR.`,
        data: { orderId: order._id.toString(), orderNumber },
      });
    } catch {
      // non critical
    }

    await session.commitTransaction();
    await session.endSession();

    return order;
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw err;
  }
}

export function canCancelOrder(order: IOrder): string | null {
  const cancellable = ["pending", "confirmed", "processing"];
  if (!cancellable.includes(order.orderStatus)) {
    return `Orders in "${order.orderStatus}" status cannot be cancelled`;
  }
  if (order.returnRequest?.requested) {
    return "A return request is already in progress";
  }
  return null;
}

export async function cancelOrderService(userId: string, orderId: string, reason: string, isAdmin = false) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      _id: orderId,
      ...(isAdmin ? {} : { user: userId }),
      orderStatus: { $nin: ["cancelled", "delivered", "returned", "refunded"] },
    }).session(session);
    if (!order) throw notFound("Order not found or cannot be cancelled");

    const restriction = canCancelOrder(order);
    if (restriction && !isAdmin) throw badRequest(restriction);

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.cancellationReason = reason || "Cancelled by customer";
    await order.save({ session });

    // restore stock
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity, salesCount: -item.quantity } }
      ).session(session);
    }

    await notify({
      user: new mongoose.Types.ObjectId(userId),
      type: "system",
      title: "Order cancelled",
      message: `Order ${order.orderNumber} has been cancelled.`,
      data: { orderId: order._id.toString(), orderNumber: order.orderNumber },
    });

    await session.commitTransaction();
    await session.endSession();
    return order;
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw err;
  }
}

export async function requestReturnService(userId: string, orderId: string, reason: string) {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw notFound("Order not found");
  if (order.orderStatus !== "delivered") throw badRequest("Only delivered orders can be returned");
  if (order.returnRequest?.requested) throw badRequest("Return already requested");

  order.returnRequest = { requested: true, reason, status: "requested" };
  await order.save();

  await notify({
    user: new mongoose.Types.ObjectId(userId),
    type: "return_request",
    title: "Return requested",
    message: `Return requested for order ${order.orderNumber}.`,
    data: { orderId: order._id.toString() },
  });

  return order;
}

export async function reorderService(userId: string, orderId: string) {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw notFound("Order not found");

  const items = order.items.map((i) => ({
    product: i.product.toString(),
    quantity: i.quantity,
    variant: i.variant ?? undefined,
  }));

  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    {
      $push: {
        items: order.items.map((i) => ({
          product: i.product,
          quantity: i.quantity,
          variant: i.variant ?? null,
        })),
      },
    },
    { upsert: true, new: true }
  );

  const _ = items;
  return cart;
}

export async function getUserOrders(userId: string, page: number, limit: number) {
  const total = await Order.countDocuments({ user: userId });
  const data = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  return { data, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

export async function getOrderForUser(userId: string, orderId: string) {
  const order = await Order.findOne({ _id: orderId, user: userId }).populate("items.product", "name slug images");
  if (!order) throw notFound("Order not found");
  return order;
}

export async function updateOrderStatusService(orderId: string, orderStatus: string) {
  const order = await Order.findById(orderId);
  if (!order) throw notFound("Order not found");

  order.orderStatus = orderStatus as typeof order.orderStatus;
  if (orderStatus === "delivered") order.deliveredAt = new Date();
  if (orderStatus === "cancelled" && !order.cancelledAt) {
    order.cancelledAt = new Date();
  }
  await order.save();

  await notify({
    user: order.user,
    type: "order_shipped",
    title: `Order ${order.orderNumber} ${orderStatus}`,
    message: `Your order ${order.orderNumber} is now ${orderStatus.replace(/([A-Z])/g, " $1")}.`,
    data: { orderId: order._id.toString(), orderNumber: order.orderNumber },
  });

  return order;
}

export async function processRefundService(orderId: string) {
  const order = await Order.findById(orderId);
  if (!order) throw notFound("Order not found");
  order.paymentStatus = "refunded";
  order.orderStatus = "refunded";
  await order.save();
  return order;
}

export async function listAdminOrders(query: Record<string, unknown>, page: number, limit: number) {
  const filter: FilterQuery<IOrder> = {};
  if (query.search) {
    const re = new RegExp(String(query.search), "i");
    const users = await User.find({ $or: [{ username: re }, { email: re }] }).select("_id");
    const or: FilterQuery<IOrder>[] = [{ orderNumber: re }, { "shippingAddress.fullName": re }, { "shippingAddress.phone": re }];
    if (users.length) or.push({ user: { $in: users.map((u) => u._id) } });
    filter.$or = or;
  }
  if (query.orderStatus) filter.orderStatus = query.orderStatus as IOrder["orderStatus"];
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus as IOrder["paymentStatus"];

  const total = await Order.countDocuments(filter);
  const data = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("user", "username email phone")
    .lean();

  return { data, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

export async function getAdminOrder(orderId: string) {
  const order = await Order.findById(orderId).populate("user", "username email phone").populate("items.product", "name slug sku");
  if (!order) throw notFound("Order not found");
  return order;
}

export async function listAdminCustomers(query: Record<string, unknown>, page: number, limit: number) {
  const filter: Record<string, unknown> = { role: "customer" };
  if (query.search) {
    const re = new RegExp(String(query.search), "i");
    filter.$or = [{ username: re }, { email: re }, { phone: re }];
  }
  if (query.active !== undefined) filter.isActive = query.active === "true";

  const total = await User.countDocuments(filter);
  const data = await User.find(filter)
    .select("-passwordHash -refreshTokens -emailVerificationToken -resetPasswordToken")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const withStats = await Promise.all(
    data.map(async (u) => {
      const [orderCount, spent] = await Promise.all([
        Order.countDocuments({ user: u._id }),
        Order.aggregate([
          { $match: { user: u._id, orderStatus: { $nin: ["cancelled", "returned", "refunded"] } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
      ]);
      return { ...u, orderCount: orderCount ?? 0, totalSpent: spent[0]?.total ?? 0 };
    })
  );

  return { data: withStats, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

export function getCustomerDashboard(userId: string) {
  void userId;
  return {} as never;
}

export function orderNumber(): string {
  return `JMZ-${Date.now()}-${generateRandomToken(4).toUpperCase()}`;
}