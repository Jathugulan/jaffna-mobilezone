import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError";

type Source = "body" | "query" | "params";

export function validate(schema: ZodSchema, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      const target = req as Request & { validated?: Record<string, unknown> };
      target.validated = { ...(target.validated ?? {}), [source]: parsed };
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return next(new ApiError(422, "Validation failed", "VALIDATION_ERROR", errors));
      }
      return next(err);
    }
  };
}

export function validatedBody<T>(req: Request): T {
  return (req as Request & { validated?: Record<string, unknown> }).validated?.["body"] as T;
}

export function validatedQuery<T>(req: Request): T {
  return (req as Request & { validated?: Record<string, unknown> }).validated?.["query"] as T;
}

export function validatedParams<T>(req: Request): T {
  return (req as Request & { validated?: Record<string, unknown> }).validated?.["params"] as T;
}