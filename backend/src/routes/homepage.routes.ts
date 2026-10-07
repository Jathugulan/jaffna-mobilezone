import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticate, adminOnly } from "../middleware/auth.middleware";
import * as homepage from "../controllers/homepage.controller";
import { homepageUpdateSchema, newsletterSchema, contactSchema } from "../validators/content.validator";
import { createRateLimiter } from "../middleware/rateLimiter.middleware";

const router = Router();

router.get("/", homepage.getHomepage);
router.get("/store", homepage.storeInfo);
router.post("/newsletter", createRateLimiter(15 * 60 * 1000, 10), validate(newsletterSchema), homepage.subscribeNewsletter);
router.post("/contact", createRateLimiter(15 * 60 * 1000, 10), validate(contactSchema), homepage.contactForm);
router.put("/", authenticate, adminOnly, validate(homepageUpdateSchema), homepage.updateHomepageSections);
router.get("/sections", authenticate, adminOnly, homepage.listHomepageSections);

export default router;