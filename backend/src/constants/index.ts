export const ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ORDER_STATUS = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "outForDelivery",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number];

export const PAYMENT_STATUS = ["pending", "paid", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];

export const REVIEW_STATUS = ["pending", "approved", "hidden"] as const;
export type ReviewStatus = (typeof REVIEW_STATUS)[number];

export const OFFER_TYPES = [
  "product",
  "brand",
  "category",
  "flashSale",
  "bundle",
] as const;
export type OfferType = (typeof OFFER_TYPES)[number];

export const DISCOUNT_TYPES = ["percentage", "fixed"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export const DELIVERY_FEE = 500;
export const FREE_DELIVERY_THRESHOLD = 100000;

export const LKR_FORMATTER = new Intl.NumberFormat("en-LK", {
  maximumFractionDigits: 0,
});

export const HOMEPAGE_SECTION_KEYS = [
  "announcementBar",
  "heroCarousel",
  "featuredCategories",
  "trendingProducts",
  "featuredBrands",
  "flashDeals",
  "aiFinder",
  "productSpotlight",
  "newArrivals",
  "bestSellers",
  "compareExperience",
  "whyChooseUs",
  "customerReviews",
  "jaffnaStore",
  "faq",
  "newsletter",
] as const;

export const NOTIFICATION_TYPES = [
  "order_confirmed",
  "order_shipped",
  "order_delivered",
  "price_drop",
  "back_in_stock",
  "new_offer",
  "new_order",
  "low_stock",
  "out_of_stock",
  "new_customer",
  "new_review",
  "offer_expiring",
  "return_request",
  "system",
] as const;

export const DEFAULT_IMAGE =
  "https://placehold.co/600x600/171717/f5f5f5?text=JMZ";