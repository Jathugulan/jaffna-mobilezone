import { Brand } from "../models/Brand";
import { Product } from "../models/Product";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import { conflict, notFound } from "../utils/ApiError";
import { slugify, extractIp } from "../utils/helpers";
import { recordAudit } from "../services/audit.service";
import type { AuthedRequest } from "../types/express";
import type { ProductQuery } from "../types";
import { findProducts } from "../services/product.service";

export const listBrands = asyncHandler(async (_req, res) => {
  const brands = await Brand.find().sort({ displayOrder: 1, name: 1 }).lean();
  const withCounts = await Promise.all(
    brands.map(async (b) => {
      const productCount = await Product.countDocuments({ brand: b._id, published: true });
      return { ...b, productCount };
    })
  );
  return success(res, { brands: withCounts });
});

export const getBrandById = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) throw notFound("Brand not found");
  return success(res, { brand });
});

export const getBrandBySlug = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ slug: req.params.slug });
  if (!brand) throw notFound("Brand not found");
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const result = await findProducts({ ...(req.query as unknown as ProductQuery), brand: brand.slug, page, limit }, true);
  return success(res, {
    brand: { ...brand.toObject(), productCount: result.pagination.total },
    products: result.data,
    pagination: result.pagination,
  });
});

export const createBrand = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;
  const slug = slugify(String(body.name));
  const existing = await Brand.findOne({ slug });
  if (existing) throw conflict(`A brand with slug "${slug}" already exists`);

  const brand = await Brand.create({
    name: body.name,
    slug,
    logoUrl: body.logoUrl || null,
    bannerUrl: body.bannerUrl || null,
    cardImageUrl: body.cardImageUrl || null,
    description: body.description ?? "",
    featured: Boolean(body.featured),
    active: body.active === undefined ? true : Boolean(body.active),
    displayOrder: Number(body.displayOrder ?? 0),
  });

  await recordAudit({ admin: req.user!._id, action: "create", resource: "brand", resourceId: brand._id, ipAddress: extractIp(req) });
  return success(res, { brand }, undefined, 201);
});

export const updateBrand = asyncHandler(async (req: AuthedRequest, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) throw notFound("Brand not found");
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;

  if (body.name && body.name !== brand.name) {
    brand.slug = slugify(String(body.name));
  }
  if (body.slug) brand.slug = slugify(String(body.slug));
  delete body.slug;

  const { fields, slug: finalSlug } = { fields: body, slug: brand.slug };
  const dup = finalSlug ? await Brand.findOne({ slug: finalSlug, _id: { $ne: brand._id } }).select("_id").lean() : null;
  if (dup) throw conflict(`A brand with slug "${finalSlug}" already exists`);

  Object.assign(brand, fields, { slug: finalSlug });
  await brand.save();

  await recordAudit({ admin: req.user!._id, action: "update", resource: "brand", resourceId: brand._id, ipAddress: extractIp(req) });
  return success(res, { brand });
});

export const deleteBrand = asyncHandler(async (req: AuthedRequest, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) throw notFound("Brand not found");
  const productCount = await Product.countDocuments({ brand: brand._id });
  if (productCount > 0) {
    throw conflict(`Cannot delete brand "${brand.name}" with ${productCount} associated products`);
  }
  await brand.deleteOne();
  await recordAudit({ admin: req.user!._id, action: "delete", resource: "brand", resourceId: brand._id, ipAddress: extractIp(req) });
  return success(res, { message: "Brand deleted" });
});

export const reorderBrands = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req.body ?? {}) as { ids?: string[] };
  const ids = body.ids ?? [];
  for (let i = 0; i < ids.length; i += 1) {
    await Brand.updateOne({ _id: ids[i] }, { $set: { displayOrder: i } });
  }
  await recordAudit({ admin: req.user!._id, action: "reorder", resource: "brand", ipAddress: extractIp(req) });
  return success(res, { message: "Brands reordered" });
});

export const getBrandProducts = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ slug: req.params.slug });
  if (!brand) throw notFound("Brand not found");
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const result = await findProducts({ ...(req.query as unknown as ProductQuery), brand: brand.slug, page, limit }, true);
  return success(res, { brand: { ...brand.toObject(), productCount: result.pagination.total }, products: result.data, pagination: result.pagination });
});