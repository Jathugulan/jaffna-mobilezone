import mongoose from "mongoose";
import { Product } from "../models/Product";
import { Brand } from "../models/Brand";
import { Category } from "../models/Category";
import { asyncHandler } from "../utils/asyncHandler";
import { success, paginated } from "../utils/response";
import { notFound } from "../utils/ApiError";
import {
  findProducts,
  getProductByIdOrThrow,
  getPublishedProductBySlug,
  incrementViewCount,
  ensureUniqueSlugSku,
  applyProductDerivedFields,
  applyOfferPricing,
} from "../services/product.service";
import { recordAudit } from "../services/audit.service";
import { Review } from "../models/Review";
import { extractIp } from "../utils/helpers";
import type { AuthedRequest } from "../types/express";
import type { ProductQuery } from "../types";
import { validatedQuery } from "../middleware/validate.middleware";

export const listProducts = asyncHandler(async (req, res) => {
  const q = validatedQuery<ProductQuery>(req);
  const page = Math.max(1, Number(q.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(q.limit) || 20));
  const adminView = req.user?.role === "admin";

  const result = await findProducts({ ...q, page, limit }, !adminView);
  return paginated(res, result.data.map((p) => applyDerivedLean(p)), result.pagination);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await getProductByIdOrThrow(req.params.id);
  return success(res, { product: applyProductDerivedFields(product) });
});

export const getProductBySlug = asyncHandler(async (req: AuthedRequest, res) => {
  const product = await getPublishedProductBySlug(req.params.slug);
  void req.user;
  await incrementViewCount(product._id.toString());
  const reviews = await Review.find({ product: product._id, status: "approved" })
    .sort({ createdAt: -1 })
    .populate("user", "username profilePicture")
    .select("rating comment createdAt verifiedPurchase user")
    .lean();
  const ratingAvg = reviews.length ? reviews.reduce((s: number, r) => s + r.rating, 0) / reviews.length : 0;
  return success(res, {
    product: { ...applyDerivedLean(product.toObject()), ratingAverage: Number(ratingAvg.toFixed(1)), reviewCount: reviews.length },
    reviews,
  });
});

export const getByBrandSlug = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ slug: req.params.slug });
  if (!brand) throw notFound("Brand not found");
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const q = req.query as unknown as ProductQuery;
  const result = await findProducts({ ...q, brand: brand.slug, page, limit }, true);
  return paginated(res, result.data.map(applyDerivedLean), result.pagination);
});

export const searchProducts = asyncHandler(async (req, res) => {
  const q = (req.query.q as string) ?? "";
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const result = await findProducts({ ...(req.query as unknown as ProductQuery), q, page, limit }, true);
  return paginated(res, result.data.map(applyDerivedLean), result.pagination);
});

export const createProduct = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body as Record<string, unknown>;
  const name = String(body.name);
  const slug = await ensureUniqueSlugSku(name, (body.slug as string) || undefined, String(body.sku));

  const price = Number(body.price);
  const offerPrice = body.offerPrice === undefined || body.offerPrice === null ? null : Number(body.offerPrice);
  const pricing = applyOfferPricing(price, offerPrice);

  const { design, ...rest } = deriveFields(body);
  void design;

  const product = await Product.create({
    ...rest,
    name,
    slug,
    price,
    offerPrice,
    discountPercentage: pricing.discountPercentage,
  });

  await recordAudit({
    admin: req.user!._id,
    action: "create",
    resource: "product",
    resourceId: product._id,
    metadata: { name },
    ipAddress: extractIp(req),
  });

  return success(res, { product: applyProductDerivedFields(product) }, undefined, 201);
});

