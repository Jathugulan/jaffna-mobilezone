export type Role = 'customer' | 'admin';

export interface User {
  id: string;
  _id?: string;
  username: string;
  email: string;
  role: Role;
  profilePicture?: string | null;
  phone?: string | null;
  addresses?: string[];
  defaultAddress?: string | null;
  isActive?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
}

export interface Brand {
  _id: string;
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
  productCount?: number;
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  displayOrder: number;
  createdAt?: string;
}

export interface ProductVariant {
  _id?: string;
  name: string;
  sku?: string;
  price?: number;
  offerPrice?: number;
  stock?: number;
  attributes?: Record<string, unknown>;
}

export interface ProductSpecifications {
  ram?: string;
  storage?: string;
  display?: string;
  processor?: string;
  camera?: string;
  battery?: string;
  operatingSystem?: string;
  supports5G?: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  brand: Brand | string;
  category: Category | string;
  description: string;
  images: string[];
  price: number;
  offerPrice?: number | null;
  discountPercentage?: number;
  sku: string;
  stock: number;
  specifications: ProductSpecifications;
  colors: string[];
  variants: ProductVariant[];
  warranty?: string;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  deal: boolean;
  published: boolean;
  viewCount?: number;
  salesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Offer {
  _id: string;
  name: string;
  description?: string;
  type: 'product' | 'brand' | 'category' | 'flashSale' | 'bundle';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  products?: Product[] | string[];
  brands?: Brand[] | string[];
  categories?: Category[] | string[];
  bannerUrl?: string;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt?: string;
}

export interface FlashSale {
  _id: string;
  name: string;
  description?: string;
  type?: 'flashSale';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  products?: Product[] | string[];
  brands?: Brand[] | string[];
  categories?: Category[] | string[];
  bannerUrl?: string;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt?: string;
}

export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  province: string;
  postalCode: string;
  deliveryInstructions?: string;
  isDefault: boolean;
}

export interface OrderItem {
  _id?: string;
  product: Product | string;
  nameSnapshot: string;
  imageSnapshot?: string;
  priceSnapshot: number;
  offerPriceSnapshot?: number | null;
  quantity: number;
  variant?: Record<string, unknown>;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'outForDelivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export interface Order {
  _id: string;
  orderNumber?: string;
  user: User | string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode?: string | null;
  shippingAddress: Address;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: OrderStatus;
  paymentMethod?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string;
  returnRequest?: {
    requested: boolean;
    reason?: string;
    status: 'requested' | 'approved' | 'rejected';
  };
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: Record<string, unknown>;
}

export interface Review {
  _id: string;
  user: { _id: string; username: string; email?: string; profilePicture?: string | null };
  product: string | { _id: string; name: string; slug?: string; images?: string[] } | null;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'hidden';
  createdAt: string;
}

export interface HeroSlide {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  desktopImageUrl: string;
  mobileImageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  displayOrder: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  displayOrder: number;
  active: boolean;
}

export interface Testimonial {
  _id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  comment: string;
  location?: string;
  active: boolean;
  displayOrder: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  code?: string;
}
