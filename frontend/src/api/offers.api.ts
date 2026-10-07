import { api } from './client';
import { unwrapItem, unwrapList } from './response';
import type { ApiResponse, FlashSale, Offer } from '../types';

export const offersApi = {
  getOffers: async () => {
    const res = await api.get<ApiResponse<{ offers: Offer[] }>>('/offers');
    return unwrapList(res, 'offers');
  },

  getActiveOffers: async () => {
    const res = await api.get<ApiResponse<{ offers: Offer[] }>>('/offers/active');
    return unwrapList(res, 'offers');
  },

  getOfferById: async (id: string) => {
    const res = await api.get<ApiResponse<{ offer: Offer }>>(`/offers/${id}`);
    return unwrapItem(res, 'offer');
  },

  createOffer: async (offerData: Partial<Offer>) => {
    const res = await api.post<ApiResponse<{ offer: Offer }>>('/offers', offerData);
    return unwrapItem(res, 'offer');
  },

  updateOffer: async (id: string, offerData: Partial<Offer>) => {
    const res = await api.put<ApiResponse<{ offer: Offer }>>(`/offers/${id}`, offerData);
    return unwrapItem(res, 'offer');
  },

  deleteOffer: async (id: string) => {
    return api.delete<ApiResponse<{ message: string }>>(`/offers/${id}`);
  },

  // Flash sales (stored as offers with type "flashSale")
  getFlashSales: async () => {
    const res = await api.get<ApiResponse<{ offers: FlashSale[] }>>('/flash-sales');
    return unwrapList(res, 'offers');
  },

  getActiveFlashSales: async () => {
    const res = await api.get<ApiResponse<{ offers: FlashSale[] }>>('/flash-sales/active');
    return unwrapList(res, 'offers');
  },

  createFlashSale: async (saleData: Partial<FlashSale>) => {
    const res = await api.post<ApiResponse<{ offer: FlashSale }>>('/flash-sales', saleData);
    return unwrapItem(res, 'offer');
  },

  updateFlashSale: async (id: string, saleData: Partial<FlashSale>) => {
    const res = await api.put<ApiResponse<{ offer: FlashSale }>>(`/flash-sales/${id}`, saleData);
    return unwrapItem(res, 'offer');
  },

  deleteFlashSale: async (id: string) => {
    return api.delete<ApiResponse<{ message: string }>>(`/flash-sales/${id}`);
  },
};
