import { HeroSlide } from "../models/HeroSlide";
import { HomepageSection } from "../models/HomepageSection";
import { Testimonial } from "../models/Testimonial";
import { FAQ } from "../models/FAQ";
import { Product } from "../models/Product";
import { Brand } from "../models/Brand";
import { Category } from "../models/Category";
import { Offer } from "../models/Offer";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import { notFound } from "../utils/ApiError";
import { HOMEPAGE_SECTION_KEYS } from "../constants";
import type { AuthedRequest } from "../types/express";
import { recordAudit } from "../services/audit.service";
import { extractIp } from "../utils/helpers";
import { findProducts } from "../services/product.service";

// ---------- Public Homepage ----------

export const getHomepage = asyncHandler(async (_req, res) => {
  const now = new Date();

  const [sections, slides, testimonials, faqs, categories, brands, offers] = await Promise.all([
    HomepageSection.find().lean(),
    HeroSlide.find({
      active: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: null },
        { startDate: { $lte: now } },
      ],
      $and: [
        { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] },
      ],
    }).sort({ displayOrder: 1 }).lean(),
    Testimonial.find({ active: true }).sort({ displayOrder: 1 }).lean(),
    FAQ.find({ active: true }).sort({ displayOrder: 1 }).lean(),
    Category.find({ active: true }).sort({ displayOrder: 1 }).lean(),
    Brand.find({ active: true }).sort({ displayOrder: 1 }).lean(),
    Offer.find({ active: true, startDate: { $lte: now }, endDate: { $gte: now } }).sort({ endDate: 1 }).lean(),
  ]);

  const sectionMap = new Map(sections.map((s) => [s.key, s]));
  const keys = Object.fromEntries(HOMEPAGE_SECTION_KEYS.map((k) => [k, sectionMap.get(k) ?? { key: k, enabled: true, title: "", configuration: {}, displayOrder: 0 }])) as Record<string, Record<string, unknown>>;

  const [trending, newArrivals, bestSellers, deals, featuredBrands, featuredCategories, spotlight] = await Promise.all([
    findProducts({ featured: true, sort: "popular", limit: 12, page: 1 }, true),
    findProducts({ newArrival: true, sort: "newest", limit: 12, page: 1 }, true),
    findProducts({ bestSeller: true, sort: "popular", limit: 12, page: 1 }, true),
    findProducts({ onOffer: true, sort: "discount", limit: 12, page: 1 }, true),
    (async () => await Brand.find({ active: true, featured: true }).sort({ displayOrder: 1 }).lean())(),
    (async () => await Category.find({ active: true, featured: true }).sort({ displayOrder: 1 }).lean())(),
    (async () => await Product.findOne({ published: true }).sort({ salesCount: -1 }).populate("brand", "name slug").lean())(),
  ]);

  return success(res, {
    sections: keys,
    slides,
    testimonials,
    faqs,
    categories,
    brands,
    offers,
    products: {
      trending: trending.data,
      newArrivals: newArrivals.data,
      bestSellers: bestSellers.data,
      deals: deals.data,
    },
    spotlight,
    featuredBrands,
    featuredCategories,
  });
});

// ---------- Hero Slides ----------

export const listHeroSlides = asyncHandler(async (_req, res) => {
  const slides = await HeroSlide.find().sort({ displayOrder: 1, createdAt: -1 }).lean();
  return success(res, { slides });
});

export const createHeroSlide = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;
  const slide = await HeroSlide.create(body);
  await recordAudit({ admin: req.user!._id, action: "create", resource: "heroSlide", resourceId: slide._id, ipAddress: extractIp(req) });
  return success(res, { slide }, undefined, 201);
});

export const updateHeroSlide = asyncHandler(async (req: AuthedRequest, res) => {
  const slide = await HeroSlide.findById(req.params.id);
  if (!slide) throw notFound("Hero slide not found");
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;
  Object.assign(slide, body);
  await slide.save();
  await recordAudit({ admin: req.user!._id, action: "update", resource: "heroSlide", resourceId: slide._id, ipAddress: extractIp(req) });
  return success(res, { slide });
});

export const deleteHeroSlide = asyncHandler(async (req: AuthedRequest, res) => {
  const slide = await HeroSlide.findById(req.params.id);
  if (!slide) throw notFound("Hero slide not found");
  await slide.deleteOne();
  await recordAudit({ admin: req.user!._id, action: "delete", resource: "heroSlide", resourceId: slide._id, ipAddress: extractIp(req) });
  return success(res, { message: "Hero slide deleted" });
});

// ---------- Homepage Sections CMS ----------

export const listHomepageSections = asyncHandler(async (_req, res) => {
  const sections = await HomepageSection.find().sort({ displayOrder: 1 }).lean();
  return success(res, { sections });
});

