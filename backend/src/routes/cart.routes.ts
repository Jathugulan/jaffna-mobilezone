import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import * as carts from "../controllers/cart.controller";
import { applyCouponSchema } from "../validators/offer.validator";
import { cartItemSchema, updateCartItemSchema } from "../validators/commerce.validator";

const router = Router();

router.use(authenticate);

router.get("/", carts.getCart);
router.post("/items", validate(cartItemSchema), carts.addToCart);
router.put("/items/:productId", validate(updateCartItemSchema), carts.updateCartItem);
router.delete("/items/:productId", carts.removeCartItem);
router.delete("/", carts.clearCart);
router.post("/coupon", validate(applyCouponSchema), carts.applyCoupon);

export default router;