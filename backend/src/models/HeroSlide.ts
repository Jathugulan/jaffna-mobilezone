import mongoose, { Schema, type Document } from "mongoose";

export interface IHeroSlide extends Document {
  title: string;
  subtitle?: string;
  description?: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  displayOrder: number;
  startDate?: Date;
  endDate?: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const heroSlideSchema = new Schema<IHeroSlide>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    desktopImageUrl: { type: String, default: null },
    mobileImageUrl: { type: String, default: null },
    ctaText: { type: String, default: "Explore" },
    ctaLink: { type: String, default: "/shop" },
    displayOrder: { type: Number, default: 0 },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

heroSlideSchema.index({ active: 1, displayOrder: 1, startDate: 1, endDate: 1 });

export const HeroSlide = mongoose.model<IHeroSlide>("HeroSlide", heroSlideSchema);