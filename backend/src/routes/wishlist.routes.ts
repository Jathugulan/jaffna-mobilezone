import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import * as wishlists from "../controllers/wishlist.controller";
import { wishlistParamsSchema } from "../validators/commerce.validator";

const router = Router();

router.use(authenticate);

router.get("/", wishlists.getWishlist);
router.post("/:productId", validate(wishlistParamsSchema, "params"), wishlists.addToWishlist);
router.delete("/:productId", validate(wishlistParamsSchema, "params"), wishlists.removeFromWishlist);
router.post("/:productId/move-to-cart", validate(wishlistParamsSchema, "params"), wishlists.moveToCart);

export default router;