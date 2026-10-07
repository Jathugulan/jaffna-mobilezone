import { api } from './client';
import { unwrapItem } from './response';
import type { ApiResponse, PaginatedResponse, Product } from '../types';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  ram?: string;
  storage?: string;
  supports5G?: boolean;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  deal?: boolean;
  inStock?: boolean;
  onOffer?: boolean;
  published?: boolean;
  sortBy?: 'createdAt' | 'price' | 'salesCount' | 'name';
  sortOrder?: 'asc' | 'desc';
}

/**
 * The catalog API expects `q` for free text search and a single `sort` enum
 * instead of the UI's `sortBy`/`sortOrder` pair.
 */
const SORT_MAP: Record<string, string> = {
  'createdAt:desc': 'newest',
  'createdAt:asc': 'newest',
  'price:asc': 'priceAsc',
  'price:desc': 'priceDesc',
  'salesCount:desc': 'popular',
  'name:asc': 'name',
  'name:desc': 'name',
};

function buildQueryString(filters: ProductFilters): string {
  const params = new URLSearchParams();
  const { search, sortBy, sortOrder, ...rest } = filters;

  if (search) params.append('q', search);

  const sort = SORT_MAP[`${sortBy ?? ''}:${sortOrder ?? ''}`];
  if (sort) params.append('sort', sort);

  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'number' && !Number.isFinite(value)) return;
      // Map frontend filter names to backend query param names
      let paramKey = key;
      if (key === 'deal') {
        paramKey = 'onOffer'; // Backend expects onOffer, not deal
      }
      params.append(paramKey, String(value));
    }
  });

  return params.toString();
}

export const productsApi = {
  getProducts: async (filters: ProductFilters = {}) => {
    const queryString = buildQueryString(filters);
    return api.get<PaginatedResponse<Product>>(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getProductBySlug: async (slug: string) => {
    const res = await api.get<ApiResponse<{ product: Product }>>(`/products/slug/${slug}`);
    return unwrapItem(res, 'product');
  },

  getProductById: async (id: string) => {
    const res = await api.get<ApiResponse<{ product: Product }>>(`/products/${id}`);
    return unwrapItem(res, 'product');
  },

  getProductsByBrand: async (slug: string, filters: ProductFilters = {}) => {
    const queryString = buildQueryString(filters);
    const res = await api.get<
      ApiResponse<{
        brand: unknown;
        products: Product[];
        pagination: PaginatedResponse<Product>['pagination'];
      }>
    >(
      `/products/brand/${slug}${queryString ? `?${queryString}` : ''}`
    );
    return {
      ...res,
      data: res.data?.products ?? [],
      pagination: res.data?.pagination,
    } satisfies PaginatedResponse<Product>;
  },

  searchProducts: async (query: string) => {
    return api.get<PaginatedResponse<Product>>(`/products/search?q=${encodeURIComponent(query)}`);
  },

  createProduct: async (productData: Partial<Product>) => {
    const res = await api.post<ApiResponse<{ product: Product }>>('/products', productData);
    return unwrapItem(res, 'product');
  },

  updateProduct: async (id: string, productData: Partial<Product>) => {
    const res = await api.put<ApiResponse<{ product: Product }>>(`/products/${id}`, productData);
    return unwrapItem(res, 'product');
  },

  deleteProduct: async (id: string) => {
    return api.delete<ApiResponse<{ message: string }>>(`/products/${id}`);
  },
};
