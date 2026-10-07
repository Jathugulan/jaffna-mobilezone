import mongoose, { Schema, type Document, Types } from "mongoose";

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  variant?: Record<string, unknown> | null;
}

export interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    items: {
      type: [
        {
          product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
          quantity: { type: Number, required: true, min: 1, default: 1 },
          variant: { type: Schema.Types.Mixed, default: null },
        },
      ],
      default: [],
    },
  },
  { timestamps: { updatedAt: true, createdAt: false } }
);

export const Cart = mongoose.model<ICart>("Cart", cartSchema);