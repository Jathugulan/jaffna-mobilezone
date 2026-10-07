import { api } from './client';
import { unwrapItem, unwrapList } from './response';
import type { ApiResponse, Category } from '../types';

export const categoriesApi = {
  getCategories: async (params?: { active?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.active !== undefined) query.append('active', String(params.active));
    const str = query.toString();
    const res = await api.get<ApiResponse<{ categories: Category[] }>>(
      `/categories${str ? `?${str}` : ''}`
    );
    return unwrapList(res, 'categories');
  },

  getCategoryById: async (id: string) => {
    const res = await api.get<ApiResponse<{ category: Category }>>(`/categories/${id}`);
    return unwrapItem(res, 'category');
  },

  createCategory: async (categoryData: Partial<Category>) => {
    const res = await api.post<ApiResponse<{ category: Category }>>('/categories', categoryData);
    return unwrapItem(res, 'category');
  },

  updateCategory: async (id: string, categoryData: Partial<Category>) => {
    const res = await api.put<ApiResponse<{ category: Category }>>(`/categories/${id}`, categoryData);
    return unwrapItem(res, 'category');
  },

  deleteCategory: async (id: string) => {
    return api.delete<ApiResponse<{ message: string }>>(`/categories/${id}`);
  },
};
