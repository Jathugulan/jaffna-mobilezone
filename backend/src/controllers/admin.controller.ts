import { AuditLog } from "../models/AuditLog";
import { Coupon } from "../models/Coupon";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { success, paginated } from "../utils/response";
import { notFound } from "../utils/ApiError";
import type { AuthedRequest } from "../types/express";
import { recordAudit } from "../services/audit.service";
import { extractIp } from "../utils/helpers";

export const listAuditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const filter: Record<string, unknown> = {};
  if (req.query.action) filter.action = req.query.action;
  if (req.query.resource) filter.resource = req.query.resource;

  const [data, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("admin", "username email"),
    AuditLog.countDocuments(filter),
  ]);
  return paginated(res, data, { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
});

export const listCoupons = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  return success(res, { coupons });
});

export const createCoupon = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;
  const coupon = await Coupon.create(body);
  await recordAudit({ admin: req.user!._id, action: "create", resource: "coupon", resourceId: coupon._id, ipAddress: extractIp(req) });
  return success(res, { coupon }, undefined, 201);
});

export const updateCoupon = asyncHandler(async (req: AuthedRequest, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw notFound("Coupon not found");
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;
  Object.assign(coupon, body);
  await coupon.save();
  return success(res, { coupon });
});

export const deleteCoupon = asyncHandler(async (req: AuthedRequest, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw notFound("Coupon not found");
  await coupon.deleteOne();
  return success(res, { message: "Coupon deleted" });
});

export const getSettings = asyncHandler(async (_req, res) => {
  return success(res, {
    settings: {
      storeName: "Jaffna Mobile Zone",
      supportEmail: "hello@jaffnamobilezone.lk",
      phone: "+94 77 123 4567",
      deliveryFee: 500,
      freeDeliveryThreshold: 100000,
      currency: "LKR",
      aiEnabled: process.env.DISABLE_AI !== "true",
    },
  });
});

export const updateSettings = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  await recordAudit({ admin: req.user!._id, action: "update", resource: "settings", metadata: body, ipAddress: extractIp(req) });
  return success(res, { message: "Settings updated", settings: body });
});

export const adminStats = asyncHandler(async (_req, res) => {
  const { Order } = await import("../models/Order");
  const { Product } = await import("../models/Product");
  const { Offer } = await import("../models/Offer");
  const { Review } = await import("../models/Review");

  const [revenue, orderCounts, customers, products, offers, reviews] = await Promise.all([
    Order.aggregate([
      { $match: { orderStatus: { $nin: ["cancelled", "returned", "refunded"] } } },
      { $group: { _id: null, total: { $sum: "$total" }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
User.countDocuments({ role: "customer" }),
    Product.aggregate<{ total: number; low: number }>([
      { $group: { _id: null, total: { $sum: 1 }, low: { $sum: { $cond: [{ $lte: ["$stock", 5] }, 1, 0] } } } },
    ]),
    Offer.countDocuments({ active: true }),
    Review.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const revenueRow = revenue[0] ?? { total: 0, orders: 0 };
  const productRow = products[0] ?? { total: 0, low: 0 };
  const statusCounts: Record<string, number> = {};
  for (const c of orderCounts) statusCounts[c._id as string] = c.count;

  return success(res, {
    totalRevenue: Math.round(revenueRow.total),
    totalOrders: revenueRow.orders,
    pendingOrders: statusCounts.pending ?? 0,
    totalCustomers: customers,
    totalProducts: productRow.total,
    lowStock: productRow.low,
    activeOffers: offers,
    reviewCounts: Object.fromEntries(reviews.map((r) => [r._id, r.count])),
  });
});