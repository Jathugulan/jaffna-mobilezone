import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { ROLES } from "../constants";
import { logger } from "../utils/logger";

export interface SeedAdminResult {
  created: boolean;
  repaired: boolean;
  username: string;
  email: string;
}

interface AdminSeedConfig {
  username: string;
  email: string;
  password: string;
  forcePassword: boolean;
}

function adminSeedConfig(): AdminSeedConfig {
  const rawPassword = process.env.ADMIN_PASSWORD;
  return {
    username: (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase(),
    email: (process.env.ADMIN_EMAIL || "admin@jaffnamobilezone.lk").trim().toLowerCase(),
    password: rawPassword || "Admin@1234",
    // Only overwrite an existing password when ADMIN_PASSWORD is set explicitly,
    // so an admin that changed their password in the app is never clobbered.
    forcePassword: Boolean(rawPassword),
  };
}

/**
 * Ensures the administrator account exists and is usable.
 * Safe to run on every boot: it creates the account when missing and repairs
 * role / active / verified flags when they were changed, but it never rewrites
 * the password unless ADMIN_PASSWORD is explicitly provided.
 */
export async function ensureAdminAccount(): Promise<SeedAdminResult> {
  const { username, email, password, forcePassword } = adminSeedConfig();

  const existing = await User.findOne({ $or: [{ username }, { email }] });

  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({
      username,
      email,
      passwordHash,
      role: ROLES.ADMIN,
      isActive: true,
      isEmailVerified: true,
    });
    logger.info(`[seed] Admin account created -> username: ${username} | email: ${email}`);
    return { created: true, repaired: false, username, email };
  }

  const updates: Record<string, unknown> = {};
  if (existing.role !== ROLES.ADMIN) updates.role = ROLES.ADMIN;
  if (!existing.isActive) updates.isActive = true;
  if (!existing.isEmailVerified) updates.isEmailVerified = true;
  if (forcePassword) updates.passwordHash = await bcrypt.hash(password, 12);

  if (Object.keys(updates).length === 0) {
    logger.info(`[seed] Admin account already healthy -> ${existing.username}`);
    return { created: false, repaired: false, username: existing.username, email: existing.email };
  }

  await User.updateOne({ _id: existing._id }, { $set: updates });
  logger.info(
    `[seed] Admin account repaired -> ${existing.username} (updated: ${Object.keys(updates).join(", ")})`
  );
  return { created: false, repaired: true, username: existing.username, email: existing.email };
}