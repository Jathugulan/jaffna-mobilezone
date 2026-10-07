import { api } from './client';
import { unwrapItem, unwrapList } from './response';
import type { Address, ApiResponse, FAQ, HeroSlide, Testimonial } from '../types';

export const contentApi = {
  // Hero slides
  getHeroSlides: async () => {
    const res = await api.get<ApiResponse<{ slides: HeroSlide[] }>>('/hero-slides');
    return unwrapList(res, 'slides');
  },
  createHeroSlide: async (slide: Partial<HeroSlide>) => {
    const res = await api.post<ApiResponse<{ slide: HeroSlide }>>('/hero-slides', slide);
    return unwrapItem(res, 'slide');
  },
  updateHeroSlide: async (id: string, slide: Partial<HeroSlide>) => {
    const res = await api.put<ApiResponse<{ slide: HeroSlide }>>(`/hero-slides/${id}`, slide);
    return unwrapItem(res, 'slide');
  },
  deleteHeroSlide: async (id: string) => {
    return api.delete<ApiResponse<{ message: string }>>(`/hero-slides/${id}`);
  },

  // Homepage sections
  getHomepage: async () => {
    return api.get<ApiResponse<Record<string, unknown>>>('/homepage');
  },
  updateHomepage: async (data: Record<string, unknown>) => {
    return api.put<ApiResponse<Record<string, unknown>>>('/homepage', data);
  },

  // Testimonials
  getTestimonials: async () => {
    const res = await api.get<ApiResponse<{ testimonials: Testimonial[] }>>('/testimonials');
    return unwrapList(res, 'testimonials');
  },
  createTestimonial: async (item: Partial<Testimonial>) => {
    const res = await api.post<ApiResponse<{ testimonial: Testimonial }>>('/testimonials', item);
    return unwrapItem(res, 'testimonial');
  },
  deleteTestimonial: async (id: string) => {
    return api.delete<ApiResponse<{ message: string }>>(`/testimonials/${id}`);
  },

  // FAQs
  getFaqs: async () => {
    const res = await api.get<ApiResponse<{ faqs: FAQ[] }>>('/faq');
    return unwrapList(res, 'faqs');
  },
  createFaq: async (item: Partial<FAQ>) => {
    const res = await api.post<ApiResponse<{ faq: FAQ }>>('/faq', item);
    return unwrapItem(res, 'faq');
  },
  deleteFaq: async (id: string) => {
    return api.delete<ApiResponse<{ message: string }>>(`/faq/${id}`);
  },

  // Addresses
  getAddresses: async () => {
    const res = await api.get<ApiResponse<{ addresses: Address[] }>>('/addresses');
    return unwrapList(res, 'addresses');
  },
  createAddress: async (address: Partial<Address>) => {
    const res = await api.post<ApiResponse<{ address: Address }>>('/addresses', address);
    return unwrapItem(res, 'address');
  },
  updateAddress: async (id: string, address: Partial<Address>) => {
    const res = await api.put<ApiResponse<{ address: Address }>>(`/addresses/${id}`, address);
    return unwrapItem(res, 'address');
  },
  deleteAddress: async (id: string) => {
    return api.delete<ApiResponse<{ message: string }>>(`/addresses/${id}`);
  },
  setDefaultAddress: async (id: string) => {
    const res = await api.put<ApiResponse<{ address: Address }>>(`/addresses/${id}/default`);
    return unwrapItem(res, 'address');
  },
};
