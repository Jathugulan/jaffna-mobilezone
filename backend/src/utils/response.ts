import type { Response } from "express";

export function success<T>(
  res: Response,
  data: T,
  meta?: Record<string, unknown>,
  status = 200
): Response {
  return res.status(status).json({ success: true, data, ...(meta ?? {}) });
}

export function paginated<T>(
  res: Response,
  data: T[],
  pagination: { page: number; limit: number; total: number; totalPages: number }
): Response {
  return success(res, data, { pagination });
}