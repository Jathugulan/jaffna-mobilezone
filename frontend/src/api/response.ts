import type { ApiResponse } from '../types';

/**
 * The REST API nests collections and single resources under a named key
 * (for example `{ success: true, data: { brands: [...] } }`), while the frontend
 * API layer exposes the payload itself (`res.data` is the array or the entity).
 *
 * These helpers unwrap that key so every `ApiResponse<T>` declared by the API
 * modules matches the shape pages actually receive at runtime.
 */
export function unwrapList<K extends string, T>(
  res: ApiResponse<Partial<Record<K, T[]>>>,
  key: K
): ApiResponse<T[]> {
  return { ...res, data: res.data?.[key] ?? [] };
}

export function unwrapItem<K extends string, T>(
  res: ApiResponse<Partial<Record<K, T>> | null | undefined>,
  key: K
): ApiResponse<T> {
  return { ...res, data: (res.data?.[key] ?? null) as T };
}

export function mapData<T, R>(res: ApiResponse<T>, select: (data: T) => R): ApiResponse<R> {
  return { ...res, data: select(res.data) };
}