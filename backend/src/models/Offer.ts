import mongoose, { Schema, type Document, Types } from "mongoose";
import type { DiscountType, OfferType } from "../constants";
import { DISCOUNT_TYPES, OFFER_TYPES } from "../constants";

export interface IOffer extends Document {
  name: string;
  description?: string;
  type: OfferType;
  discountType: DiscountType;
  discountValue: number;
  products: Types.ObjectId[];
  brands: Types.ObjectId[];
  categories: Types.ObjectId[];
  bannerUrl?: string;
  startDate: Date;
  endDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: OFFER_TYPES, required: true },
    discountType: { type: String, enum: DISCOUNT_TYPES, required: true },
    discountValue: { type: Number, required: true, min: 0 },
    products: [{ type: Schema.Types.ObjectId, ref: "Product", default: [] }],
    brands: [{ type: Schema.Types.ObjectId, ref: "Brand", default: [] }],
    categories: [{ type: Schema.Types.ObjectId, ref: "Category", default: [] }],
    bannerUrl: { type: String, default: null },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

offerSchema.index({ startDate: 1 });
offerSchema.index({ endDate: 1 });
offerSchema.index({ active: 1, endDate: -1 });

export const Offer = mongoose.model<IOffer>("Offer", offerSchema);