import { Product } from "../../models/Product";
import { findProducts } from "../product.service";
import { naturalToProductQuery } from "../search.service";
import { callLLM, isAiOffline, type AIMessage } from "./ai.service";
import { formatLKR } from "../../utils/helpers";

function productToContext(p: {
  name: string;
  price: number;
  offerPrice: number | null;
  stock: number;
  brand?: { name?: string } | null;
  specifications?: Record<string, unknown>;
  slug: string;
  discountPercentage?: number;
}): string {
  const specs = p.specifications ?? {};
  return [
    `- ${p.name} (${p.brand?.name ?? "Unknown"})`,
    `  Price: ${offerPriceText(p)}, Discount: ${p.discountPercentage ?? 0}%`,
    `  Stock: ${p.stock}, Slug: ${p.slug}`,
    `  Specs: RAM=${specs.ram ?? "?"}, Storage=${specs.storage ?? "?"}, Display=${specs.display ?? "?"}, Processor=${specs.processor ?? "?"}, Camera=${specs.camera ?? "?"}, Battery=${specs.battery ?? "?"}, 5G=${(specs.supports5G as boolean) ? "yes" : "no"}`,
  ].join("\n");
}

function offerPriceText(p: { price: number; offerPrice: number | null }): string {
  return p.offerPrice ? `${formatLKR(p.offerPrice)} (was ${formatLKR(p.price)})` : formatLKR(p.price);
}

function buildFallbackResponse(products: Array<{ name: string; price: number; offerPrice: number | null; slug: string; brand?: unknown }>, query: string): string {
  if (!products.length) {
    return "I couldn't find any phones matching your request in our current catalogue. Try adjusting your budget, or explore /shop to see everything we have available. I only work with real products from our database — I never invent listings.";
  }
  const head = products.slice(0, 5);
  const brandName = (b: unknown): string => (b && typeof b === "object" && "name" in (b as Record<string, unknown>) ? String((b as Record<string, string>).name) : "JMZ");
  const lines = head.map((p, i) => `${i + 1}. **${p.name}** — ${brandName(p.brand)} · ${offerPriceText(p)}\n   → /product/${p.slug}`);
  return `Here are the best real matches for "${query}" from our catalogue:\n\n${lines.join("\n\n")}\n\nAll prices are live from our database. You can open any product for full specifications. Would you like me to compare the top two?`;
}

export async function productAssistant(query: string): Promise<{ text: string; products: unknown[] }> {
  const { query: filters, hints } = naturalToProductQuery(query);
  filters.limit = 12;
  const { data: products } = await findProducts(filters, true);

  const small = products.map((p) =>
    productToContext({
      name: p.name,
      price: p.price,
      offerPrice: p.offerPrice,
      stock: p.stock,
      brand: (p.brand as unknown as { name?: string } | null) ?? null,
      specifications: p.specifications,
      slug: p.slug,
      discountPercentage: p.discountPercentage,
    })
  );

  const context = small.length ? small.join("\n") : "(no matching products)";
  const hintText = hints.length ? `- Parsed constraints: ${hints.join(", ")}\n` : "";
  const system: string = [
    "You are the Jaffna Mobile Zone shopping assistant. Answer in plain, clear language.",
    "GROUNDING RULE: Base every claim ONLY on the PRODUCTS provided below. Never invent products, prices, stock, or specs. If the data is insufficient, say so and suggest adjusting the search.",
    "Always include the product's real price in Rs (LKR) and mention the product slug path as /product/<slug>.",
    "Recommend at most 5 products, ordered by best value for the user's stated needs.",
    `PRODUCT CATALOGUE:\n${context}`,
  ].join("\n");

  const userMessage = `Customer request: "${query}"\n${hintText}Recommend the best matching products and explain briefly why each fits. Keep the reply under 220 words.`;

  const text = await callLLM(
    [
      { role: "system", content: system },
      { role: "user", content: userMessage },
    ],
    { temperature: 0.3 }
  ).catch((err) => {
    if (isAiOffline(err)) return buildFallbackResponse(products, query);
    throw err;
  });

  return { text, products };
}