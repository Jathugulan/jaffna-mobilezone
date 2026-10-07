import type { NextFunction, Response } from "express";
import { verify } from "jsonwebtoken";
import { User, type IUser } from "../models/User";
import { env } from "../config/env";
import { ROLES } from "../constants";
import { ApiError, unauthorized } from "../utils/ApiError";
import type { AuthedRequest } from "../types/express";

interface AccessPayload {
  sub: string;
  role: string;
  type: string;
}

export async function authenticate(req: AuthedRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization ?? "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw unauthorized("Access token missing");
    }

    let payload: AccessPayload;
    try {
      payload = verify(token, env.jwtAccessSecret) as AccessPayload;
    } catch {
      throw unauthorized("Invalid or expired access token");
    }

    if (payload.type !== "access") throw unauthorized("Invalid token type");

    const user = await User.findById(payload.sub).select("+passwordHash");
    if (!user || !user.isActive) throw unauthorized("Account not available");

    req.user = {
      _id: user._id,
      id: user._id.toString(),
      role: user.role,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
    };

    next();
  } catch (err) {
    next(err);
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(unauthorized());
    if (roles.includes(req.user.role)) return next();
    return next(new ApiError(403, "You do not have permission to access this resource", "FORBIDDEN"));
  };
}

export const adminOnly = authorize(ROLES.ADMIN);
export const customerOrAdmin = authorize(ROLES.CUSTOMER, ROLES.ADMIN);

export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return next();

  try {
    const payload = verify(token, env.jwtAccessSecret) as AccessPayload;
    if (payload.type !== "access") return next();
    User.findById(payload.sub)
      .then((user: IUser | null) => {
        if (user && user.isActive) {
          req.user = {
            _id: user._id,
            id: user._id.toString(),
            role: user.role,
            username: user.username,
            email: user.email,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
          };
        }
        return next();
      })
      .catch(() => next());
  } catch {
    return next();
  }
}