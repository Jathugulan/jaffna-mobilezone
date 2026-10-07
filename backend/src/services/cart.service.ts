import { Cart, type ICart } from "../models/Cart";
import { Product } from "../models/Product";
import type { ICartItem } from "../models/Cart";
import { ApiError, badRequest, notFound } from "../utils/ApiError";
import type { AuthedRequest } from "../types/express";
import { deliveryFeeFor } from "./product.service";
import { Coupon } from "../models/Coupon";

async function getOrCreateCart(userId: string): Promise<ICart> {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

interface CartProductInfo {
  price: number;
  offerPrice: number | null;
  name: string;
  image: string | null;
  stock: number;
  slug: string;
  brand: { _id: string; name: string } | null;
}

const UNKNOWN_PRODUCT_INFO: CartProductInfo = {
  price: 0,
  offerPrice: null,
  name: "Unknown",
  image: null,
  stock: 0,
  slug: "",
  brand: null,
};

export function cartToDto(cart: ICart, prices: Map<string, CartProductInfo>) {
  const items = cart.items.map((item) => {
    const productId = (item.product as unknown as string).toString();
    const known = prices.has(productId);
    const info = prices.get(productId) ?? UNKNOWN_PRODUCT_INFO;

    const effective = info.offerPrice ?? info.price;
    const lineTotal = effective * item.quantity;
    const wasTotal = info.price * item.quantity;

    return {
      // Return a full product object so the frontend CartItem contract
      // (`{ product, quantity, variant }`) holds for every cart source.
      product: {
        _id: productId,
        name: info.name,
        slug: info.slug,
        images: info.image ? [info.image] : [],
        price: info.price,
        offerPrice: info.offerPrice,
        stock: info.stock,
        brand: info.brand,
      },
      quantity: item.quantity,
      variant: item.variant ?? null,
      name: info.name,
      image: info.image,
      slug: info.slug,
      stock: info.stock,
      unitPrice: effective,
      regularUnitPrice: info.price,
      lineTotal,
      lineWasTotal: wasTotal,
      lineDiscount: wasTotal - lineTotal,
      invalid: !known || info.stock <= 0,
    };
  });

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const itemDiscount = items.reduce((s, i) => s + i.lineDiscount, 0);
  const deliveryFee = items.length ? deliveryFeeFor(subtotal) : 0;
  const total = subtotal + deliveryFee;

  return {
    items,
    subtotal,
    itemDiscount,
    deliveryFee,
    total,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
  };
}

export async function loadCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  const productIds = cart.items.map((i) => i.product as never) as string[];

  if (!productIds.length) {
    return cartToDto(cart, new Map());
  }

  const products = await Product.find({ _id: { $in: productIds } })
    .populate("brand", "name")
    .select("_id name price offerPrice images stock slug published brand")
    .lean();

  const prices = new Map<string, CartProductInfo>();
  for (const p of products) {
    if (!p.published) continue;
    const rawBrand = p.brand as unknown as { _id?: unknown; name?: unknown } | null | undefined;
    const brand =
      rawBrand && typeof rawBrand === "object"
        ? { _id: String(rawBrand._id ?? ""), name: String(rawBrand.name ?? "") }
        : null;
    prices.set(p._id.toString(), {
      price: p.price,
      offerPrice: p.offerPrice,
      name: p.name,
      image: p.images?.[0] ?? null,
      stock: p.stock,
      slug: p.slug,
      brand,
    });
  }

  // Purge stale entries — products that were deleted or unpublished (e.g.
  // leftover demo/test items) no longer belong in the shopper's cart.
  if (cart.items.some((i) => !prices.has(i.product.toString()))) {
    cart.items = cart.items.filter((i) => prices.has(i.product.toString()));
    await cart.save();
  }

  return cartToDto(cart, prices);
}

async function validateCartItem(productId: string, quantity: number): Promise<void> {
  const product = await Product.findById(productId).select("published stock price name").lean();
  if (!product || !product.published) throw notFound("Product not available");
  if (quantity <= 0) throw badRequest("Quantity must be at least 1");
  if (quantity > 99) throw badRequest("Quantity cannot exceed 99");
  if (product.stock <= 0) throw badRequest(`"${product.name}" is currently out of stock`);
  if (quantity > product.stock) throw badRequest(`Only ${product.stock} units of "${product.name}" are in stock`);
}

export async function addToCartService(userId: string, productId: string, quantity: number, variant?: Record<string, unknown>) {
  await validateCartItem(productId, quantity);
  const cart = await getOrCreateCart(userId);

  const existing = cart.items.find((i) => i.product.toString() === productId);
  if (existing) {
    const newQty = existing.quantity + quantity;
    await validateCartItem(productId, newQty);
    existing.quantity = newQty;
  } else {
    cart.items.push({ product: productId as never, quantity, variant: variant ?? null });
  }

  await cart.save();
  return loadCart(userId);
}

export async function updateCartItemService(userId: string, productId: string, quantity: number) {
  await validateCartItem(productId, quantity);
  const cart = await getOrCreateCart(userId);
  const existing = cart.items.find((i) => i.product.toString() === productId);
  if (!existing) throw notFound("Item not found in cart");
  existing.quantity = quantity;
  await cart.save();
  return loadCart(userId);
}

export async function removeCartItemService(userId: string, productId: string) {
  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();
  return loadCart(userId);
}

export async function clearCartService(userId: string) {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return loadCart(userId);
}

export async function applyCouponService(userId: string, code: string) {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
  if (!coupon) throw badRequest("Invalid coupon code");

  const now = new Date();
  if (coupon.startDate && now < coupon.startDate) throw badRequest("Coupon not active yet");
  if (coupon.endDate && now > coupon.endDate) throw badRequest("Coupon has expired");
  if (coupon.maxUses && coupon.uses && coupon.uses >= coupon.maxUses) throw badRequest("Coupon usage limit reached");

  const cart = await loadCart(userId);
  if (cart.subtotal < (coupon.minOrder ?? 0)) {
    throw badRequest(`Minimum order for this coupon is Rs.${coupon.minOrder}`);
  }

  let discountAmount = 0;
  if (coupon.type === "percentage") {
    discountAmount = (cart.subtotal * coupon.value) / 100;
  } else {
    discountAmount = coupon.value;
  }
  if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
    discountAmount = coupon.maxDiscount;
  }
  discountAmount = Math.min(discountAmount, cart.subtotal);
  const couponDiscount = Math.round(discountAmount);

  const order = (await loadCart(userId)) as Awaited<ReturnType<typeof loadCart>> & { id?: string };

  return {
    coupon: { code: coupon.code, type: coupon.type, value: coupon.value },
    discountAmount: couponDiscount,
    totals: {
      subtotal: cart.subtotal,
      itemDiscount: cart.itemDiscount,
      couponDiscount,
      deliveryFee: cart.deliveryFee,
      total: cart.subtotal + cart.deliveryFee - couponDiscount,
    },
    cart: { ...order, couponCode: coupon.code },
  };
}

export async function getCartOrUserId(req: AuthedRequest): Promise<string> {
  return req.user!.id;
}

export interface CartLine {
  product: string;
  quantity: number;
  variant?: Record<string, unknown>;
}

export function cartEntries(cart: ICart): CartLine[] {
  return cart.items.map((i: ICartItem) => ({
    product: i.product.toString(),
    quantity: i.quantity,
    variant: i.variant ?? undefined,
  }));
}