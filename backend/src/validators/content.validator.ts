import { z } from "zod";
import { HOMEPAGE_SECTION_KEYS } from "../constants";

export const heroSlideSchema = z.object({
  title: z.string().min(1).max(160),
  subtitle: z.string().max(300).optional().or(z.literal("")),
  description: z.string().max(1000).optional().or(z.literal("")),
  desktopImageUrl: z.string().url().optional().or(z.literal("")),
  mobileImageUrl: z.string().url().optional().or(z.literal("")),
  ctaText: z.string().max(60).optional().or(z.literal("")),
  ctaLink: z.string().max(300).optional().default("/shop"),
  displayOrder: z.number().int().optional(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  active: z.boolean().default(true),
}).strict();

export const heroSlideUpdateSchema = heroSlideSchema.partial().strict();

export const sectionConfigSchema = z.object({
  key: z.enum(HOMEPAGE_SECTION_KEYS),
  title: z.string().max(200).optional(),
  enabled: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  configuration: z.record(z.unknown()).optional(),
}).strict();

export const homepageUpdateSchema = z.object({
  sections: z.array(sectionConfigSchema).min(1),
}).strict();

export const testimonialsSchema = z.object({
  name: z.string().min(2).max(100),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(5).max(1000),
  role: z.string().max(100).optional().or(z.literal("")),
  productName: z.string().max(160).optional().or(z.literal("")),
  verified: z.boolean().default(true),
  active: z.boolean().default(true),
  displayOrder: z.number().int().optional(),
}).strict();

export const testimonialsUpdateSchema = testimonialsSchema.partial().strict();

export const faqSchema = z.object({
  question: z.string().min(3).max(300),
  answer: z.string().min(5).max(3000),
  category: z.string().max(100).optional().default("General"),
  active: z.boolean().default(true),
  displayOrder: z.number().int().optional(),
}).strict();

export const faqUpdateSchema = faqSchema.partial().strict();

export const newsletterSchema = z.object({
  email: z.string().email().toLowerCase(),
}).strict();

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional().or(z.literal("")),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(3000),
}).strict();

export const analyticsQuerySchema = z.object({
  range: z.enum(["today", "7d", "30d", "3m", "1y", "custom"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
}).strict();

const aiProductAssistantSchema = z.object({
  query: z.string().min(2).max(500),
}).strict();

const aiAdminSchema = z.object({
  query: z.string().min(2).max(500),
}).strict();

export const aiQueryValidator = {
  productAssistant: aiProductAssistantSchema,
  search: z.object({ query: z.string().min(1).max(300) }).strict(),
  compare: z.object({
    productIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(2).max(4),
    question: z.string().max(500).optional().default("Compare these phones and recommend the best one for me."),
  }).strict(),
  recommendations: z.object({
    limit: z.number().int().min(1).max(20).optional(),
  }).strict(),
  orderAssistant: z.object({ query: z.string().min(2).max(500) }).strict(),
  businessAssistant: aiAdminSchema,
};