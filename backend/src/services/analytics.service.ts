import type { PipelineStage } from "mongoose";
import { Order } from "../models/Order";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { Offer } from "../models/Offer";
import { Review } from "../models/Review";
import { Brand } from "../models/Brand";
import { Category } from "../models/Category";

export type DateRangeKey = "today" | "7d" | "30d" | "3m" | "1y" | "custom";

export function resolveDateRange(range: DateRangeKey, from?: Date, to?: Date): { from: Date; to: Date } {
  const now = new Date();
  const start = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const ms = now.getTime();
  const mul = (d: number) => new Date(ms - d * 24 * 60 * 60 * 1000);

  switch (range) {
    case "today":
      return { from: new Date(now.setHours(0, 0, 0, 0)), to: new Date() };
    case "7d":
      return { from: start(7), to: now };
    case "30d":
      return { from: start(30), to: now };
    case "3m":
      return { from: mul(90), to: now };
    case "1y":
      return { from: mul(365), to: now };
    case "custom":
      return { from: from ?? start(30), to: to ?? now };
    default:
      return { from: mul(30), to: now };
  }
}

export async function getOverview(range: DateRangeKey, from?: Date, to?: Date) {
  const { from: start, to: end } = resolveDateRange(range, from, to);
  const match: PipelineStage.Match = {
    $match: { createdAt: { $gte: start, $lte: end } },
  };

  const [ordersAgg, customersAgg, productsAgg, offersAgg, reviewsAgg] = await Promise.all([
    Order.aggregate([
      match,
      { $match: { orderStatus: { $nin: ["cancelled", "returned", "refunded"] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] } },
          productsSold: {
            $sum: { $sum: "$items.quantity" },
          },
        },
      },
    ]),
    User.aggregate([match, { $count: "total" }]),
    Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          lowStock: { $sum: { $cond: [{ $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", 5] }] }, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] } },
        },
      },
    ]),
    Offer.aggregate([
      {
        $group: {
          _id: null,
          active: { $sum: { $cond: ["$active", 1, 0] } },
        },
      },
    ]),
    Review.aggregate([match, { $count: "total" }]),
  ]);

  const o = ordersAgg[0] ?? { totalRevenue: 0, totalOrders: 0, delivered: 0, productsSold: 0 };
  const c = customersAgg[0] ?? { total: 0 };
  const pr = productsAgg[0] ?? { totalProducts: 0, lowStock: 0, outOfStock: 0 };
  const off = offersAgg[0] ?? { active: 0 };
  const rev = reviewsAgg[0] ?? { total: 0 };

  return {
    totalRevenue: Math.round(o.totalRevenue),
    totalOrders: o.totalOrders,
    productsSold: o.productsSold,
    deliveredOrders: o.delivered,
    totalCustomers: c.total,
    totalProducts: pr.totalProducts,
    lowStock: pr.lowStock,
    outOfStock: pr.outOfStock,
    activeOffers: off.active,
    totalReviews: rev.total,
    averageOrderValue: o.totalOrders ? Math.round(o.totalRevenue / o.totalOrders) : 0,
  };
}

function seriesBucketId(range: DateRangeKey) {
  return range === "today" ? { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } } : {
    year: { $year: "$createdAt" },
    month: { $month: "$createdAt" },
    day: { $dayOfMonth: "$createdAt" },
  };
}

export async function getSeries(range: DateRangeKey, from?: Date, to?: Date) {
  const { from: start, to: end } = resolveDateRange(range, from, to);
  const groupKey = seriesBucketId(range);
  const [orders, customers, recent] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, orderStatus: { $nin: ["cancelled", "returned", "refunded"] } } },
      {
        $group: {
          _id: groupKey,
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: groupKey, total: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
      { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
      {
        $project: {
          orderNumber: 1,
          total: 1,
          orderStatus: 1,
          paymentStatus: 1,
          createdAt: 1,
          customer: { $arrayElemAt: ["$user", 0] },
          itemCount: { $size: "$items" },
        },
      },
    ]),
  ]);

  return { orderSeries: orders, customerSeries: customers, recentOrders: recent };
}

