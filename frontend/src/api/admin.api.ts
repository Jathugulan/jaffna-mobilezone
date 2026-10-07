import { api } from './client';
import { mapData, unwrapItem } from './response';
import type { ApiResponse, Review, User } from '../types';

export interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  activeOffersCount: number;
}

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  phone: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  currency: string;
  aiEnabled: boolean;
  address?: string;
  openingHours?: string;
  whatsapp?: string;
}

interface BackendOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  activeOffers: number;
}

interface SeriesBucket {
  _id: { year: number; month: number; day: number };
  revenue: number;
  orders: number;
}

const pad = (value: number) => String(value).padStart(2, '0');

const formatSeriesDate = (bucket: SeriesBucket['_id']) =>
  `${bucket.year}-${pad(bucket.month)}-${pad(bucket.day)}`;

/** The analytics endpoints accept `range` and expect `3m` rather than the UI's `90d`. */
const toApiRange = (range: string) => (range === '90d' ? '3m' : range);

export const adminApi = {
  getOverview: async (range: string = '30d') => {
    const res = await api.get<ApiResponse<BackendOverview>>(
      `/admin/analytics/overview?range=${toApiRange(range)}`
    );
    return mapData(res, (data) => ({
      totalRevenue: data?.totalRevenue ?? 0,
      totalOrders: data?.totalOrders ?? 0,
      totalCustomers: data?.totalCustomers ?? 0,
      totalProducts: data?.totalProducts ?? 0,
      lowStockCount: data?.lowStock ?? 0,
      outOfStockCount: data?.outOfStock ?? 0,
      activeOffersCount: data?.activeOffers ?? 0,
    }));
  },

  getStats: async () => {
    return api.get<ApiResponse<{
      totalRevenue: number;
      totalOrders: number;
      pendingOrders: number;
      totalCustomers: number;
      totalProducts: number;
      lowStock: number;
      activeOffers: number;
      reviewCounts: Record<string, number>;
    }>>('/admin/stats');
  },

  getRevenueAnalytics: async (range: string = '30d') => {
    const res = await api.get<ApiResponse<{ series: SeriesBucket[] }>>(
      `/admin/analytics/revenue?range=${toApiRange(range)}`
    );
    return mapData(res, (data) =>
      (data?.series ?? []).map((point) => ({
        date: formatSeriesDate(point._id),
        revenue: point.revenue,
        orders: point.orders,
      }))
    );
  },

  getOrdersAnalytics: async (range: string = '30d') => {
    const res = await api.get<ApiResponse<{ series: SeriesBucket[]; recentOrders: unknown[] }>>(
      `/admin/analytics/orders?range=${toApiRange(range)}`
    );
    return mapData(res, (data) => ({
      series: (data?.series ?? []).map((point) => ({
        date: formatSeriesDate(point._id),
        revenue: point.revenue,
        orders: point.orders,
      })),
      recentOrders: data?.recentOrders ?? [],
    }));
  },

  getTopProducts: async (limit: number = 5) => {
    const res = await api.get<ApiResponse<{
      performance: Array<{ _id: string; name: string; qtySold: number; revenue: number }>;
    }>>('/admin/analytics/products');
    return mapData(res, (data) =>
      [...(data?.performance ?? [])]
        .slice(0, limit)
        .map((product) => ({
          _id: product._id,
          name: product.name,
          salesCount: product.qtySold,
          revenue: product.revenue,
        }))
    );
  },

  getTopBrands: async () => {
    const res = await api.get<ApiResponse<{
      brands: Array<{ name: string; slug?: string; count: number; revenue: number }>;
    }>>('/admin/analytics/brands');
    return mapData(res, (data) =>
      (data?.brands ?? []).map((brand) => ({
        _id: brand.slug || brand.name,
        name: brand.name,
        count: brand.count,
        revenue: brand.revenue,
      }))
    );
  },

  // Users management
  getUsers: async (role?: string) => {
    const q = role ? `?role=${role}` : '';
    return api.get<ApiResponse<User[]>>(`/admin/users${q}`);
  },

  getCustomerDetail: async (id: string) => {
    return api.get<ApiResponse<{ user: User; orders: unknown[]; reviews: unknown[]; totalSpent: number }>>(
      `/admin/users/${id}`
    );
  },

  updateUserStatus: async (userId: string, isActive: boolean) => {
    const res = await api.put<ApiResponse<{ user: User }>>(`/admin/users/${userId}/status`, { isActive });
    return unwrapItem(res, 'user');
  },

  // Reviews moderation
  getReviews: async () => {
    return api.get<ApiResponse<Review[]>>('/reviews/admin');
  },

  updateReviewStatus: async (reviewId: string, status: 'approved' | 'hidden' | 'rejected') => {
    const res = await api.put<ApiResponse<{ review: Review }>>(`/reviews/admin/${reviewId}/status`, {
      status,
    });
    return unwrapItem(res, 'review');
  },

  deleteReview: async (reviewId: string) => {
    return api.delete<ApiResponse<{ message: string }>>(`/reviews/admin/${reviewId}`);
  },

  // Settings
  getSettings: async () => {
    return api.get<ApiResponse<{ settings: StoreSettings }>>('/admin/settings');
  },

  updateSettings: async (settings: Partial<StoreSettings>) => {
    return api.put<ApiResponse<{ message: string; settings: StoreSettings }>>('/admin/settings', settings);
  },

  // Coupons
  getCoupons: async () => {
    return api.get<ApiResponse<{ coupons: Array<{ _id: string; code: string; discountType: string; discountValue: number; minOrderAmount?: number; expiresAt?: string; active: boolean }> }>>('/admin/coupons');
  },

  createCoupon: async (coupon: Record<string, unknown>) => {
    return api.post<ApiResponse<unknown>>('/admin/coupons', coupon);
  },

  deleteCoupon: async (id: string) => {
    return api.delete<ApiResponse<{ message: string }>>(`/admin/coupons/${id}`);
  },
};

