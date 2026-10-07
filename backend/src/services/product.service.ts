import type { FilterQuery, FlattenMaps, Types } from "mongoose";
import { Product, type IProduct } from "../models/Product";
import { Brand } from "../models/Brand";
import { Category } from "../models/Category";
import type { ProductQuery, PaginationResult } from "../types";
import { ApiError, badRequest } from "../utils/ApiError";
import { discountFrom, slugify } from "../utils/helpers";
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "../constants";

export function computeDiscount(price: number, offerPrice: number | null | undefined): number {
  if (offerPrice === undefined || offerPrice === null) return 0;
  return discountFrom(price, offerPrice);
}

export function applyProductDerivedFields<T>(doc: T & { offerPrice?: number | null; price?: number; discountPercentage?: number }): T {
  if (doc.price !== undefined) {
    doc.discountPercentage = computeDiscount(doc.price, doc.offerPrice);
  }
  return doc;
}

export interface BuiltProductQuery {
  filter: FilterQuery<IProduct>;
  sort: Record<string, 1 | -1>;
}

/** Query params arrive as strings ("true"/"false") from the URL. */
function queryBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  return String(value) === "true";
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function buildProductQuery(query: ProductQuery): Promise<BuiltProductQuery> {
  const filter: FilterQuery<IProduct> = {};

  if (query.q) {
    filter.$text = { $search: query.q };
  }

  if (query.brand) {
    const brands = Array.isArray(query.brand) ? query.brand : [query.brand];
    const brandIds = await Brand.find({ slug: { $in: brands } }).select("_id").lean();
    filter.brand = { $in: brandIds.map((b) => b._id) };
  }

  if (query.category) {
    const categories = Array.isArray(query.category) ? query.category : [query.category];
    const categoryIds = await Category.find({ slug: { $in: categories } }).select("_id").lean();
    filter.category = { $in: categoryIds.map((c) => c._id) };
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.$or = [
      { offerPrice: { $gte: query.minPrice ?? 0, ...(query.maxPrice !== undefined ? { $lte: query.maxPrice } : {}) } },
      {
        $and: [
          { offerPrice: { $eq: null } },
          { price: { $gte: query.minPrice ?? 0, ...(query.maxPrice !== undefined ? { $lte: query.maxPrice } : {}) } },
        ],
      },
    ];
  }

  if (query.ram) filter["specifications.ram"] = new RegExp(escapeRegex(query.ram), "i");
  if (query.storage) filter["specifications.storage"] = new RegExp(`^${escapeRegex(query.storage)}`, "i");
  if (query.rating) filter.ratingAverage = { $gte: query.rating };
  if (query.supports5G !== undefined) filter["specifications.supports5G"] = queryBool(query.supports5G);
  if (queryBool(query.inStock) === true) filter.stock = { $gt: 0 };
  if (queryBool(query.onOffer) === true) filter.offerPrice = { $ne: null, $gt: 0 };
  if (queryBool(query.featured) === true) filter.featured = true;
  if (queryBool(query.newArrival) === true) filter.newArrival = true;
  if (queryBool(query.bestSeller) === true) filter.bestSeller = true;
  if (queryBool(query.deal) === true) filter.deal = true;
  if (query.published !== undefined) filter.published = queryBool(query.published);

  const sort: Record<string, 1 | -1> = { _id: -1 };
  switch (query.sort) {
    case "newest":
      sort.createdAt = -1;
      break;
    case "priceAsc":
      sort.price = 1;
      break;
    case "priceDesc":
      sort.price = -1;
      break;
    case "rating":
      sort.ratingAverage = -1;
      break;
    case "popular":
      sort.salesCount = -1;
      break;
    case "discount":
      sort.discountPercentage = -1;
      break;
    case "name":
      sort.name = 1;
      break;
    case "featured":
      sort.featured = -1;
      sort.createdAt = -1;
      break;
    default:
      break;
  }

  return { filter, sort };
}

export async function findProducts(query: ProductQuery, onlyPublished = true): Promise<PaginationResult<IProduct>> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const { filter, sort } = await buildProductQuery(query);

  if (onlyPublished) filter.published = true;

  const [data, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("brand", "name slug logoUrl")
      .populate("category", "name slug")
      .lean() as Promise<Array<FlattenMaps<IProduct> & { _id: Types.ObjectId }>>,
    Product.countDocuments(filter),
  ]);

  return {
    data: data as unknown as IProduct[],
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export async function getPublishedProductBySlug(slug: string): Promise<IProduct> {
  const product = await Product.findOne({ slug, published: true })
    .populate("brand", "name slug logoUrl bannerUrl")
    .populate("category", "name slug");
  if (!product) throw new ApiError(404, "Product not found", "PRODUCT_NOT_FOUND");
  return product;
}

export async function getProductByIdOrThrow(id: string): Promise<IProduct> {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found", "PRODUCT_NOT_FOUND");
  return product;
}

export async function incrementViewCount(id: string): Promise<void> {
  await Product.updateOne({ _id: id }, { $inc: { viewCount: 1 } });
}

export async function ensureUniqueSlugSku(name: string, slug: string | undefined, sku: string, excludeId?: string): Promise<string> {
  const baseSlug = slug ?? slugify(name);
  const where: FilterQuery<IProduct> = { slug: baseSlug };
  if (excludeId) where._id = { $ne: excludeId };
  const duplicate = await Product.findOne(where).select("_id").lean();
  if (duplicate) {
    throw badRequest(`A product with slug "${baseSlug}" already exists`);
  }
  const skuCheck = await Product.findOne({ sku, ...(excludeId ? { _id: { $ne: excludeId } } : {}) }).select("_id").lean();
  if (skuCheck) {
    throw badRequest(`A product with SKU "${sku}" already exists`);
  }
  return baseSlug;
}

export function applyOfferPricing(price: number, offerPrice: number | null | undefined): {
  price: number;
  offerPrice: number | null;
  discountPercentage: number;
} {
  return {
    price,
    offerPrice: offerPrice ?? null,
    discountPercentage: computeDiscount(price, offerPrice),
  };
}

export function deliveryFeeFor(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}