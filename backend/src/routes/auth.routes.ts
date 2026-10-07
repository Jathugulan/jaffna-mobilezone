import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authLimiter } from "../middleware/rateLimiter.middleware";
import { authenticate, optionalAuth } from "../middleware/auth.middleware";
import * as auth from "../controllers/auth.controller";
import {
  loginSchema,
  registerSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validators/auth.validator";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), auth.register);
router.post("/login", authLimiter, validate(loginSchema), auth.login);
router.post("/logout", optionalAuth, auth.logout);
router.post("/refresh", authLimiter, validate(refreshSchema), auth.refresh);
router.get("/me", authenticate, auth.me);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), auth.forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), auth.resetPassword);
router.post("/verify-email", validate(verifyEmailSchema), auth.verifyEmail);
router.post("/verify-email/request", authenticate, auth.requestEmailVerification);

export default router;