import mongoose, { Schema, type Document, Types } from "mongoose";
import type { ReviewStatus } from "../constants";
import { REVIEW_STATUS } from "../constants";

export interface IReview extends Document {
  user: Types.ObjectId;
  product: Types.ObjectId;
  order: Types.ObjectId;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 2000 },
    verifiedPurchase: { type: Boolean, default: false },
    status: { type: String, enum: REVIEW_STATUS, default: "pending" },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true, partialFilterExpression: { order: { $exists: true } } });

export const Review = mongoose.model<IReview>("Review", reviewSchema);