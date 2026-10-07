import { z } from "zod";

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");

export const idParamsSchema = z.object({ id: objectIdSchema });
export const slugParamsSchema = z.object({ slug: slugSchema });

const baseProductSchema = z.object({
  name: z.string().min(2, "Product name is required").max(160),
  slug: slugSchema.optional(),
  brand: objectIdSchema,
  category: objectIdSchema,
  description: z.string().max(10000).default(""),
  images: z.array(z.string().url().max(2048)).max(12).default([]),
  price: z.number().min(0, "Price cannot be negative"),
  offerPrice: z.number().min(0).nullable().optional(),
  sku: z.string().min(1).max(100),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  specifications: z
    .object({
      ram: z.string().default(""),
      storage: z.string().default(""),
      display: z.string().default(""),
      processor: z.string().default(""),
      camera: z.string().default(""),
      battery: z.string().default(""),
      operatingSystem: z.string().default(""),
      supports5G: z.boolean().default(false),
    })
    .partial()
    .default({}),
  colors: z.array(z.string()).max(20).default([]),
  variants: z
    .array(
      z.object({
        name: z.string().min(1),
        sku: z.string().optional(),
        price: z.number().min(0).optional(),
        offerPrice: z.number().min(0).optional(),
        stock: z.number().int().min(0).optional(),
        attributes: z.record(z.unknown()).default({}),
      })
    )
    .max(50)
    .default([]),
  warranty: z.string().max(200).default(""),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  deal: z.boolean().default(false),
  published: z.boolean().default(true),
});

export const createProductSchema = baseProductSchema
  .strict()
  .refine((data) => data.offerPrice === null || data.offerPrice === undefined || data.offerPrice <= data.price, {
    path: ["offerPrice"],
    message: "Offer price must be less than or equal to regular price",
  });

export const updateProductSchema = baseProductSchema
  .partial()
  .strict()
  .refine(
    (data) => data.price === undefined || data.offerPrice === undefined || data.offerPrice === null || data.offerPrice! <= data.price!,
    { path: ["offerPrice"], message: "Offer price must be less than or equal to regular price" }
  );

export const productQuerySchema = z.object({
  q: z.string().max(200).optional(),
  brand: z.string().or(z.array(z.string())).optional(),
  category: z.string().or(z.array(z.string())).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  inStock: z.enum(["true", "false"]).optional(),
  onOffer: z.enum(["true", "false"]).optional(),
  featured: z.enum(["true", "false"]).optional(),
  newArrival: z.enum(["true", "false"]).optional(),
  bestSeller: z.enum(["true", "false"]).optional(),
  deal: z.enum(["true", "false"]).optional(),
  published: z.enum(["true", "false"]).optional(),
  supports5G: z.enum(["true", "false"]).optional(),
  sort: z
    .enum(["featured", "newest", "priceAsc", "priceDesc", "rating", "popular", "discount", "name"])
    .optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const brandSchema = z.object({
  name: z.string().min(2).max(80),
  slug: slugSchema.optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  cardImageUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  displayOrder: z.number().int().optional(),
}).strict();

export const brandUpdateSchema = brandSchema.partial().strict();

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: slugSchema.optional(),
  description: z.string().max(2000).optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  active: z.boolean().default(true),
  displayOrder: z.number().int().optional(),
}).strict();

export const categoryUpdateSchema = categorySchema.partial().strict();