export const updateProduct = asyncHandler(async (req: AuthedRequest, res) => {
  const product = await getProductByIdOrThrow(req.params.id);
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body as Record<string, unknown>;

  if (body.name || body.slug || body.sku) {
    const slug = await ensureUniqueSlugSku(
      String(body.name ?? product.name),
      (body.slug as string) || product.slug,
      String(body.sku ?? product.sku),
      product._id.toString()
    );
    product.slug = slug;
  }

  if (body.price !== undefined || body.offerPrice !== undefined) {
    const price = body.price === undefined ? product.price : Number(body.price);
    const offerPrice = body.offerPrice === undefined || body.offerPrice === null ? product.offerPrice : Number(body.offerPrice);
    const pricing = applyOfferPricing(price, offerPrice);
    product.price = price;
    product.offerPrice = offerPrice;
    product.discountPercentage = pricing.discountPercentage;
  }

  const { design, ...rest } = deriveFields(body);
  void design;

  Object.assign(product, rest);
  await product.save();

  await recordAudit({
    admin: req.user!._id,
    action: "update",
    resource: "product",
    resourceId: product._id,
    ipAddress: extractIp(req),
  });

  return success(res, { product: applyProductDerivedFields(product) });
});

export const deleteProduct = asyncHandler(async (req: AuthedRequest, res) => {
  const product = await getProductByIdOrThrow(req.params.id);
  await product.deleteOne();
  await recordAudit({
    admin: req.user!._id,
    action: "delete",
    resource: "product",
    resourceId: product._id,
    ipAddress: extractIp(req),
  });
  return success(res, { message: "Product deleted" });
});

export const duplicateProduct = asyncHandler(async (req: AuthedRequest, res) => {
  const source = await getProductByIdOrThrow(req.params.id);
  const slug = await ensureUniqueSlugSku(`${source.name} copy`, undefined, `${source.sku}-COPY`);
  const copy = await Product.create({
    ...source.toObject(),
    _id: new mongoose.Types.ObjectId(),
    name: `${source.name} copy`,
    slug,
    sku: `${source.sku}-COPY`,
    stock: 0,
    viewCount: 0,
    salesCount: 0,
    published: false,
  });
  await recordAudit({
    admin: req.user!._id,
    action: "duplicate",
    resource: "product",
    resourceId: copy._id,
    ipAddress: extractIp(req),
  });
  return success(res, { product: applyProductDerivedFields(copy) }, undefined, 201);
});

export const togglePublish = asyncHandler(async (req: AuthedRequest, res) => {
  const product = await getProductByIdOrThrow(req.params.id);
  product.published = !product.published;
  await product.save();
  return success(res, { product: applyProductDerivedFields(product), published: product.published });
});

function deriveFields(body: Record<string, unknown>): {
  design?: Record<string, unknown>;
  specifications?: Record<string, unknown>;
  [key: string]: unknown;
} {
  const specs = (body.specifications ?? {}) as Record<string, unknown>;
  return {
    brand: new mongoose.Types.ObjectId(String(body.brand)),
    category: new mongoose.Types.ObjectId(String(body.category)),
    description: (body.description as string) ?? "",
    images: (body.images as string[]) ?? [],
    sku: body.sku as string,
    stock: Number(body.stock ?? 0),
    specifications: {
      ram: (specs.ram as string) ?? "",
      storage: (specs.storage as string) ?? "",
      display: (specs.display as string) ?? "",
      processor: (specs.processor as string) ?? "",
      camera: (specs.camera as string) ?? "",
      battery: (specs.battery as string) ?? "",
      operatingSystem: (specs.operatingSystem as string) ?? "",
      supports5G: Boolean(specs.supports5G),
    },
    colors: (body.colors as string[]) ?? [],
    variants: (body.variants as Array<Record<string, unknown>>) ?? [],
    warranty: (body.warranty as string) ?? "",
    featured: Boolean(body.featured),
    newArrival: Boolean(body.newArrival),
    bestSeller: Boolean(body.bestSeller),
    deal: Boolean(body.deal),
    published: body.published === undefined ? true : Boolean(body.published),
  };
}

function applyDerivedLean<T extends { price: number; offerPrice?: number | null; discountPercentage?: number }>(doc: T) {
  return applyProductDerivedFields(doc);
}