export async function getProductPerformance(range: DateRangeKey, from?: Date, to?: Date) {
  const { from: start, to: end } = resolveDateRange(range, from, to);
  const pipeline: PipelineStage[] = [
    { $match: { createdAt: { $gte: start, $lte: end }, orderStatus: { $nin: ["cancelled", "returned", "refunded"] } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        qtySold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.offerPriceSnapshot", "$items.quantity"] } },
      },
    },
    { $sort: { qtySold: -1 } },
    { $limit: 15 },
    { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        qtySold: 1,
        revenue: 1,
        name: "$product.name",
        slug: "$product.slug",
        price: "$product.price",
        stock: "$product.stock",
        image: { $arrayElemAt: ["$product.images", 0] },
        brand: 1,
      },
    },
    {
      $lookup: { from: "brands", localField: "product.brand", foreignField: "_id", as: "brand" },
    },
    {
      $project: {
        qtySold: 1,
        revenue: 1,
        name: 1,
        slug: 1,
        price: 1,
        stock: 1,
        image: 1,
        brandName: { $arrayElemAt: ["$brand.name", 0] },
      },
    },
  ];

  return Order.aggregate(pipeline);
}

export async function getTopProductsAllTime(limit = 10) {
  const products = await Product.find({ published: true })
    .sort({ salesCount: -1, viewCount: -1 })
    .limit(limit)
    .populate("brand", "name slug")
    .select("name slug price offerPrice stock salesCount viewCount images brand")
    .lean();

  return products.map((p) => ({
    id: p._id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    offerPrice: p.offerPrice,
    stock: p.stock,
    salesCount: p.salesCount,
    viewCount: p.viewCount,
    image: p.images?.[0] ?? null,
    brand: (p.brand as unknown as { name?: string; slug?: string }) ?? null,
  }));
}

export async function getBrandPerformance(range: DateRangeKey, from?: Date, to?: Date) {
  const { from: start, to: end } = resolveDateRange(range, from, to);
  const rows = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, orderStatus: { $nin: ["cancelled", "returned", "refunded"] } } },
    { $unwind: "$items" },
    { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "p" } },
    { $unwind: { path: "$p", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$p.brand",
        count: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.offerPriceSnapshot", "$items.quantity"] } },
      },
    },
    { $lookup: { from: "brands", localField: "_id", foreignField: "_id", as: "brand" } },
    { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
    { $sort: { count: -1 } },
    { $limit: 12 },
    {
      $project: {
        _id: 0,
        name: "$brand.name",
        slug: "$brand.slug",
        logoUrl: "$brand.logoUrl",
        count: 1,
        revenue: 1,
      },
    },
  ]);

  const fallbackRows = rows.length
    ? rows
    : (await Brand.find().select("name slug logoUrl")).map((b) => ({ name: b.name, slug: b.slug, logoUrl: b.logoUrl, count: 0, revenue: 0 }));

  return fallbackRows;
}

export async function getCategoryPerformance(range: DateRangeKey, from?: Date, to?: Date) {
  const { from: start, to: end } = resolveDateRange(range, from, to);
  return Order.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, orderStatus: { $nin: ["cancelled", "returned", "refunded"] } } },
    { $unwind: "$items" },
    { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "p" } },
    { $unwind: { path: "$p", preserveNullAndEmptyArrays: true } },
    { $group: { _id: "$p.category", count: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.offerPriceSnapshot", "$items.quantity"] } } } },
    { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "cat" } },
    { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
    { $sort: { count: -1 } },
    { $limit: 12 },
    { $project: { _id: 0, name: "$cat.name", slug: "$cat.slug", count: 1, revenue: 1 } },
  ]);
}

export async function getCustomerGrowth(range: DateRangeKey, from?: Date, to?: Date) {
  const { from: start, to: end } = resolveDateRange(range, from, to);
  return User.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);
}

export async function getOfferPerformance() {
  const offers = await Offer.find().sort({ createdAt: -1 }).select("name discountType discountValue active startDate endDate").lean();
  const out: Array<Record<string, unknown>> = [];
  for (const offer of offers) {
    const v = offer.discountValue;
    out.push({
      name: offer.name,
      discountType: offer.discountType,
      discountValue: v,
      active: offer.active,
      startDate: offer.startDate,
      endDate: offer.endDate,
    });
  }
  return out;
}

export async function getConversionOverview(range: DateRangeKey, from?: Date, to?: Date) {
  const overview = await getOverview(range, from, to);
  const visits = await Product.aggregate([{ $group: { _id: null, views: { $sum: "$viewCount" } } }]);
  const totalViews = visits[0]?.views ?? 0;
  const conversionRate = totalViews ? Number(((overview.totalOrders / Math.max(totalViews, 1)) * 100).toFixed(2)) : 0;
  return { ...overview, totalViews, conversionRate };
}