import { api } from './client';
import type { ApiResponse, Product } from '../types';

export const wishlistApi = {
  getWishlist: async () => {
    return api.get<ApiResponse<{ products: Product[]; count: number }>>('/wishlist');
  },

  addToWishlist: async (productId: string) => {
    return api.post<ApiResponse<{ message: string; count: number }>>(`/wishlist/${productId}`);
  },

  removeFromWishlist: async (productId: string) => {
    return api.delete<ApiResponse<{ message: string; count: number }>>(`/wishlist/${productId}`);
  },
};
