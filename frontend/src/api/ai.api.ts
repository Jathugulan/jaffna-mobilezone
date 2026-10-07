import { api } from './client';
import type { ApiResponse, Product } from '../types';

export interface AiResponse {
  text: string;
  products?: Product[];
}

export interface AiAdminResponse {
  text: string;
  context?: Record<string, unknown>;
}

export const aiApi = {
  askProductAssistant: async (query: string) => {
    return api.post<ApiResponse<AiResponse>>('/ai/product-assistant', { query });
  },

  aiSearch: async (query: string) => {
    return api.post<ApiResponse<AiResponse & { hints?: string[] }>>('/ai/search', { query });
  },

  getSuggestions: async (query: string) => {
    return api.get<ApiResponse<string[]>>(`/ai/suggestions?q=${encodeURIComponent(query)}`);
  },

  compareProducts: async (productIds: string[], question?: string) => {
    return api.post<ApiResponse<AiResponse>>('/ai/compare', { productIds, question });
  },

  getRecommendations: async () => {
    return api.post<ApiResponse<AiResponse>>('/ai/recommendations');
  },

  askOrderAssistant: async (query: string) => {
    return api.post<ApiResponse<{ text: string; orders?: unknown[] }>>('/ai/order-assistant', { query });
  },

  askAdminBusinessAssistant: async (query: string) => {
    return api.post<ApiResponse<AiAdminResponse>>('/admin/ai/business-assistant', { query });
  },
};
