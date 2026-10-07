import { api } from './client';
import { unwrapItem } from './response';
import type { ApiResponse, CartItem } from '../types';

export interface CartResponse {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}

export const cartApi = {
  getCart: async () => {
    const res = await api.get<ApiResponse<{ cart: CartResponse }>>('/cart');
    return unwrapItem(res, 'cart');
  },

  addToCart: async (productId: string, quantity: number = 1, variant?: Record<string, unknown>) => {
    const res = await api.post<ApiResponse<{ cart: CartResponse }>>('/cart/items', {
      product: productId,
      quantity,
      variant,
    });
    return unwrapItem(res, 'cart');
  },

  updateCartItem: async (productId: string, quantity: number) => {
    const res = await api.put<ApiResponse<{ cart: CartResponse }>>(`/cart/items/${productId}`, {
      quantity,
    });
    return unwrapItem(res, 'cart');
  },

  removeCartItem: async (productId: string) => {
    const res = await api.delete<ApiResponse<{ cart: CartResponse }>>(`/cart/items/${productId}`);
    return unwrapItem(res, 'cart');
  },

  clearCart: async () => {
    const res = await api.delete<ApiResponse<{ cart: CartResponse }>>('/cart');
    return unwrapItem(res, 'cart');
  },
};
