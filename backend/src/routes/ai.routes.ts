import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticate, adminOnly, customerOrAdmin } from "../middleware/auth.middleware";
import { aiLimiter } from "../middleware/rateLimiter.middleware";
import * as ai from "../controllers/ai.controller";
import { aiQueryValidator } from "../validators/content.validator";

const router = Router();

router.post("/product-assistant", aiLimiter, validate(aiQueryValidator.productAssistant), ai.productAssistantHandler);
router.post("/search", aiLimiter, validate(aiQueryValidator.search), ai.searchHandler);
router.get("/suggestions", ai.suggestionsHandler);
router.post("/compare", aiLimiter, validate(aiQueryValidator.compare), ai.compareHandler);
router.post("/recommendations", authenticate, customerOrAdmin, ai.recommendationsHandler);
router.post("/wishlist/recommendations", authenticate, customerOrAdmin, ai.wishlistRecommendationsHandler);
router.post("/order-assistant", authenticate, customerOrAdmin, aiLimiter, validate(aiQueryValidator.orderAssistant), ai.orderAssistantHandler);

const adminRouter = Router();
adminRouter.use(authenticate, adminOnly, aiLimiter);
adminRouter.post("/business-assistant", validate(aiQueryValidator.businessAssistant), ai.businessAssistantHandler);

export { router, adminRouter };