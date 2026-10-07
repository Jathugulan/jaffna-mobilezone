import { Product } from "../../models/Product";
import { callLLM, isAiOffline } from "./ai.service";
import { formatLKR } from "../../utils/helpers";

export async function aiRecommendations(userId: string | null, limit = 10): Promise<{ text: string; products: unknown[] }> {
  const filters: Record<string, unknown> = { published: true, stock: { $gt: 0 } };

  if (userId) {
    const { Wishlist } = await import("../../models/Wishlist");
    const { Order } = await import("../../models/Order");
    const [wishlist, recentOrders] = await Promise.all([
      Wishlist.findOne({ user: userId }).lean(),
      Order.find({ user: userId }).sort({ createdAt: -1 }).limit(10).select("items").lean(),
    ]);
    const likedIds = [...(wishlist?.products ?? []), ...recentOrders.flatMap((o) => o.items.map((i) => i.product))];
    if (likedIds.length) {
      const liked = await Product.find({ _id: { $in: likedIds } }).select("brand category specifications.ram specifications.storage").lean();
      const brandIds = liked.map((p) => p.brand).filter(Boolean);
      if (brandIds.length) {
        filters.brand = brandIds;
        filters._id = { $nin: likedIds };
      }
    }
  }

  const base = ["featured"] as const;
  const products = await Product.find(filters as never)
    .sort({ [base[0] === "featured" ? "featured" : "createdAt"]: -1, salesCount: -1 })
    .limit(limit)
    .populate("brand", "name slug")
    .lean();

  if (!products.length) {
    return { text: "We don't have recommendations for you yet — explore /shop to find your next device.", products: [] };
  }

  const context = products
    .slice(0, 10)
    .map((p) => `- ${p.name} (${(p.brand as unknown as { name?: string })?.name ?? ""}) ${p.offerPrice ? formatLKR(p.offerPrice) : formatLKR(p.price)} ${p.stock > 0 ? "in stock" : "low stock"} /product/${p.slug}`)
    .join("\n");

  const text = await callLLM(
    [
      { role: "system", content: "You are a personal shopper for Jaffna Mobile Zone. Recommend products strictly from the provided list with real prices. Under 150 words." },
      { role: "user", content: `Recommended catalogue:\n${context}\n\nExplain the top 3 picks and why.` },
    ],
    { temperature: 0.4 }
  ).catch((err) => {
    if (isAiOffline(err)) {
      const top = products.slice(0, 3).map((p, i) => `${i + 1}. **${p.name}** — ${p.offerPrice ? formatLKR(p.offerPrice) : formatLKR(p.price)} → /product/${p.slug}`);
      return `Based on your activity, we recommend:\n\n${top.join("\n\n")}`;
    }
    throw err;
  });

  return { text, products };
}