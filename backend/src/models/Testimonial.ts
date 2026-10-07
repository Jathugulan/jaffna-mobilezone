import mongoose, { Schema, type Document } from "mongoose";

export interface ITestimonial extends Document {
  name: string;
  avatarUrl?: string;
  rating: number;
  content: string;
  role?: string;
  productName?: string;
  verified: boolean;
  active: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true, maxlength: 1000 },
    role: { type: String, default: "" },
    productName: { type: String, default: "" },
    verified: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

testimonialSchema.index({ active: 1, displayOrder: 1 });

export const Testimonial = mongoose.model<ITestimonial>("Testimonial", testimonialSchema);