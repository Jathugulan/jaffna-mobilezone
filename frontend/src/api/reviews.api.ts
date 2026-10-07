import { api } from './client';
import { unwrapItem, unwrapList } from './response';
import type { ApiResponse, Review } from '../types';

export interface CreateReviewDto {
  product: string;
  order?: string;
  rating: number;
  comment: string;
}

export const reviewsApi = {
  getProductReviews: async (productId: string) => {
    const res = await api.get<ApiResponse<{ reviews: Review[] }>>(`/reviews/product/${productId}`);
    return unwrapList(res, 'reviews');
  },

  createReview: async (reviewData: CreateReviewDto) => {
    const res = await api.post<ApiResponse<{ review: Review }>>('/reviews', reviewData);
    return unwrapItem(res, 'review');
  },

  getMyReviews: async () => {
    const res = await api.get<ApiResponse<{ reviews: Review[] }>>('/reviews/mine');
    return unwrapList(res, 'reviews');
  },

  updateReview: async (id: string, updateData: Partial<Pick<CreateReviewDto, 'rating' | 'comment'>>) => {
    const res = await api.put<ApiResponse<{ review: Review }>>(`/reviews/${id}`, updateData);
    return unwrapItem(res, 'review');
  },

  deleteReview: async (id: string) => {
    return api.delete<ApiResponse<{ message: string }>>(`/reviews/${id}`);
  },
};
