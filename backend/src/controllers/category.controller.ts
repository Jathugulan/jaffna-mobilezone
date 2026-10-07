import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import { conflict, notFound } from "../utils/ApiError";
import { slugify, extractIp } from "../utils/helpers";
import { recordAudit } from "../services/audit.service";
import type { AuthedRequest } from "../types/express";

export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ displayOrder: 1, name: 1 }).lean();
  const withCounts = await Promise.all(
    categories.map(async (c) => {
      const productCount = await Product.countDocuments({ category: c._id, published: true });
      return { ...c, productCount };
    })
  );
  return success(res, { categories: withCounts });
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) throw notFound("Category not found");
  return success(res, { category });
});

export const createCategory = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;
  const slug = slugify(String(body.name));
  const existing = await Category.findOne({ slug });
  if (existing) throw conflict(`A category with slug "${slug}" already exists`);

  const category = await Category.create({
    name: body.name,
    slug,
    description: body.description ?? "",
    imageUrl: body.imageUrl || null,
    active: body.active === undefined ? true : Boolean(body.active),
    displayOrder: Number(body.displayOrder ?? 0),
  });
  await recordAudit({ admin: req.user!._id, action: "create", resource: "category", resourceId: category._id, ipAddress: extractIp(req) });
  return success(res, { category }, undefined, 201);
});

export const updateCategory = asyncHandler(async (req: AuthedRequest, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw notFound("Category not found");
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;

  if (body.name && body.name !== category.name) category.slug = slugify(String(body.name));
  if (body.slug) category.slug = slugify(String(body.slug));
  delete body.slug;

  const dup = await Category.findOne({ slug: category.slug, _id: { $ne: category._id } }).select("_id").lean();
  if (dup) throw conflict(`A category with slug "${category.slug}" already exists`);

  Object.assign(category, body, { slug: category.slug });
  await category.save();
  await recordAudit({ admin: req.user!._id, action: "update", resource: "category", resourceId: category._id, ipAddress: extractIp(req) });
  return success(res, { category });
});

export const deleteCategory = asyncHandler(async (req: AuthedRequest, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw notFound("Category not found");
  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    throw conflict(`Cannot delete category "${category.name}" with ${productCount} associated products`);
  }
  await category.deleteOne();
  await recordAudit({ admin: req.user!._id, action: "delete", resource: "category", resourceId: category._id, ipAddress: extractIp(req) });
  return success(res, { message: "Category deleted" });
});

export const reorderCategories = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req.body ?? {}) as { ids?: string[] };
  const ids = body.ids ?? [];
  for (let i = 0; i < ids.length; i += 1) {
    await Category.updateOne({ _id: ids[i] }, { $set: { displayOrder: i } });
  }
  return success(res, { message: "Categories reordered" });
});