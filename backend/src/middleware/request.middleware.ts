import type { NextFunction, Response } from "express";
import { randomUUID } from "crypto";
import type { AuthedRequest } from "../types/express";

export function requestId(req: AuthedRequest, res: Response, next: NextFunction): void {
  req.requestId = req.headers["x-request-id"] as string || randomUUID();
  res.setHeader("x-request-id", req.requestId);
  next();
}