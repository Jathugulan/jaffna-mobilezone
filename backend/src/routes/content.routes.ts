import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticate, adminOnly } from "../middleware/auth.middleware";
import * as homepage from "../controllers/homepage.controller";
import { heroSlideSchema, heroSlideUpdateSchema, testimonialsSchema, testimonialsUpdateSchema, faqSchema, faqUpdateSchema } from "../validators/content.validator";
import { idParamsSchema } from "../validators/catalog.validator";

const heroRouter = Router();

heroRouter.get("/", homepage.listHeroSlides);
heroRouter.post("/", authenticate, adminOnly, validate(heroSlideSchema), homepage.createHeroSlide);
heroRouter.put("/:id", authenticate, adminOnly, validate(idParamsSchema, "params"), validate(heroSlideUpdateSchema), homepage.updateHeroSlide);
heroRouter.delete("/:id", authenticate, adminOnly, validate(idParamsSchema, "params"), homepage.deleteHeroSlide);

const testimonialRouter = Router();

testimonialRouter.get("/", homepage.listTestimonials);
testimonialRouter.post("/", authenticate, adminOnly, validate(testimonialsSchema), homepage.createTestimonial);
testimonialRouter.put("/:id", authenticate, adminOnly, validate(idParamsSchema, "params"), validate(testimonialsUpdateSchema), homepage.updateTestimonial);
testimonialRouter.delete("/:id", authenticate, adminOnly, validate(idParamsSchema, "params"), homepage.deleteTestimonial);

const faqRouter = Router();

faqRouter.get("/", homepage.listFaqs);
faqRouter.post("/", authenticate, adminOnly, validate(faqSchema), homepage.createFaq);
faqRouter.put("/:id", authenticate, adminOnly, validate(idParamsSchema, "params"), validate(faqUpdateSchema), homepage.updateFaq);
faqRouter.delete("/:id", authenticate, adminOnly, validate(idParamsSchema, "params"), homepage.deleteFaq);

export { heroRouter, testimonialRouter, faqRouter };