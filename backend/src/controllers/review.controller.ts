import { Review } from "../models/Review";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { asyncHandler } from "../utils/asyncHandler";
import { success, paginated } from "../utils/response";
import { badRequest, notFound, unauthorized } from "../utils/ApiError";
import type { AuthedRequest } from "../types/express";
import { recordAudit } from "../services/audit.service";
import { extractIp } from "../utils/helpers";
import { notify } from "../services/notification.service";

export const getProductReviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const productId = req.params.productId;

  const filter = { product: productId, status: "approved" };
  const [data, total, agg] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("user", "username profilePicture"),
    Review.countDocuments(filter),
    Review.aggregate([
      { $match: { product: (req.params.productId as never), status: "approved" } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
  ]);

  const aggResult = agg[0] ?? { avg: 0, count: 0 };
  const ratingDistribution = await Review.aggregate([
    { $match: { product: productId as never, status: "approved" } },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
  ]);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
  for (const d of ratingDistribution) distribution[d._id as number] = d.count;

  return success(res, {
    reviews: data,
    meta: {
      average: Number(aggResult.avg.toFixed(1)),
      count: aggResult.count,
      distribution,
      total,
    },
  });
});

export const createReview = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as {
    validated: {
      body: { product: string; order?: string; rating: number; comment: string };
    };
  }).validated.body;

  const product = await Product.findById(body.product);
  if (!product) throw notFound("Product not found");

  const existing = await Review.findOne({ user: req.user!.id, product: body.product });
  if (existing) throw badRequest("You have already reviewed this product");

  let verifiedPurchase = false;
  if (body.order) {
    const order = await Order.findOne({ _id: body.order, user: req.user!.id, orderStatus: "delivered" });
    verifiedPurchase = Boolean(order && order.items.some((i) => i.product.toString() === body.product));
    if (!verifiedPurchase) throw badRequest("You can only review products from a delivered order");
  }

  const review = await Review.create({
    user: req.user!.id,
    product: body.product,
    order: body.order ?? null,
    rating: body.rating,
    comment: body.comment,
    verifiedPurchase,
    status: "pending",
  });

  return success(res, { review }, undefined, 201);
});

export const updateReview = asyncHandler(async (req: AuthedRequest, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw notFound("Review not found");
  if (review.user.toString() !== req.user!.id) throw unauthorized("You can only edit your own reviews");

  const body = (req as unknown as { validated: { body: { rating?: number; comment?: string } } }).validated.body;
  if (body.rating !== undefined) review.rating = body.rating;
  if (body.comment !== undefined) review.comment = body.comment;
  review.status = "pending";
  await review.save();
  return success(res, { review });
});

export const deleteReview = asyncHandler(async (req: AuthedRequest, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw notFound("Review not found");
  if (review.user.toString() !== req.user!.id && req.user!.role !== "admin") {
    throw unauthorized("You cannot delete this review");
  }
  await review.deleteOne();
  return success(res, { message: "Review deleted" });
});

export const adminListReviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 15));
  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = req.query.status as string;
  if (req.query.search) {
    const re = new RegExp(String(req.query.search), "i");
    filter.$or = [{ comment: re }, { "user.username": re }];
  }
  const [data, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("product", "name slug images").populate("user", "username email profilePicture"),
    Review.countDocuments(filter),
  ]);
  return paginated(res, data, { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
});

export const adminSetReviewStatus = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: { status: string } } }).validated.body;
  const review = await Review.findById(req.params.id);
  if (!review) throw notFound("Review not found");
  review.status = body.status as never;
  await review.save();
  await recordAudit({ admin: req.user!._id, action: "moderate", resource: "review", resourceId: review._id, metadata: { status: body.status }, ipAddress: extractIp(req) });
  if (body.status === "approved") {
    const owner = await Review.findById(review._id).populate("user", "_id");
    const ownerId = (owner as unknown as { user?: { _id?: string } }).user?._id;
    if (ownerId) await notify({ user: ownerId, type: "new_review", title: "Review approved", message: "Your product review has been approved and published.", data: { productId: review.product.toString() } });
  }
  return success(res, { review });
});

export const adminDeleteReview = asyncHandler(async (req: AuthedRequest, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw notFound("Review not found");
  await review.deleteOne();
  await recordAudit({ admin: req.user!._id, action: "delete", resource: "review", resourceId: review._id, ipAddress: extractIp(req) });
  return success(res, { message: "Review deleted" });
});

export const myReviews = asyncHandler(async (req: AuthedRequest, res) => {
  const reviews = await Review.find({ user: req.user!.id }).sort({ createdAt: -1 }).populate("product", "name slug images");
  return success(res, { reviews });
});