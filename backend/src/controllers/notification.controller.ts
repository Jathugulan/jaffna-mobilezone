import { Notification } from "../models/Notification";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import type { AuthedRequest } from "../types/express";
import { markRead, unreadCount } from "../services/notification.service";

export const listNotifications = asyncHandler(async (req: AuthedRequest, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const filter: Record<string, unknown> = { user: req.user!.id };
  if (req.query.unread === "true") filter.read = false;

  const [data, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Notification.countDocuments(filter),
    unreadCount(req.user!.id),
  ]);
  return success(res, { notifications: data, unread, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } });
});

export const markNotificationRead = asyncHandler(async (req: AuthedRequest, res) => {
  await markRead(req.user!.id, req.params.id ? [req.params.id] : undefined);
  return success(res, { message: "Notification marked as read" });
});

export const markAllRead = asyncHandler(async (req: AuthedRequest, res) => {
  await Notification.updateMany({ user: req.user!.id }, { $set: { read: true } });
  return success(res, { message: "All notifications marked as read" });
});