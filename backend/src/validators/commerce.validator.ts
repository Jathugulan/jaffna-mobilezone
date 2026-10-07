import { z } from "zod";
import { objectIdSchema } from "./catalog.validator";

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  addressLine1: z.string().min(3).max(200),
  addressLine2: z.string().max(200).optional().default(""),
  city: z.string().min(2).max(100),
  district: z.string().min(2).max(100),
  postalCode: z.string().max(20).optional().default(""),
  deliveryInstructions: z.string().max(500).optional().default(""),
});

export const orderItemSchema = z.object({
  product: objectIdSchema,
  quantity: z.number().int().min(1).max(99),
  variant: z.record(z.unknown()).nullish(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
  shippingAddressId: objectIdSchema.optional(),
  shippingAddress: shippingAddressSchema.optional(),
  couponCode: z.string().max(40).optional().or(z.literal("")),
  paymentMethod: z.string().max(50).optional().default("cod"),
}).strict();

export const cancelOrderSchema = z.object({
  reason: z.string().max(500).optional().default(""),
}).strict();

export const returnOrderSchema = z.object({
  reason: z.string().min(5).max(1000),
}).strict();

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum([
    "pending",
    "confirmed",
    "processing",
    "packed",
    "shipped",
    "outForDelivery",
    "delivered",
    "cancelled",
    "returned",
    "refunded",
  ]),
  note: z.string().max(500).optional().default(""),
}).strict();

export const addressSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  addressLine1: z.string().min(3).max(200),
  addressLine2: z.string().max(200).optional().default(""),
  city: z.string().min(2).max(100),
  district: z.string().min(2).max(100),
  province: z.string().max(100).optional().default(""),
  postalCode: z.string().max(20).optional().default(""),
  deliveryInstructions: z.string().max(500).optional().default(""),
  isDefault: z.boolean().default(false),
}).strict();

export const addressUpdateSchema = addressSchema.partial().strict();

export const cartItemSchema = z.object({
  product: objectIdSchema,
  quantity: z.number().int().min(1).max(99),
  variant: z.record(z.unknown()).nullish(),
}).strict();

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(99),
}).strict();

export const wishlistParamsSchema = z.object({ productId: objectIdSchema });

export const reviewSchema = z.object({
  product: objectIdSchema,
  order: objectIdSchema.optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, "Review must be at least 5 characters").max(2000),
}).strict();

export const reviewUpdateSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().min(5).max(2000).optional(),
  })
  .strict();

export const reviewStatusSchema = z
  .object({
    status: z.enum(["pending", "approved", "hidden"]),
  })
  .strict();

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().max(200).optional(),
  orderStatus: z.string().optional(),
  paymentStatus: z.string().optional(),
  sort: z.string().optional(),
});