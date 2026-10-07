import { findProducts } from "../product.service";
import { naturalToProductQuery } from "../search.service";
import { callLLM, isAiOffline } from "./ai.service";
import { Product } from "../../models/Product";
import { Brand } from "../../models/Brand";
import type { ProductQuery } from "../../types";

export async function aiSearch(query: string): Promise<{ text: string; products: unknown[]; filters: Record<string, unknown> }> {
  const { query: naturalFilters, hints } = naturalToProductQuery(query);
  const filters: ProductQuery = { ...naturalFilters };
  filters.limit = 40;
  filters.q = query.length > 2 ? query : undefined;
  const { data: products } = await findProducts(filters, true);

  const rawFilters: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(filters)) if (v !== undefined) rawFilters[k] = v;
  const filterSummary = Object.entries(rawFilters).map(([k, v]) => `${k}=${String(v)}`);

  const system = `You are Jaffna Mobile Zone search. Convert the user's natural language into a short confirmation of the filters applied. Respond conversationally in under 80 words. Parsed filters: ${filterSummary.join(", ") || "none"}. Product count found: ${products.length}.`;

  const text = await callLLM(
    [
      { role: "system", content: system },
      { role: "user", content: `Search query: "${query}"` },
    ],
    { temperature: 0.2 }
  ).catch((err) => {
    if (isAiOffline(err)) {
      return `Found ${products.length} products for "${query}"${hints.length ? ` filtered by ${hints.join(", ")}` : ""}.`;
    }
    throw err;
  });

  return { text, products, filters: rawFilters };
}

export async function quickSearchSuggestions(text: string): Promise<{ products: unknown[]; suggestions: string[] }> {
  if (!text.trim()) return { products: [], suggestions: [] };
  const re = new RegExp(text, "i");
  const [products, brands] = await Promise.all([
    Product.find({ name: re, published: true })
      .select("name slug price offerPrice images brand")
      .limit(8)
      .populate("brand", "name slug")
      .lean(),
    Brand.find({ name: re, active: true }).select("name slug").limit(4).lean(),
  ]);
  return {
    products,
    suggestions: brands.map((b) => b.name),
  };
}