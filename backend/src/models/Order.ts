import mongoose, { Schema, type Document, Types } from "mongoose";
import type { OrderStatus, PaymentStatus } from "../constants";
import { ORDER_STATUS, PAYMENT_STATUS } from "../constants";

export interface IOrderItem {
  product: Types.ObjectId;
  nameSnapshot: string;
  imageSnapshot: string;
  priceSnapshot: number;
  offerPriceSnapshot: number;
  quantity: number;
  variant?: Record<string, unknown>;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
  deliveryInstructions?: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode?: string;
  shippingAddress: IShippingAddress;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod?: string;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  returnRequest?: {
    requested: boolean;
    reason?: string;
    status: "requested" | "approved" | "rejected";
  };
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    nameSnapshot: { type: String, required: true },
    imageSnapshot: { type: String, default: "" },
    priceSnapshot: { type: Number, required: true, min: 0 },
    offerPriceSnapshot: { type: Number, min: 0, default: null },
    quantity: { type: Number, required: true, min: 1 },
    variant: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    couponCode: { type: String, default: null },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: "" },
      city: { type: String, required: true },
      district: { type: String, required: true },
      postalCode: { type: String, default: "" },
      deliveryInstructions: { type: String, default: "" },
    },
    paymentStatus: { type: String, enum: PAYMENT_STATUS, default: "pending" },
    orderStatus: { type: String, enum: ORDER_STATUS, default: "pending" },
    paymentMethod: { type: String, default: null },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancellationReason: { type: String, default: "" },
    returnRequest: {
      requested: { type: Boolean, default: false },
      reason: { type: String, default: "" },
      status: { type: String, enum: ["requested", "approved", "rejected"], default: "requested" },
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>("Order", orderSchema);