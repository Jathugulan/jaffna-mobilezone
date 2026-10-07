import mongoose, { Schema, type Document } from "mongoose";

export interface IBrand extends Document {
  name: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  /** Showcase photo rendered large on the "Shop by Global Brand" carousel card */
  cardImageUrl?: string;
  description?: string;
  featured: boolean;
  active: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logoUrl: { type: String, default: null },
    bannerUrl: { type: String, default: null },
    cardImageUrl: { type: String, default: null },
    description: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

brandSchema.index({ featured: 1, active: 1, displayOrder: 1 });

export const Brand = mongoose.model<IBrand>("Brand", brandSchema);