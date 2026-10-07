import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { ApiError } from "../utils/ApiError";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`, "NOT_FOUND"));
}

interface BodyParserError {
  status?: number;
  statusCode?: number;
  type?: string;
  message?: string;
}

/**
 * Errors thrown by express.json()/urlencoded() (and http-errors generally) expose
 * an HTTP status instead of being ApiErrors. Without this mapping a client mistake
 * such as an oversized payload is reported as a misleading 500.
 */
function statusFromBodyParserError(err: BodyParserError): number | undefined {
  if (err.type === "entity.too.large") return 413;
  if (err.type === "entity.parse.failed") return 400;
  if (err.type === "encoding.unsupported") return 415;
  if (err.type === "charset.unsupported") return 415;
  const status = err.status ?? err.statusCode;
  if (typeof status === "number" && status >= 400 && status < 500) return status;
  return undefined;
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let error = err as ApiError;

  if (!(err instanceof ApiError)) {
    const parserStatus = statusFromBodyParserError((err ?? {}) as BodyParserError);
    const parserError = (err ?? {}) as BodyParserError;

    if (parserStatus === 413) {
      error = new ApiError(
        413,
        "Request payload is too large. Please choose a smaller image.",
        "PAYLOAD_TOO_LARGE"
      );
    } else if (parserStatus === 400) {
      error = new ApiError(400, "Malformed JSON in request body", "INVALID_JSON");
    } else if (parserStatus === 415) {
      error = new ApiError(415, "Unsupported request body encoding", "UNSUPPORTED_MEDIA_TYPE");
    } else if (parserStatus !== undefined) {
      error = new ApiError(parserStatus, parserError.message || "Request could not be processed");
    } else if (err instanceof mongoose.Error.ValidationError) {
      const errors = Object.entries(err.errors).map(([field, e]) => ({
        field,
        message: e.message,
      }));
      error = new ApiError(422, "Validation failed", "VALIDATION_ERROR", errors);
    } else if (err instanceof mongoose.Error.CastError) {
      error = new ApiError(400, "Invalid identifier format", "INVALID_ID");
    } else if (
      err &&
      typeof err === "object" &&
      (err as { code?: number }).code === 11000
    ) {
      error = new ApiError(409, "Duplicate value violates a unique constraint", "DUPLICATE_KEY");
    } else {
      logger.error("Unhandled error", {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        path: req.path,
      });
      error = new ApiError(500, "Internal server error", "INTERNAL_SERVER_ERROR");
    }
  }

  const status = error.statusCode || 500;
  const body: Record<string, unknown> = {
    success: false,
    message: error.message,
    code: error.code,
  };
  if (error.errors) body.errors = error.errors;
  if (env.nodeEnv !== "production" && status === 500) {
    body.stack = error.stack;
  }

  res.status(status).json(body);
}