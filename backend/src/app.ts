import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env, isProduction } from "./config/env";
import { apiLimiter } from "./middleware/rateLimiter.middleware";
import { requestId } from "./middleware/request.middleware";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";
import brandRoutes from "./routes/brand.routes";
import categoryRoutes from "./routes/category.routes";
import offerRoutes from "./routes/offer.routes";
import flashSaleRoutes from "./routes/flashSale.routes";
import orderRoutes from "./routes/order.routes";
import cartRoutes from "./routes/cart.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import reviewRoutes from "./routes/review.routes";
import addressRoutes from "./routes/address.routes";
import homepageRoutes from "./routes/homepage.routes";
import { heroRouter, testimonialRouter, faqRouter } from "./routes/content.routes";
import analyticsRoutes from "./routes/analytics.routes";
import { router as aiRoutes, adminRouter as aiAdminRoutes } from "./routes/ai.routes";
import adminRoutes from "./routes/admin.routes";
import notificationRoutes from "./routes/notification.routes";

export function createApp(): express.Express {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(
    cors({
      origin: env.clientUrl.split(",").map((s) => s.trim()),
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    })
  );
  // Avatars are sent inline as base64 data URLs, so the body limit must cover the
  // image the client encodes (the UI downscales, this is the safety ceiling).
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true, limit: "5mb" }));
  app.use(cookieParser());
  app.use(requestId);

  if (!isProduction) {
    app.use(morgan("dev"));
  }

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ success: true, status: "ok", service: "jaffna-mobile-zone-api" });
  });

  app.use("/api/auth", apiLimiter, authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/brands", brandRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/offers", offerRoutes);
  app.use("/api/flash-sales", apiLimiter, flashSaleRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/wishlist", wishlistRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/addresses", addressRoutes);
  app.use("/api/homepage", homepageRoutes);
  app.use("/api/hero-slides", heroRouter);
  app.use("/api/testimonials", testimonialRouter);
  app.use("/api/faq", faqRouter);
  app.use("/api/admin/analytics", analyticsRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/admin/ai", aiAdminRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/notifications", notificationRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}