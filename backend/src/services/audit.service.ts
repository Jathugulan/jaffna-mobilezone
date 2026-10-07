import type { Types } from "mongoose";
import { AuditLog } from "../models/AuditLog";

export interface AuditInput {
  admin: Types.ObjectId | string;
  action: string;
  resource: string;
  resourceId?: Types.ObjectId | string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function recordAudit(input: AuditInput): Promise<void> {
  await AuditLog.create({
    admin: input.admin,
    action: input.action,
    resource: input.resource,
    resourceId: input.resourceId ?? null,
    metadata: input.metadata ?? {},
    ipAddress: input.ipAddress ?? "",
  });
}