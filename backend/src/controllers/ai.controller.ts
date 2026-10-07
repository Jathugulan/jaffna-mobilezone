import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import { productAssistant } from "../services/ai/productAssistant";
import { aiSearch, quickSearchSuggestions } from "../services/ai/search";
import { aiCompare } from "../services/ai/compare";
import { aiRecommendations } from "../services/ai/recommendations";
import { businessAssistant, orderAssistant } from "../services/ai/adminAssistant";
import { getWishlistService } from "../services/wishlist.service";
import type { AuthedRequest } from "../types/express";
import { getOrderAssistantContext } from "../services/ai/adminAssistant";

export const productAssistantHandler = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: { query: string } } }).validated.body;
  const { text, products } = await productAssistant(body.query);
  return success(res, { text, products });
});

export const searchHandler = asyncHandler(async (req, res) => {
  const body = (req as unknown as { validated: { body: { query: string } } }).validated.body;
  const result = await aiSearch(body.query);
  return success(res, result);
});

export const suggestionsHandler = asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? "");
  const result = await quickSearchSuggestions(q);
  return success(res, result);
});

export const compareHandler = asyncHandler(async (req, res) => {
  const body = (req as unknown as { validated: { body: { productIds: string[]; question?: string } } }).validated.body;
  const { text, products } = await aiCompare(body.productIds, body.question ?? "Compare these phones and recommend the best one for me.");
  return success(res, { text, products });
});

export const recommendationsHandler = asyncHandler(async (req: AuthedRequest, res) => {
  const { text, products } = await aiRecommendations(req.user?.id ?? null, 10);
  return success(res, { text, products });
});

export const wishlistRecommendationsHandler = asyncHandler(async (req: AuthedRequest, res) => {
  const wishlist = await getWishlistService(req.user!.id);
  const { text, products } = await aiRecommendations(req.user!.id, 10);
  return success(res, { wishlistCount: wishlist.count, text, products });
});

export const orderAssistantHandler = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: { query: string } } }).validated.body;
  const { text } = await orderAssistant(body.query, req.user!.id);
  const context = await getOrderAssistantContext(req.user!.id);
  return success(res, { text, orders: context.orders });
});

export const businessAssistantHandler = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: { query: string } } }).validated.body;
  const { text, context } = await businessAssistant(body.query);
  return success(res, { text, context });
});