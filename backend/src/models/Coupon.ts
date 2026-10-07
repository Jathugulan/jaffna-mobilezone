import mongoose, { Schema, type Document } from "mongoose";
import { DISCOUNT_TYPES } from "../constants";

export interface ICoupon extends Document {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  uses?: number;
  maxUses?: number;
  startDate?: Date;
  endDate?: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: DISCOUNT_TYPES, required: true },
    value: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, min: 0, default: 0 },
    maxDiscount: { type: Number, min: 0, default: null },
    uses: { type: Number, default: 0 },
    maxUses: { type: Number, default: null },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.index({ active: 1, startDate: 1, endDate: 1 });

export const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);