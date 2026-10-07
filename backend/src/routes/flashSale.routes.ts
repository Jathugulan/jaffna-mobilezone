import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticate, adminOnly } from "../middleware/auth.middleware";
import { Offer } from "../models/Offer";
import { flashSaleSchema, flashSaleUpdateSchema } from "../validators/offer.validator";
import { idParamsSchema } from "../validators/catalog.validator";
import { success } from "../utils/response";
import { notFound } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { recordAudit } from "../services/audit.service";
import { extractIp } from "../utils/helpers";
import type { AuthedRequest } from "../types/express";

const router = Router();

const flashType = "flashSale";

const asFlash = (d: Record<string, unknown>) => ({ ...d, type: flashType });

router.get("/", asyncHandler(async (_req, res) => {
  const now = new Date();
  const all = await Offer.find({ type: flashType })
    .sort({ endDate: 1 })
    .populate("products", "name slug images price offerPrice stock")
    .lean();
  const normalized = all.map((o) => ({ ...o, active: Boolean(o.active) && new Date(o.endDate).getTime() > now.getTime() }));
  return success(res, { offers: normalized });
}));

router.get("/active", asyncHandler(async (_req, res) => {
  const now = new Date();
  const offers = await Offer.find({
    type: flashType,
    active: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .sort({ endDate: 1 })
    .populate("products", "name slug images price offerPrice stock")
    .lean();
  return success(res, { offers });
}));

router.post("/", authenticate, adminOnly, validate(flashSaleSchema), asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;
  const offer = await Offer.create(asFlash(body));
  await recordAudit({ admin: req.user!._id, action: "create", resource: "flashSale", resourceId: offer._id, ipAddress: extractIp(req) });
  return success(res, { offer }, undefined, 201);
}));

router.put("/:id", authenticate, adminOnly, validate(idParamsSchema, "params"), validate(flashSaleUpdateSchema), asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw notFound("Flash sale not found");
  Object.assign(offer, asFlash(body));
  await offer.save();
  await recordAudit({ admin: req.user!._id, action: "update", resource: "flashSale", resourceId: offer._id, ipAddress: extractIp(req) });
  return success(res, { offer });
}));

router.delete("/:id", authenticate, adminOnly, validate(idParamsSchema, "params"), asyncHandler(async (req: AuthedRequest, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw notFound("Flash sale not found");
  await offer.deleteOne();
  return success(res, { message: "Flash sale deleted" });
}));

export default router;