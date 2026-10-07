import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticate, adminOnly } from "../middleware/auth.middleware";
import * as reviews from "../controllers/review.controller";
import { reviewSchema, reviewUpdateSchema, reviewStatusSchema } from "../validators/commerce.validator";
import { idParamsSchema } from "../validators/catalog.validator";

const router = Router();

// public
router.get("/product/:productId", reviews.getProductReviews);

// customer
router.use(authenticate);
router.post("/", validate(reviewSchema), reviews.createReview);
router.get("/mine", reviews.myReviews);
router.put("/:id", validate(idParamsSchema, "params"), validate(reviewUpdateSchema), reviews.updateReview);
router.delete("/:id", validate(idParamsSchema, "params"), reviews.deleteReview);

// admin moderation
router.get("/", adminOnly, reviews.adminListReviews);
router.get("/admin", adminOnly, reviews.adminListReviews);
router.put("/admin/:id/status", adminOnly, validate(idParamsSchema, "params"), validate(reviewStatusSchema), reviews.adminSetReviewStatus);
router.delete("/admin/:id", adminOnly, validate(idParamsSchema, "params"), reviews.adminDeleteReview);

export default router;