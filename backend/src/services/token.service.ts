import type { Types } from "mongoose";
import { User, type IUser } from "../models/User";
import { env } from "../config/env";
import { generateRandomToken } from "../utils/helpers";
import { signToken, verifyToken, type TokenPayload } from "../utils/jwt";

const DAY_MS = 24 * 60 * 60 * 1000;

function refreshExpiryDays(): number {
  const matched = /^(\d+)d$/.exec(env.jwtRefreshExpires);
  if (matched) return Number(matched[1]);
  return 7;
}

export async function issueTokens(user: IUser, rememberMe = false): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const accessExpires = rememberMe ? "7d" : env.jwtAccessExpires;
  const accessToken = signToken(
    { sub: user._id.toString(), role: user.role, type: "access" },
    env.jwtAccessSecret,
    accessExpires as never
  );

  const rawRefreshToken = signToken(
    { sub: user._id.toString(), role: user.role, type: "refresh" },
    env.jwtRefreshSecret,
    env.jwtRefreshExpires as never
  );

  const expiryDays = refreshExpiryDays();
  // Store a hashed-ish representation; we keep a random opaque token id to allow revoke.
  const tokenId = generateRandomToken(24);
  await User.updateOne(
    { _id: user._id },
    {
      $push: {
        refreshTokens: {
          token: tokenId,
          expiresAt: new Date(Date.now() + expiryDays * DAY_MS),
          createdAt: new Date(),
        },
      },
    }
  );

  // Embed the tokenId so the refresh endpoint can revoke the exact token.
  const refreshToken = `${rawRefreshToken}.${tokenId}`;
  return { accessToken, refreshToken };
}

export function parseRefreshToken(refreshToken: string): {
  payload: TokenPayload;
  tokenId: string;
} {
  const separatorIndex = refreshToken.lastIndexOf(".");
  if (separatorIndex <= 0 || separatorIndex === refreshToken.length - 1) {
    throw new Error("Invalid refresh token format");
  }

  const jwtPart = refreshToken.slice(0, separatorIndex);
  const tokenId = refreshToken.slice(separatorIndex + 1);
  const payload = verifyToken<TokenPayload>(jwtPart, env.jwtRefreshSecret);
  if (payload.type !== "refresh") throw new Error("Invalid token type");
  return { payload, tokenId };
}

export async function rotateRefreshToken(
  userId: string,
  oldTokenId: string,
  rememberMe = false
): Promise<{ accessToken: string; refreshToken: string } | null> {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  await User.updateOne(
    { _id: user._id },
    { $pull: { refreshTokens: { token: oldTokenId } } }
  );

  return issueTokens(user, rememberMe);
}

export async function revokeRefreshTokens(userId: Types.ObjectId | string): Promise<void> {
  await User.updateOne({ _id: userId }, { $set: { refreshTokens: [] } });
}

export async function storeVerificationToken(userId: string): Promise<string> {
  const token = generateRandomToken(40);
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        emailVerificationToken: token,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    }
  );
  return token;
}

export async function storeResetToken(userId: string): Promise<string> {
  const token = generateRandomToken(40);
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        resetPasswordToken: token,
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000),
      },
    }
  );
  return token;
}