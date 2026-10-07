import type { NextFunction, Request, RequestHandler, Response } from "express";
import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError";

export function createRateLimiter(
  windowMs: number,
  max: number,
  message = "Too many requests, please try again later"
): RequestHandler {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, _res: Response, next: NextFunction) => {
      return next(new ApiError(429, message, "TOO_MANY_REQUESTS"));
    },
  });
}

export const apiLimiter = createRateLimiter(15 * 60 * 1000, 300, "Too many requests");

export const authLimiter = createRateLimiter(15 * 60 * 1000, 15, "Too many auth attempts, try again later");

export const aiLimiter = createRateLimiter(60 * 1000, 20, "AI assistant rate limit reached");

export const strictLimiter = createRateLimiter(60 * 1000, 60, "Too many requests");