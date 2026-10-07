import { Offer, type IOffer } from "../models/Offer";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import { extractIp } from "../utils/helpers";
import { recordAudit } from "../services/audit.service";
import { notFound } from "../utils/ApiError";
import type { AuthedRequest } from "../types/express";

function normalizeTiming(body: Record<string, unknown>) {
  const active =
    body.active === undefined
      ? true
      : Boolean(body.active);
  const start = body.startDate ? new Date(String(body.startDate)) : new Date();
  const end = body.endDate ? new Date(String(body.endDate)) : new Date(Date.now() + 7 * 24 * 3600 * 1000);
  return { active, start, end };
}

function autoDeactivate(offers: Array<{ active: boolean; startDate?: Date | null; endDate: Date }>) {
  const now = Date.now();
  return offers.map((o) => ({ ...o, active: o.active && new Date(o.endDate).getTime() > now }));
}

export const listOffers = asyncHandler(async (req, res) => {
const all = await Offer.find()
    .sort({ createdAt: -1 })
    .populate("products", "name slug images price offerPrice")
    .populate("brands", "name slug")
    .populate("categories", "name slug")
    .lean();
  const normalized = autoDeactivate(all as never);
  const now = Date.now();
  const active = normalized.filter((o) => o.active);
  const scheduled = normalized.filter((o) => o.startDate && new Date(o.startDate).getTime() > now && !o.active);
  const expired = normalized.filter((o) => new Date(o.endDate as Date).getTime() <= now);

  if (req.query.all === undefined) {
    return success(res, { offers: normalized, counts: { active: active.length, scheduled: scheduled.length, expired: expired.length } });
  }
  return success(res, { offers: normalized, counts: { active: active.length, scheduled: scheduled.length, expired: expired.length } });
});

export const getActiveOffers = asyncHandler(async (_req, res) => {
  const now = new Date();
  const offers = await Offer.find({
    active: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .sort({ endDate: 1 })
    .populate("products", "name slug images price offerPrice")
    .populate("brands", "name slug")
    .populate("categories", "name slug")
    .lean();
  return success(res, { offers: autoDeactivate(offers as never) });
});

export const getOfferById = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id)
    .populate("products", "name slug images price offerPrice")
    .populate("brands", "name slug")
    .populate("categories", "name slug");
  if (!offer) {
    return success(res, { offer: null });
  }
  return success(res, { offer });
});

export const createOffer = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;
  const { active, start, end } = normalizeTiming(body);

  const offer = await Offer.create({
    name: body.name,
    description: body.description ?? "",
    type: body.type,
    discountType: body.discountType,
    discountValue: Number(body.discountValue),
    products: body.products ?? [],
    brands: body.brands ?? [],
    categories: body.categories ?? [],
    bannerUrl: body.bannerUrl || null,
    startDate: start,
    endDate: end,
    active,
  });
  await recordAudit({ admin: req.user!._id, action: "create", resource: "offer", resourceId: offer._id, ipAddress: extractIp(req) });
  return success(res, { offer }, undefined, 201);
});

export const updateOffer = asyncHandler(async (req: AuthedRequest, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw notFoundOffer();
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;

  const next = { ...body };
  if (body.startDate) next.startDate = new Date(String(body.startDate));
  if (body.endDate) next.endDate = new Date(String(body.endDate));

  Object.assign(offer, next);
  await offer.save();
  await recordAudit({ admin: req.user!._id, action: "update", resource: "offer", resourceId: offer._id, ipAddress: extractIp(req) });
  return success(res, { offer });
});

export const deleteOffer = asyncHandler(async (req: AuthedRequest, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw notFoundOffer();
  await offer.deleteOne();
  await recordAudit({ admin: req.user!._id, action: "delete", resource: "offer", resourceId: offer._id, ipAddress: extractIp(req) });
  return success(res, { message: "Offer deleted" });
});

export const toggleOfferActive = asyncHandler(async (req: AuthedRequest, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw notFoundOffer();
  offer.active = !offer.active;
  await offer.save();
  return success(res, { offer, active: offer.active });
});

export const duplicateOffer = asyncHandler(async (req: AuthedRequest, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw notFoundOffer();
  const copy = await Offer.create({
    ...offer.toObject(),
    _id: undefined,
    name: `${offer.name} (copy)`,
    active: false,
    createdAt: undefined,
    updatedAt: undefined,
  });
  return success(res, { offer: copy }, undefined, 201);
});

function notFoundOffer() {
  return notFound("Offer not found");
}

export function isExpired(offer: IOffer): boolean {
  return new Date(offer.endDate).getTime() < Date.now();
}

export async function refreshOfferAutoStatus(): Promise<void> {
  const now = new Date();
  await Offer.updateMany(
    { active: true, endDate: { $lt: now } },
    { $set: { active: false } }
  );
}
