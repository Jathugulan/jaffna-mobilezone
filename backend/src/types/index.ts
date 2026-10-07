import type { Types } from "mongoose";
import type { OrderStatus, PaymentStatus, Role } from "../constants";

export interface UserDTO {
  id: string;
  username: string;
  email: string;
  profilePicture: string | null;
  role: Role;
  phone?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

export interface SafeUser extends UserDTO {
  addresses: Types.ObjectId[];
  preferences: Record<string, unknown>;
}

export interface ProductQuery {
  q?: string;
  brand?: string | string[];
  category?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  ram?: string;
  storage?: string;
  rating?: number;
  inStock?: boolean;
  onOffer?: boolean;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  deal?: boolean;
  supports5G?: boolean;
  published?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface OrderItemSnapshot {
  product: Types.ObjectId;
  nameSnapshot: string;
  imageSnapshot: string;
  priceSnapshot: number;
  offerPriceSnapshot: number;
  quantity: number;
  variant?: Record<string, unknown>;
}

export interface OrderSummary {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}

export interface ReviewMeta {
  average: number;
  count: number;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  activeOffers: number;
  pendingOrders: number;
  averageOrderValue: number;
}

export interface StatusFilter {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
}