import { Router } from "express";
import { authenticate, adminOnly } from "../middleware/auth.middleware";
import * as analytics from "../controllers/analytics.controller";
import { validate } from "../middleware/validate.middleware";
import { analyticsQuerySchema } from "../validators/content.validator";

const router = Router();

router.use(authenticate, adminOnly);

router.get("/overview", validate(analyticsQuerySchema, "query"), analytics.overview);
router.get("/revenue", validate(analyticsQuerySchema, "query"), analytics.revenue);
router.get("/orders", validate(analyticsQuerySchema, "query"), analytics.orders);
router.get("/products", validate(analyticsQuerySchema, "query"), analytics.products);
router.get("/brands", validate(analyticsQuerySchema, "query"), analytics.brands);
router.get("/categories", validate(analyticsQuerySchema, "query"), analytics.categories);
router.get("/customers", validate(analyticsQuerySchema, "query"), analytics.customers);
router.get("/offers", analytics.offers);

export default router;