import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import {
  addToCartService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
  loadCart,
  applyCouponService,
} from "../services/cart.service";
import type { AuthedRequest } from "../types/express";

export const getCart = asyncHandler(async (req: AuthedRequest, res) => {
  const cart = await loadCart(req.user!.id);
  return success(res, { cart });
});

export const addToCart = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as {
    validated: {
      body: { product: string; quantity?: number; variant?: Record<string, unknown> };
    };
  }).validated.body;
  const cart = await addToCartService(req.user!.id, body.product, body.quantity ?? 1, body.variant);
  return success(res, { cart }, undefined, 201);
});

export const updateCartItem = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: { quantity: number } } }).validated.body;
  const cart = await updateCartItemService(req.user!.id, req.params.productId, body.quantity);
  return success(res, { cart });
});

export const removeCartItem = asyncHandler(async (req: AuthedRequest, res) => {
  const cart = await removeCartItemService(req.user!.id, req.params.productId);
  return success(res, { cart });
});

export const clearCart = asyncHandler(async (req: AuthedRequest, res) => {
  const cart = await clearCartService(req.user!.id);
  return success(res, { cart });
});

export const applyCoupon = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: { code: string } } }).validated.body;
  const result = await applyCouponService(req.user!.id, body.code);
  return success(res, result);
});