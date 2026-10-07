import { Types } from "mongoose";

export function slugify(input: string): string {
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Canonical username form. Keeps every character allowed by the username rule
 * (`[a-zA-Z0-9_.]`, see User model / usernameSchema) and turns separators into a
 * single underscore. `slugify` must NOT be used for usernames because it strips
 * underscores and dots, which makes the stored value differ from what the user
 * typed and therefore breaks login.
 */
export function normalizeUsername(input: string): string {
  return input
    .toString()
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_.]/g, "")
    .replace(/_{2,}/g, "_")
    .replace(/^[_.]+/, "")
    .replace(/[_.]+$/, "");
}

/**
 * Every form a username may be stored under. New accounts use `normalizeUsername`;
 * accounts created before that fix were stored via `slugify` (separators stripped),
 * so both variants are returned to keep legacy accounts able to log in.
 */
export function usernameLookupVariants(input: string): string[] {
  const raw = input.toString().trim().toLowerCase();
  const legacy = slugify(input).replace(/-/g, "_");
  return [...new Set([raw, normalizeUsername(input), legacy].filter((value) => value.length > 0))];
}

export function generateRandomToken(length = 32): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

export function toObjectIdList(ids: string[]): Types.ObjectId[] {
  return ids.map((id) => new Types.ObjectId(id));
}

export function formatLKR(value: number): string {
  return `Rs. ${new Intl.NumberFormat("en-LK").format(Math.round(value))}`;
}

export function discountFrom(price: number, offerPrice: number): number {
  if (price <= 0 || offerPrice <= 0 || offerPrice >= price) return 0;
  return Math.round(((price - offerPrice) / price) * 100);
}

export function clampInt(value: unknown, fallback: number, min = 1, max = 100): number {
  const n = Number(value);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function extractIp(req: { ip?: string; headers?: Record<string, unknown> }): string {
  const fwd = (req.headers?.["x-forwarded-for"] as string) ?? "";
  return fwd.split(",")[0]?.trim() || req.ip || "unknown";
}