export const updateHomepageSections = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: { sections: Array<Record<string, unknown>> } } }).validated.body;

  const results = [];
  for (const section of body.sections) {
    const updated = await HomepageSection.findOneAndUpdate(
      { key: section.key },
      {
        $set: {
          title: section.title ?? "",
          enabled: section.enabled === undefined ? true : Boolean(section.enabled),
          displayOrder: Number(section.displayOrder ?? 0),
          configuration: section.configuration ?? {},
        },
      },
      { upsert: true, new: true }
    );
    results.push(updated);
  }

  await recordAudit({ admin: req.user!._id, action: "update", resource: "homepage", ipAddress: extractIp(req) });
  return success(res, { sections: results });
});

// ---------- Testimonials ----------

export const listTestimonials = asyncHandler(async (_req, res) => {
  const testimonials = await Testimonial.find().sort({ displayOrder: 1, createdAt: -1 }).lean();
  return success(res, { testimonials });
});

export const createTestimonial = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;
  const testimonial = await Testimonial.create(body);
  await recordAudit({ admin: req.user!._id, action: "create", resource: "testimonial", resourceId: testimonial._id, ipAddress: extractIp(req) });
  return success(res, { testimonial }, undefined, 201);
});

export const updateTestimonial = asyncHandler(async (req: AuthedRequest, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) throw notFound("Testimonial not found");
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;
  Object.assign(testimonial, body);
  await testimonial.save();
  await recordAudit({ admin: req.user!._id, action: "update", resource: "testimonial", resourceId: testimonial._id, ipAddress: extractIp(req) });
  return success(res, { testimonial });
});

export const deleteTestimonial = asyncHandler(async (req: AuthedRequest, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) throw notFound("Testimonial not found");
  await testimonial.deleteOne();
  await recordAudit({ admin: req.user!._id, action: "delete", resource: "testimonial", resourceId: testimonial._id, ipAddress: extractIp(req) });
  return success(res, { message: "Testimonial deleted" });
});

// ---------- FAQ ----------

export const listFaqs = asyncHandler(async (_req, res) => {
  const faqs = await FAQ.find().sort({ displayOrder: 1, createdAt: -1 }).lean();
  return success(res, { faqs });
});

export const createFaq = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;
  const faq = await FAQ.create(body);
  await recordAudit({ admin: req.user!._id, action: "create", resource: "faq", resourceId: faq._id, ipAddress: extractIp(req) });
  return success(res, { faq }, undefined, 201);
});

export const updateFaq = asyncHandler(async (req: AuthedRequest, res) => {
  const faq = await FAQ.findById(req.params.id);
  if (!faq) throw notFound("FAQ not found");
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;
  Object.assign(faq, body);
  await faq.save();
  await recordAudit({ admin: req.user!._id, action: "update", resource: "faq", resourceId: faq._id, ipAddress: extractIp(req) });
  return success(res, { faq });
});

export const deleteFaq = asyncHandler(async (req: AuthedRequest, res) => {
  const faq = await FAQ.findById(req.params.id);
  if (!faq) throw notFound("FAQ not found");
  await faq.deleteOne();
  await recordAudit({ admin: req.user!._id, action: "delete", resource: "faq", resourceId: faq._id, ipAddress: extractIp(req) });
  return success(res, { message: "FAQ deleted" });
});

// ---------- Newsletter & Contact ----------

export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const body = (req as unknown as { validated: { body: { email: string } } }).validated.body;
  // For this deployment we acknowledge subscription without storing PII lists.
  return success(res, { message: "Subscribed successfully. Welcome to the Jaffna Mobile Zone newsletter!" }, undefined, 201);
});

export const contactForm = asyncHandler(async (req, res) => {
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;
  return success(res, { message: "Thank you! Our team will respond within 24 hours.", received: body });
});

// ---------- Static pages ----------

export const storeInfo = asyncHandler(async (_req, res) => {
  const [categories, brandCount, productCount, activeOffers] = await Promise.all([
    Category.countDocuments({ active: true }),
    Brand.countDocuments({ active: true }),
    Product.countDocuments({ published: true }),
    Offer.countDocuments({ active: true, endDate: { $gte: new Date() } }),
  ]);
  return success(res, {
    store: {
      name: "Jaffna Mobile Zone",
      tagline: "Premium Mobile Technology. Right Here in Jaffna.",
      address: "100, Main Street, Jaffna, Sri Lanka",
      phone: "+94 77 123 4567",
      whatsapp: "+94771234567",
      email: "hello@jaffnamobilezone.lk",
      hours: "Mon – Sat · 9:00 AM – 8:00 PM",
      mapQuery: "Jaffna, Sri Lanka",
      delivery: "Islandwide delivery across Sri Lanka",
      categories,
      brandCount,
      productCount,
      activeOffers,
    },
  });
});

export const publicCustomerCount = asyncHandler(async (_req, res) => {
  const count = await User.countDocuments({ role: "customer", isActive: true });
  return success(res, { customers: count });
});