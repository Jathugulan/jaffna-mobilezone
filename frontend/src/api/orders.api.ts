import { api } from './client';
import { unwrapItem } from './response';
import type { Address, ApiResponse, Order, OrderStatus, PaginatedResponse } from '../types';
import type { CartResponse } from './cart.api';

export interface CreateOrderItemDto {
  product: string;
  quantity: number;
  variant?: Record<string, unknown>;
}

export interface CreateOrderDto {
  items: CreateOrderItemDto[];
  shippingAddress?: Address;
  shippingAddressId?: string;
  couponCode?: string;
  paymentMethod?: string;
}

export const ordersApi = {
  createOrder: async (orderData: CreateOrderDto) => {
    const res = await api.post<ApiResponse<{ order: Order }>>('/orders', orderData);
    return unwrapItem(res, 'order');
  },

  getMyOrders: async () => {
    return api.get<PaginatedResponse<Order>>('/orders');
  },

  getOrderById: async (id: string) => {
    const res = await api.get<ApiResponse<{ order: Order }>>(`/orders/${id}`);
    return unwrapItem(res, 'order');
  },

  cancelOrder: async (id: string, reason?: string) => {
    const res = await api.post<ApiResponse<{ order: Order }>>(`/orders/${id}/cancel`, { reason });
    return unwrapItem(res, 'order');
  },

  reorder: async (id: string) => {
    const res = await api.post<ApiResponse<{ cart: CartResponse }>>(`/orders/${id}/reorder`);
    return unwrapItem(res, 'cart');
  },

  // Admin orders
  getAdminOrders: async (status?: OrderStatus) => {
    const q = status ? `?orderStatus=${status}` : '';
    return api.get<PaginatedResponse<Order>>(`/admin/orders${q}`);
  },

  updateOrderStatus: async (id: string, status: OrderStatus) => {
    const res = await api.put<ApiResponse<{ order: Order }>>(`/admin/orders/${id}/status`, {
      orderStatus: status,
    });
    return unwrapItem(res, 'order');
  },
};
