import mongoose, { Schema, type Document } from "mongoose";

export interface IHomepageSection extends Document {
  key: string;
  title: string;
  enabled: boolean;
  displayOrder: number;
  configuration: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const homepageSectionSchema = new Schema<IHomepageSection>(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, default: "" },
    enabled: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    configuration: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const HomepageSection = mongoose.model<IHomepageSection>("HomepageSection", homepageSectionSchema);