import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import {
  getOverview,
  getSeries,
  getProductPerformance,
  getTopProductsAllTime,
  getBrandPerformance,
  getCategoryPerformance,
  getCustomerGrowth,
  getOfferPerformance,
  getConversionOverview,
  type DateRangeKey,
} from "../services/analytics.service";

function rangeFromReq(query: Record<string, unknown>): DateRangeKey {
  const r = String(query.range ?? "30d");
  return r as DateRangeKey;
}

function customFrom(query: Record<string, unknown>): Date | undefined {
  return query.from ? new Date(String(query.from)) : undefined;
}

function customTo(query: Record<string, unknown>): Date | undefined {
  return query.to ? new Date(String(query.to)) : undefined;
}

export const overview = asyncHandler(async (req, res) => {
  const data = await getConversionOverview(rangeFromReq(req.query), customFrom(req.query), customTo(req.query));
  return success(res, data);
});

export const revenue = asyncHandler(async (req, res) => {
  const { orderSeries } = await getSeries(rangeFromReq(req.query), customFrom(req.query), customTo(req.query));
  return success(res, { series: orderSeries });
});

export const orders = asyncHandler(async (req, res) => {
  const { orderSeries, recentOrders } = await getSeries(rangeFromReq(req.query), customFrom(req.query), customTo(req.query));
  return success(res, { series: orderSeries, recentOrders });
});

export const products = asyncHandler(async (req, res) => {
  const [performance, top] = await Promise.all([
    getProductPerformance(rangeFromReq(req.query), customFrom(req.query), customTo(req.query)),
    getTopProductsAllTime(10),
  ]);
  return success(res, { performance, top });
});

export const brands = asyncHandler(async (req, res) => {
  const data = await getBrandPerformance(rangeFromReq(req.query), customFrom(req.query), customTo(req.query));
  return success(res, { brands: data });
});

export const categories = asyncHandler(async (req, res) => {
  const data = await getCategoryPerformance(rangeFromReq(req.query), customFrom(req.query), customTo(req.query));
  return success(res, { categories: data });
});

export const customers = asyncHandler(async (req, res) => {
  const [growth] = await Promise.all([getCustomerGrowth(rangeFromReq(req.query), customFrom(req.query), customTo(req.query))]);
  return success(res, { growth });
});

export const offers = asyncHandler(async (_req, res) => {
  const data = await getOfferPerformance();
  return success(res, { offers: data });
});