import { Product } from "../../models/Product";
import { callLLM } from "./ai.service";
import { formatLKR } from "../../utils/helpers";

function specItem(p: {
  name: string;
  price: number;
  offerPrice: number | null;
  specifications?: Record<string, unknown>;
  warranty?: string;
}): string {
  const s = p.specifications ?? {};
  return [
    `Product: ${p.name}`,
    `Price: ${p.offerPrice ? formatLKR(p.offerPrice) : formatLKR(p.price)} ${p.offerPrice ? `(regular ${formatLKR(p.price)})` : ""}`,
    `Display: ${s.display ?? "?"}`,
    `Processor: ${s.processor ?? "?"}`,
    `RAM: ${s.ram ?? "?"}`,
    `Storage: ${s.storage ?? "?"}`,
    `Camera: ${s.camera ?? "?"}`,
    `Battery: ${s.battery ?? "?"}`,
    `OS: ${s.operatingSystem ?? "?"}`,
    `5G: ${s.supports5G ? "Yes" : "No"}`,
    `Warranty: ${p.warranty ?? "?"}`,
  ].join("\n");
}

function fallbackCompare(products: Array<{ name: string; price: number; offerPrice: number | null; stock: number; specifications?: Record<string, unknown>; warranty?: string }>, question: string): string {
  if (products.length < 2) {
    return "I need at least two products to compare. Please select two or more products from the catalogue.";
  }
  const [a, b] = products;
  const sa = a.specifications ?? {};
  const sb = b.specifications ?? {};
  const priceA = a.offerPrice ?? a.price;
  const priceB = b.offerPrice ?? b.price;
  const lines = [
    `**${a.name}** vs **${b.name}**`,
    "",
    `- Price: **${formatLKR(priceA)}** vs **${formatLKR(priceB)}**`,
    `- Display: \`${sa.display ?? "?"}\` vs \`${sb.display ?? "?"}\``,
    `- Processor: \`${sa.processor ?? "?"}\` vs \`${sb.processor ?? "?"}\``,
    `- RAM: \`${sa.ram ?? "?"}\` vs \`${sb.ram ?? "?"}\``,
    `- Storage: \`${sa.storage ?? "?"}\` vs \`${sb.storage ?? "?"}\``,
    `- Camera: \`${sa.camera ?? "?"}\` vs \`${sb.camera ?? "?"}\``,
    `- Battery: \`${sa.battery ?? "?"}\` vs \`${sb.battery ?? "?"}\``,
    `- 5G: ${sa.supports5G ? "Yes" : "No"} vs ${sb.supports5G ? "Yes" : "No"}`,
    "",
    priceA <= priceB
      ? `**Recommendation:** for the best value, **${a.name}** at ${formatLKR(priceA)} is the cheaper pick, ${sa.ram !== sb.ram ? `with ${sa.ram ?? "?"} RAM versus ${sb.ram ?? "?"}.` : "with similar RAM."}`
      : `**Recommendation:** for the best value, **${b.name}** at ${formatLKR(priceB)} is the cheaper pick, ${sb.ram !== sa.ram ? `with ${sb.ram ?? "?"} RAM versus ${sa.ram ?? "?"}.` : "with similar RAM."}`,
  ];
  return lines.join("\n");
}

export async function aiCompare(productIds: string[], question: string): Promise<{ text: string; products: unknown[] }> {
  const products = await Product.find({ _id: { $in: productIds } })
    .populate("brand", "name")
    .lean();

  if (products.length < 2) {
    return { text: "I need at least two valid products to compare.", products: [] };
  }

  const context = products.map(specItem).join("\n\n---\n\n");
  const system = [
    "You are the Jaffna Mobile Zone comparison expert.",
    "GROUNDING RULE: Use ONLY the provided product data. Never invent specs or prices.",
    "Compare the products clearly, then recommend when the user should pick each one given their needs.",
    `User follow-up: "${question}"`,
    "",
    context,
  ].join("\n");

  const text = await callLLM(
    [
      { role: "system", content: system },
      { role: "user", content: "Produce a concise factual comparison in under 260 words." },
    ],
    { temperature: 0.3 }
  ).catch(() => fallbackCompare(products, question));

  return { text, products };
}