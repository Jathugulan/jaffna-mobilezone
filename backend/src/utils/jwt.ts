import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

export interface TokenPayload {
  sub: string;
  role: string;
  type: "access" | "refresh";
}

export function signToken(
  payload: TokenPayload,
  secret: Secret,
  expiresIn: SignOptions["expiresIn"]
): string {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken<T extends TokenPayload>(token: string, secret: Secret): T {
  return jwt.verify(token, secret) as T;
}