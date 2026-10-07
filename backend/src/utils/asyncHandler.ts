import type { Response, NextFunction } from "express";
import type { AsyncHandler, AuthedRequest } from "../types/express";

export function asyncHandler(fn: AsyncHandler) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}