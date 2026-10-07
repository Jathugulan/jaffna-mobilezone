import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { ROLES } from "../constants";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import { ApiError, conflict, forbidden, unauthorized } from "../utils/ApiError";
import {
  issueTokens,
  parseRefreshToken,
  rotateRefreshToken,
  revokeRefreshTokens,
  storeVerificationToken,
  storeResetToken,
} from "../services/token.service";
import type { AuthedRequest } from "../types/express";
import { normalizeUsername, usernameLookupVariants } from "../utils/helpers";

export const register = asyncHandler(async (req, res) => {
  const body = (req as unknown as {
    validated: {
      body: {
        username: string;
        email: string;
        password: string;
        confirmPassword?: string;
        profilePicture?: string | null;
        phone?: string | null;
      };
    };
  }).validated.body;
  // Keep underscores/dots the user typed so the stored username matches login input.
  const username = normalizeUsername(body.username);

  if (username.length < 3) {
    throw new ApiError(422, "Validation failed", "VALIDATION_ERROR", [
      {
        field: "username",
        message: "Username must contain at least 3 letters, numbers, underscores or dots",
      },
    ]);
  }

  const email = body.email.toLowerCase();
  const existing = await User.findOne({
    $or: [{ email }, { username: { $in: usernameLookupVariants(body.username) } }],
  });
  if (existing) {
    if (existing.email === email) throw conflict("An account with this email already exists");
    throw conflict("This username is already taken");
  }

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await User.create({
    username,
    email,
    passwordHash,
    profilePicture: body.profilePicture || null,
    phone: body.phone || null,
    role: ROLES.CUSTOMER,
    isEmailVerified: true,
  });

  const tokens = await issueTokens(user);

  const { emailVerificationToken: _v, ...publicUser } = User.toPublicUser(user);
  void _v;

  return success(
    res,
    { user: publicUser, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
    undefined,
    201
  );
});

export const login = asyncHandler(async (req, res) => {
  const body = (req as unknown as { validated: { body: { identifier: string; password: string; rememberMe?: boolean } } }).validated.body;
  const identifier = body.identifier.trim().toLowerCase();
  const rememberMe = body.rememberMe ?? false;

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: { $in: usernameLookupVariants(identifier) } }],
  }).select("+passwordHash");

  if (!user) throw unauthorized("Invalid username/email or password");
  if (!user.isActive) throw forbidden("This account has been disabled. Contact support.");

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) throw unauthorized("Invalid username/email or password");

  await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
  const tokens = await issueTokens(user, rememberMe);

  return success(res, { user: User.toPublicUser(user), accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await revokeRefreshTokens(req.user._id);
  }
  return success(res, { message: "Logged out successfully" });
});

export const refresh = asyncHandler(async (req, res) => {
  const body = (req as unknown as { validated: { body: { refreshToken?: string } } }).validated.body ?? {};
  const token = body.refreshToken;
  if (!token) throw unauthorized("Refresh token required");

  let parsedToken: ReturnType<typeof parseRefreshToken>;
  try {
    parsedToken = parseRefreshToken(token);
  } catch {
    throw unauthorized("Invalid or expired refresh token");
  }

  const { payload, tokenId } = parsedToken;
  const user = await User.findById(payload.sub).select("+refreshTokens");
  if (!user || !user.isActive) throw unauthorized("Account not available");

  const stored = (user.refreshTokens ?? []).find((t) => t.token === tokenId);
  if (!stored) throw unauthorized("Refresh token was revoked");
  if (stored.expiresAt.getTime() < Date.now()) throw unauthorized("Refresh token expired");

  const rotated = await rotateRefreshToken(user._id.toString(), tokenId, false);
  if (!rotated) throw unauthorized("Token rotation failed");

  return success(res, rotated);
});

export const me = asyncHandler(async (req: AuthedRequest, res) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(401, "Account not found");
  return success(res, { user: User.toPublicUser(user) });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const body = (req as unknown as { validated: { body: { email: string } } }).validated.body;
  const user = await User.findOne({ email: body.email.toLowerCase() });
  if (!user) {
    return success(res, { message: "If that email exists, a reset link has been sent." });
  }
  const token = await storeResetToken(user._id.toString());
  // In production send via email service; here we return a dev token.
  return success(res, {
    message: "Password reset initiated",
    resetToken: token,
    resetUrl: `${req.protocol}://${req.get("host")}/reset-password?token=${token}`,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const body = (req as unknown as { validated: { body: { token: string; password: string } } }).validated.body;
  const user = await User.findOne({
    resetPasswordToken: body.token,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) throw badRequestToken();

  const passwordHash = await bcrypt.hash(body.password, 12);
  user.passwordHash = passwordHash;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();
  await revokeRefreshTokens(user._id);

  return success(res, { message: "Password has been reset. You can now log in." });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const body = (req as unknown as { validated: { body: { token: string } } }).validated.body;
  const user = await User.findOneAndUpdate(
    {
      emailVerificationToken: body.token,
      emailVerificationExpires: { $gt: new Date() },
    },
    { $set: { isEmailVerified: true, emailVerificationToken: null, emailVerificationExpires: null } },
    { new: true }
  ).select("+emailVerificationToken");
  if (!user) throw badRequestToken();
  return success(res, { message: "Email verified successfully", user: User.toPublicUser(user) });
});

export const requestEmailVerification = asyncHandler(async (req: AuthedRequest, res) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.isEmailVerified) return success(res, { message: "Email is already verified" });
  const token = await storeVerificationToken(user._id.toString());
  return success(res, { verificationToken: token });
});

function badRequestToken(): ApiError {
  return new ApiError(400, "Invalid or expired token", "INVALID_TOKEN");
}