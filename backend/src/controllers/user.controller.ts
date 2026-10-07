import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import { badRequest, notFound } from "../utils/ApiError";
import { conflict } from "../utils/ApiError";
import type { AuthedRequest } from "../types/express";
import { revokeRefreshTokens } from "../services/token.service";
import { normalizeUsername, usernameLookupVariants } from "../utils/helpers";

export const getMe = asyncHandler(async (req: AuthedRequest, res) => {
  const user = await User.findById(req.user!.id).populate("addresses");
  if (!user) throw notFound("User not found");
  return success(res, { user: User.toPublicUser(user) });
});

export const updateMe = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as {
    validated: {
      body: { username?: string; email?: string; phone?: string; profilePicture?: string; preferences?: Record<string, unknown> };
    };
  }).validated.body;

  const user = await User.findById(req.user!.id);
  if (!user) throw notFound("User not found");

  if (body.username) {
    const username = normalizeUsername(body.username);
    if (username.length < 3) {
      throw badRequest("Username must contain at least 3 letters, numbers, underscores or dots");
    }
    if (username !== user.username) {
      const lookup = await User.findOne({
        username: { $in: usernameLookupVariants(body.username) },
        _id: { $ne: user._id },
      });
      if (lookup) throw conflict("Username already taken");
      user.username = username;
    }
  }
  if (body.email && body.email.toLowerCase() !== user.email) {
    const lookup = await User.findOne({ email: body.email.toLowerCase(), _id: { $ne: user._id } });
    if (lookup) throw conflict("Email already in use");
    user.email = body.email.toLowerCase();
    user.isEmailVerified = false;
  }
  if (body.phone !== undefined) user.phone = body.phone || null;
  if (body.profilePicture !== undefined) user.profilePicture = body.profilePicture || null;
  if (body.preferences) user.preferences = { ...user.preferences, ...body.preferences };

  await user.save();
  return success(res, { user: User.toPublicUser(user) });
});

export const updatePassword = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as {
    validated: {
      body: { currentPassword: string; newPassword: string };
    };
  }).validated.body;

  const user = await User.findById(req.user!.id).select("+passwordHash");
  if (!user) throw notFound("User not found");

  const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
  if (!valid) throw badRequest("Current password is incorrect");

  user.passwordHash = await bcrypt.hash(body.newPassword, 12);
  await user.save();
  await revokeRefreshTokens(user._id);
  return success(res, { message: "Password updated successfully" });
});

export const setProfilePicture = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req.body ?? {}) as { profilePicture?: string };
  if (!body.profilePicture) throw badRequest("Profile picture URL is required");
  const user = await User.findById(req.user!.id);
  if (!user) throw notFound("User not found");
  user.profilePicture = body.profilePicture;
  await user.save();
  return success(res, { user: User.toPublicUser(user) });
});

export const removeProfilePicture = asyncHandler(async (req: AuthedRequest, res) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw notFound("User not found");
  user.profilePicture = null;
  await user.save();
  return success(res, { user: User.toPublicUser(user) });
});

export const deleteMe = asyncHandler(async (req: AuthedRequest, res) => {
  await User.deleteOne({ _id: req.user!.id });
  await revokeRefreshTokens(req.user!.id);
  return success(res, { message: "Account deleted" });
});

export const dashboard = asyncHandler(async (req: AuthedRequest, res) => {
  const { Order } = await import("../models/Order");
  const { Wishlist } = await import("../models/Wishlist");
  const { Cart } = await import("../models/Cart");
  const { Notification } = await import("../models/Notification");
  const userId = req.user!.id;

  const [orderCounts, recentOrders, wishlist, cart, notifications, unread] = await Promise.all([
    Order.aggregate([
      { $match: { user: userId as never } },
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]),
    Order.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
    Wishlist.findOne({ user: userId }),
    Cart.findOne({ user: userId }),
    Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(10),
    Notification.countDocuments({ user: userId, read: false }),
  ]);

  const counts: Record<string, number> = {};
  for (const c of orderCounts) counts[c._id as string] = c.count;

  return success(res, {
    summary: {
      totalOrders: Object.values(counts).reduce((s, n) => s + n, 0),
      pendingOrders: counts.pending ?? 0,
      completedOrders: counts.delivered ?? 0,
      cancelledOrders: counts.cancelled ?? 0,
      wishlistCount: wishlist?.products.length ?? 0,
      cartCount: cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0,
      unreadNotifications: unread,
    },
    recentOrders,
    notifications,
    wishlistProducts: wishlist?.products ?? [],
  });
});