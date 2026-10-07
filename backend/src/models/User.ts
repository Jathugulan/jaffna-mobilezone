import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import type { Role } from "../constants";
import { ROLES } from "../constants";

export interface IRefreshToken {
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface IUserAddressRef {
  address: Types.ObjectId;
  isDefault: boolean;
}

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  profilePicture?: string | null;
  role: Role;
  phone?: string | null;
  addresses: Types.ObjectId[];
  defaultAddress?: Types.ObjectId;
  preferences: Record<string, unknown>;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  refreshTokens?: IRefreshToken[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_.]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: { type: String, required: true, select: false },
    profilePicture: { type: String, default: null },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.CUSTOMER },
    phone: { type: String, default: null },
    addresses: [{ type: Schema.Types.ObjectId, ref: "Address", default: [] }],
    defaultAddress: { type: Schema.Types.ObjectId, ref: "Address", default: null },
    preferences: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null, select: false },
    emailVerificationExpires: { type: Date, default: null, select: false },
    resetPasswordToken: { type: String, default: null, select: false },
    resetPasswordExpires: { type: Date, default: null, select: false },
    refreshTokens: {
      type: [
        {
          token: { type: String, required: true },
          expiresAt: { type: Date, required: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      select: false,
      default: [],
    },
    lastLoginAt: { type: Date, default: null },
  },
  {
timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.passwordHash;
        delete ret.refreshTokens;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
      },
    },
  }
);

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

export interface IUserModel extends Model<IUser> {
  toPublicUser(user: IUser): Record<string, unknown>;
}

userSchema.statics.toPublicUser = function toPublicUser(user: IUser) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture ?? null,
    role: user.role,
    phone: user.phone ?? null,
    addresses: user.addresses ?? [],
    defaultAddress: user.defaultAddress ?? null,
    preferences: user.preferences ?? {},
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt ?? null,
    createdAt: user.createdAt,
  };
};

export const User = mongoose.model<IUser, IUserModel>("User", userSchema);
