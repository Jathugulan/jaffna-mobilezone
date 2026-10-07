import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import {
  getWishlistService,
  addToWishlistService,
  removeFromWishlistService,
  moveToCartService,
} from "../services/wishlist.service";
import type { AuthedRequest } from "../types/express";

export const getWishlist = asyncHandler(async (req: AuthedRequest, res) => {
  const wishlist = await getWishlistService(req.user!.id);
  return success(res, wishlist);
});

export const addToWishlist = asyncHandler(async (req: AuthedRequest, res) => {
  const wishlist = await addToWishlistService(req.user!.id, req.params.productId);
  return success(res, wishlist, undefined, 201);
});

export const removeFromWishlist = asyncHandler(async (req: AuthedRequest, res) => {
  const wishlist = await removeFromWishlistService(req.user!.id, req.params.productId);
  return success(res, wishlist);
});

export const moveToCart = asyncHandler(async (req: AuthedRequest, res) => {
  const wishlist = await moveToCartService(req.user!.id, req.params.productId);
  return success(res, wishlist);
});