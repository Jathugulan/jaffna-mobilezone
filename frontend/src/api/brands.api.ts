import { api } from './client';
import { unwrapItem, unwrapList } from './response';
import type { ApiResponse, Brand } from '../types';

export const brandsApi = {
  getBrands: async (params?: { featured?: boolean; active?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.featured !== undefined) query.append('featured', String(params.featured));
    if (params?.active !== undefined) query.append('active', String(params.active));
    const str = query.toString();
    const res = await api.get<ApiResponse<{ brands: Brand[] }>>(`/brands${str ? `?${str}` : ''}`);
    return unwrapList(res, 'brands');
  },

  getBrandBySlug: async (slug: string) => {
    const res = await api.get<ApiResponse<{ brand: Brand }>>(`/brands/slug/${slug}`);
    return unwrapItem(res, 'brand');
  },

  getBrandById: async (id: string) => {
    const res = await api.get<ApiResponse<{ brand: Brand }>>(`/brands/${id}`);
    return unwrapItem(res, 'brand');
  },

  createBrand: async (brandData: Partial<Brand>) => {
    const res = await api.post<ApiResponse<{ brand: Brand }>>('/brands', brandData);
    return unwrapItem(res, 'brand');
  },

  updateBrand: async (id: string, brandData: Partial<Brand>) => {
    const res = await api.put<ApiResponse<{ brand: Brand }>>(`/brands/${id}`, brandData);
    return unwrapItem(res, 'brand');
  },

  deleteBrand: async (id: string) => {
    return api.delete<ApiResponse<{ message: string }>>(`/brands/${id}`);
  },
};
