import { z } from "zod";
import { OFFER_TYPES, DISCOUNT_TYPES } from "../constants";
import { objectIdSchema } from "./catalog.validator";

const offerFields = {
  name: z.string().min(2).max(160),
  description: z.string().max(2000).optional().or(z.literal("")),
  type: z.enum(OFFER_TYPES),
  discountType: z.enum(DISCOUNT_TYPES),
  discountValue: z.number().min(0, "Discount value cannot be negative"),
  products: z.array(objectIdSchema).max(500).default([]),
  brands: z.array(objectIdSchema).max(100).default([]),
  categories: z.array(objectIdSchema).max(100).default([]),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  active: z.boolean().default(true),
};

const offerObject = z.object(offerFields).strict();

const withDates = (schema: z.ZodObject<z.ZodRawShape>) =>
  schema.refine((data) => data.endDate.getTime() > data.startDate.getTime(), {
    path: ["endDate"],
    message: "End date must be after start date",
  });

export const offerSchema = withDates(offerObject);
export const offerUpdateSchema = withDates(offerObject.partial());

const flashSaleObject = z.object({
  name: z.string().min(2).max(160),
  description: z.string().max(2000).optional().or(z.literal("")),
  discountType: z.enum(DISCOUNT_TYPES),
  discountValue: z.number().min(0),
  products: z.array(objectIdSchema).max(500).default([]),
  brands: z.array(objectIdSchema).max(100).default([]),
  categories: z.array(objectIdSchema).max(100).default([]),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  active: z.boolean().default(true),
}).strict();

export const flashSaleSchema = withDates(flashSaleObject);
export const flashSaleUpdateSchema = withDates(flashSaleObject.partial());

export const couponSchema = z
  .object({
    code: z.string().min(3).max(40).toUpperCase(),
    type: z.enum(DISCOUNT_TYPES),
    value: z.number().min(0),
    minOrder: z.number().min(0).default(0),
    maxDiscount: z.number().min(0).nullable().optional(),
    maxUses: z.number().int().min(1).nullable().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    active: z.boolean().default(true),
  })
  .strict();

export const applyCouponSchema = z.object({ code: z.string().min(3).max(40) }).strict();