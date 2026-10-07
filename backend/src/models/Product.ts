import mongoose, { Schema, type Document, Types } from "mongoose";

export interface IVariant {
  name: string;
  sku?: string;
  price?: number;
  offerPrice?: number;
  stock?: number;
  attributes: Record<string, unknown>;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  brand: Types.ObjectId;
  category: Types.ObjectId;
  description: string;
  images: string[];
  price: number;
  offerPrice: number;
  discountPercentage: number;
  sku: string;
  stock: number;
  specifications: {
    ram: string;
    storage: string;
    display: string;
    processor: string;
    camera: string;
    battery: string;
    operatingSystem: string;
    supports5G: boolean;
  };
  colors: string[];
  variants: IVariant[];
  warranty: string;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  deal: boolean;
  published: boolean;
  viewCount: number;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<IVariant>(
  {
    name: { type: String, required: true },
    sku: { type: String, default: null },
    price: { type: Number, min: 0 },
    offerPrice: { type: Number, min: 0 },
    stock: { type: Number, min: 0 },
    attributes: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: true }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, min: 0, default: null },
    discountPercentage: { type: Number, min: 0, max: 100, default: 0 },
    sku: { type: String, required: true, unique: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    specifications: {
      ram: { type: String, default: "" },
      storage: { type: String, default: "" },
      display: { type: String, default: "" },
      processor: { type: String, default: "" },
      camera: { type: String, default: "" },
      battery: { type: String, default: "" },
      operatingSystem: { type: String, default: "" },
      supports5G: { type: Boolean, default: false },
    },
    colors: { type: [String], default: [] },
    variants: { type: [variantSchema], default: [] },
    warranty: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    deal: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ brand: 1, published: 1 });
productSchema.index({ category: 1, published: 1 });
productSchema.index({ price: 1 });
productSchema.index({ offerPrice: 1 });
productSchema.index({ published: 1, featured: 1 });
productSchema.index({ published: 1, newArrival: 1, createdAt: -1 });
productSchema.index({ published: 1, bestSeller: 1, salesCount: -1 });
productSchema.index({ published: 1, deal: 1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ "specifications.storage": 1 });
productSchema.index({ "specifications.supports5G": 1 });

productSchema.index(
  {
    name: "text",
    description: "text",
    sku: "text",
    "specifications.processor": "text",
    "specifications.camera": "text",
  },
  {
    weights: { name: 10, description: 5, sku: 5, "specifications.processor": 2, "specifications.camera": 2 },
    default_language: "english",
  }
);

export const Product = mongoose.model<IProduct>("Product", productSchema);