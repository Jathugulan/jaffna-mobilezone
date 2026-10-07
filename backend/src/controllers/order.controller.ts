import { asyncHandler } from "../utils/asyncHandler";
import { success, paginated } from "../utils/response";
import { notFound } from "../utils/ApiError";
import {
  createOrderService,
  cancelOrderService,
  requestReturnService,
  reorderService,
  getUserOrders,
  getOrderForUser,
  updateOrderStatusService,
  processRefundService,
  listAdminOrders,
  getAdminOrder,
  listAdminCustomers,
} from "../services/order.service";
import type { AuthedRequest } from "../types/express";
import { extractIp } from "../utils/helpers";
import { recordAudit } from "../services/audit.service";
import { notify } from "../services/notification.service";

export const createOrder = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as {
    validated: {
      body: {
        items: Array<{ product: string; quantity: number; variant?: Record<string, unknown> }>;
        shippingAddressId?: string;
        shippingAddress?: Record<string, unknown>;
        couponCode?: string;
        paymentMethod?: string;
      };
    };
  }).validated.body;

  const order = await createOrderService(req.user!.id, body.items, {
    shippingAddressId: body.shippingAddressId,
    shippingAddress: body.shippingAddress as never,
    couponCode: body.couponCode,
    paymentMethod: body.paymentMethod,
  });

  return success(res, { order }, undefined, 201);
});

export const myOrders = asyncHandler(async (req: AuthedRequest, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const result = await getUserOrders(req.user!.id, page, limit);
  return paginated(res, result.data, result.pagination);
});

export const myOrderDetail = asyncHandler(async (req: AuthedRequest, res) => {
  const order = await getOrderForUser(req.user!.id, req.params.id);
  return success(res, { order });
});

export const cancelOrder = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req.body ?? {}) as { reason?: string };
  const order = await cancelOrderService(req.user!.id, req.params.id, body.reason ?? "");
  return success(res, { order });
});

export const requestReturn = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: { reason: string } } }).validated.body;
  const order = await requestReturnService(req.user!.id, req.params.id, body.reason);
  return success(res, { order });
});

export const reorder = asyncHandler(async (req: AuthedRequest, res) => {
  const cart = await reorderService(req.user!.id, req.params.id);
  return success(res, { cart });
});

export const adminOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 15));
  const result = await listAdminOrders(req.query, page, limit);
  return paginated(res, result.data, result.pagination);
});

export const adminOrderDetail = asyncHandler(async (req, res) => {
  const order = await getAdminOrder(req.params.id);
  return success(res, { order });
});

export const adminUpdateOrderStatus = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: { orderStatus: string; note?: string } } }).validated.body;
  const order = await updateOrderStatusService(req.params.id, body.orderStatus);
  await recordAudit({
    admin: req.user!._id,
    action: "update_status",
    resource: "order",
    resourceId: order._id,
    metadata: { status: body.orderStatus, note: body.note },
    ipAddress: extractIp(req),
  });
  return success(res, { order });
});

export const adminRefundOrder = asyncHandler(async (req: AuthedRequest, res) => {
  const order = await processRefundService(req.params.id);
  await recordAudit({ admin: req.user!._id, action: "refund", resource: "order", resourceId: order._id, ipAddress: extractIp(req) });
  return success(res, { order });
});

export const adminApproveReturn = asyncHandler(async (req: AuthedRequest, res) => {
  const { Order } = await import("../models/Order");
  const order = await Order.findById(req.params.id);
  if (!order) throw notFound("Order not found");
  order.returnRequest = { ...order.returnRequest, status: "approved", requested: true };
  order.orderStatus = "returned";
  await order.save();
  await notify({ user: order.user, type: "return_request", title: "Return approved", message: `Return for order ${order.orderNumber} approved.`, data: { orderId: order._id.toString() } });
  return success(res, { order });
});

export const adminCustomers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const result = await listAdminCustomers(req.query, page, limit);
  return paginated(res, result.data, result.pagination);
});

export const adminCustomerDetail = asyncHandler(async (req, res) => {
  const { User } = await import("../models/User");
  const { Order } = await import("../models/Order");
  const { Review } = await import("../models/Review");
  const [user, orders, reviews] = await Promise.all([
    User.findById(req.params.id).select("-passwordHash -refreshTokens -emailVerificationToken -resetPasswordToken"),
    Order.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(20),
    Review.find({ user: req.params.id }).populate("product", "name slug images"),
  ]);
  if (!user) throw notFound("Customer not found");
  const spent = await Order.aggregate([
    { $match: { user: user._id as never, orderStatus: { $nin: ["cancelled", "returned", "refunded"] } } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);
  return success(res, { user, orders, reviews, totalSpent: spent[0]?.total ?? 0 });
});

export const adminCustomerStatus = asyncHandler(async (req: AuthedRequest, res) => {
  const { User } = await import("../models/User");
  const body = (req as unknown as { validated: { body: { isActive: boolean } } }).validated.body;
  const user = await User.findById(req.params.id);
  if (!user) throw notFound("Customer not found");
  user.isActive = body.isActive;
  await user.save();
  await recordAudit({ admin: req.user!._id, action: "toggle_status", resource: "user", resourceId: user._id, metadata: { isActive: body.isActive }, ipAddress: extractIp(req) });
  return success(res, { user: { id: user._id, username: user.username, email: user.email, isActive: user.isActive } });
});