import type { Types } from "mongoose";
import { Notification } from "../models/Notification";

export interface NotificationInput {
  user: Types.ObjectId | string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export async function notify(input: NotificationInput): Promise<void> {
  await Notification.create({
    user: input.user,
    type: input.type,
    title: input.title,
    message: input.message,
    data: input.data ?? {},
    read: false,
  });
}

export async function notifyMany(
  userIds: Array<Types.ObjectId | string>,
  input: Omit<NotificationInput, "user">
): Promise<void> {
  if (!userIds.length) return;
  await Notification.insertMany(
    userIds.map((user) => ({
      user,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data ?? {},
      read: false,
    }))
  );
}

export async function markRead(userId: string, ids?: string[]): Promise<void> {
  const filter: Record<string, unknown> = { user: userId };
  if (ids?.length) filter._id = { $in: ids };
  await Notification.updateMany(filter, { $set: { read: true } });
}

export async function unreadCount(userId: string): Promise<number> {
  return Notification.countDocuments({ user: userId, read: false });
}