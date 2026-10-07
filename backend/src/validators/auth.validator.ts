import { z } from "zod";

const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-zA-Z0-9_.]+$/, "Username can contain letters, numbers, underscore and dot");

const emailSchema = z.string().email("Enter a valid email address").toLowerCase();

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number");

export const MAX_IMAGE_DATA_URL_LENGTH = 3_600_000;

const HTTP_IMAGE_URL = /^https?:\/\/\S+\.(jpe?g|png|webp|gif|avif|svg)(\?\S*)?$/i;
const DATA_IMAGE_URL = /^data:image\/(png|jpe?g|webp|gif|avif);base64,[A-Za-z0-9+/=]+$/;

/**
 * Accepts either an http(s) image URL or an inline base64 upload (`data:image/...`).
 * Uploaded avatars are sent as data URLs by the client, so a plain `z.string().url()`
 * check (and a 2048 character cap) would reject every real upload.
 */
export const imageUrlSchema = z
  .string()
  .max(MAX_IMAGE_DATA_URL_LENGTH, "Image is too large (maximum ~3.5MB)")
  .refine((value) => HTTP_IMAGE_URL.test(value) || DATA_IMAGE_URL.test(value), {
    message: "Image must be an http(s) URL ending in JPG, JPEG, PNG or WebP, or an uploaded image file",
  })
  .refine((value) => value.startsWith("data:image/") || value.length <= 2048, {
    message: "Image URL is too long (maximum 2048 characters)",
  });

/** Optional image field: omitted, empty string or null all mean "no image". */
const optionalImageSchema = imageUrlSchema.nullish().or(z.literal(""));

/** Optional phone field: omitted, empty string or null all mean "no phone". */
const optionalPhoneSchema = z.string().max(20).nullish().or(z.literal(""));

export const registerSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().optional(),
    profilePicture: optionalImageSchema,
    phone: optionalPhoneSchema,
  })
  .strict()
  .refine((data) => data.confirmPassword === undefined || data.confirmPassword === data.password, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const loginSchema = z
  .object({
    identifier: z.string().min(1, "Enter your username or email").max(80),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
  })
  .strict();

export const refreshSchema = z
  .object({
    refreshToken: z.string().optional(),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: emailSchema,
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string().optional(),
  })
  .strict()
  .refine((data) => data.confirmPassword === undefined || data.confirmPassword === data.password, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const verifyEmailSchema = z
  .object({
    token: z.string().min(1),
  })
  .strict();

export const updateProfileSchema = z
  .object({
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
    phone: optionalPhoneSchema,
    profilePicture: optionalImageSchema,
    preferences: z.record(z.unknown()).optional(),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().optional(),
  })
  .strict()
  .refine((data) => data.confirmPassword === undefined || data.confirmPassword === data.newPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const adminUserStatusSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();