import type { Request, Response, NextFunction } from "express";
import type { Types } from "mongoose";
import type { Role } from "../constants";

export interface AuthUser {
  _id: Types.ObjectId;
  id: string;
  role: Role;
  username: string;
  email: string;
  isActive: boolean;
  isEmailVerified: boolean;
}

export interface AuthedRequest extends Request {
  user?: AuthUser;
  requestId?: string;
}

export type { Response, NextFunction };
export type AsyncHandler = (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => Promise<unknown>;