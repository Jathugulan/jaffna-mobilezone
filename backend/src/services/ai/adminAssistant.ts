import { Product } from "../../models/Product";
import { Order } from "../../models/Order";
import { Offer } from "../../models/Offer";
import { Review } from "../../models/Review";
import { getOverview, getTopProductsAllTime, getBrandPerformance, getOfferPerformance } from "../analytics.service";
import { callLLM, isAiOffline } from "./ai.service";
import { formatLKR } from "../../utils/helpers";

interface BusinessContext {
  overview: Awaited<ReturnType<typeof getOverview>>;
  lowStock: Array<{ name: string; stock: number; slug: string }>;
  outOfStock: Array<{ name: string; stock: number; slug: string }>;
  topProducts: Array<{ name: string; salesCount: number; stock: number; price: number }>;
  activeOffers: Array<{ name: string; endDate: Date | null }>;
  recentReviews: Array<{ rating: number; comment: string; product?: string }>;
}

async function buildBusinessContext(): Promise<BusinessContext> {
  const overview = await getOverview("30d");

  const lowStock = await Product.find({ stock: { $gt: 0, $lte: 5 } })
    .sort({ stock: 1 })
    .limit(15)
    .select("name stock slug")
    .lean();
  const outOfStock = await Product.find({ stock: 0 })
    .sort({ createdAt: -1 })
    .limit(15)
    .select("name stock slug")
    .lean();
  const topProducts = await getTopProductsAllTime(10);
  const activeOffers = await Offer.find({ active: true })
    .sort({ endDate: 1 })
    .limit(10)
    .select("name endDate")
    .lean();

  const reviews = await Review.find({ status: "approved" })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("product", "name")
    .select("rating comment product createdAt")
    .lean();

  return {
    overview,
    lowStock,
    outOfStock,
    topProducts: topProducts.map((p) => ({ name: p.name, salesCount: p.salesCount, stock: p.stock, price: p.price })),
    activeOffers: activeOffers.map((o) => ({ name: o.name, endDate: o.endDate })),
    recentReviews: reviews.map((r) => ({
      rating: r.rating,
      comment: r.comment.slice(0, 200),
      product: (r.product as unknown as { name?: string } | null)?.name,
    })),
  };
}

function buildFallback(query: string, ctx: BusinessContext): string {
  const lower = query.toLowerCase();
  const { overview, lowStock, outOfStock, topProducts, activeOffers, recentReviews } = ctx;

  if (/low\s?in\s?stock|low\s?stock/.test(lower)) {
    return lowStock.length
      ? `Products low in stock (${lowStock.length}):\n${lowStock.map((p) => `- ${p.name} — only ${p.stock} left`).join("\n")}`
      : "No products are currently low in stock.";
  }
  if (/out\s?of\s?stock/.test(lower)) {
    return outOfStock.length
      ? `Out of stock (${outOfStock.length}):\n${outOfStock.map((p) => `- ${p.name}`).join("\n")}`
      : "No products are out of stock.";
  }
  if (/best\s?sell|selling|top\s?product|most/.test(lower)) {
    return `Top selling products:\n${topProducts.slice(0, 8).map((p, i) => `${i + 1}. ${p.name} — ${p.salesCount} sold`).join("\n")}\n\nRevenue (30d): ${formatLKR(overview.totalRevenue)}`;
  }
  if (/active\s?offer|offer/.test(lower)) {
    return activeOffers.length
      ? `Active offers:\n${activeOffers.map((o) => `- ${o.name} (ends ${o.endDate ? new Date(o.endDate).toLocaleDateString() : "soon"})`).join("\n")}`
      : "There are no active offers right now.";
  }
  if (/sales\s?by\s?brand|brand.*sell|top\s?brand/.test(lower)) {
    return "Use the Analytics > Brands chart for the full breakdown." + (topProducts.length ? `\nTop product: ${topProducts[0].name}.` : "");
  }
  if (/sales|revenue|month|summary|performance/.test(lower)) {
    return [
      `**Sales summary (last 30 days)**`,
      `- Revenue: ${formatLKR(overview.totalRevenue)}`,
      `- Orders: ${overview.totalOrders}`,
      `- Avg order value: ${formatLKR(overview.averageOrderValue)}`,
      `- Low stock items: ${overview.lowStock}`,
      `- Out of stock: ${overview.outOfStock}`,
    ].join("\n");
  }
  if (/review|customer\s?feedback|feedback/.test(lower)) {
    const avg = recentReviews.length ? (recentReviews.reduce((s: number, r) => s + r.rating, 0) / recentReviews.length).toFixed(1) : "0";
    return recentReviews.length
      ? `Recent approved reviews (avg ${avg}/5):\n${recentReviews.slice(0, 10).map((r) => `- [${r.rating}★] ${r.comment.slice(0, 90)}…`).join("\n")}`
      : "No approved reviews yet.";
  }
  if (/slow.?moving|not\s?sell|\bviews\b|high\s?views/.test(lower)) {
    const slow = topProducts.sort((a, b) => a.salesCount - b.salesCount).slice(0, 5);
    return `Potential slow-moving products:\n${slow.map((p) => `- ${p.name} — ${p.salesCount} sold`).join("\n")}`;
  }
  return "";
}

export async function businessAssistant(query: string): Promise<{ text: string; context: BusinessContext }> {
  const ctx = await buildBusinessContext();
  const fallback = buildFallback(query, ctx);
  if (fallback) return { text: fallback, context: ctx };

  const context = [
    `Overview (30 days): ${JSON.stringify(ctx.overview)}`,
    `Low stock: ${ctx.lowStock.map((p) => `${p.name}(${p.stock})`).join(", ") || "none"}`,
    `Out of stock: ${ctx.outOfStock.map((p) => p.name).join(", ") || "none"}`,
    `Top products: ${ctx.topProducts.slice(0, 8).map((p) => `${p.name}(${p.salesCount} sold)`).join(", ")}`,
    `Active offers: ${ctx.activeOffers.map((o) => `${o.name}->${new Date(o.endDate ?? 0).toLocaleDateString()}`).join(", ") || "none"}`,
    `Recent review ratings: ${ctx.recentReviews.map((r) => `${r.rating}st`).join(", ")}`,
  ].join("\n");

  const text = await callLLM(
    [
      {
        role: "system",
        content:
          "You are the Jaffna Mobile Zone business intelligence assistant. GROUNDING RULE: use ONLY the provided business data. Answer precisely, with numbers in Rs (LKR). Under 240 words.",
      },
      { role: "user", content: `Question: ${query}\n\nLIVE DATA:\n${context}` },
    ],
    { temperature: 0.2 }
  ).catch((err) => {
    if (isAiOffline(err)) {
      return "I can analyze your live business data. Ask me things like: 'which products are low in stock?', 'show top-selling products', 'what are our active offers?', or 'summarize this month's sales'. This fallback mode works fully from real database data.";
    }
    throw err;
  });

  return { text, context: ctx };
}

export async function getOrderAssistantContext(userId: string) {
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(5).select("orderNumber total orderStatus createdAt").lean();
  return {
    orders: orders.map((o) => ({
      number: o.orderNumber,
      total: o.total,
      status: o.orderStatus,
      date: o.createdAt,
    })),
  };
}

export async function orderAssistant(query: string, userId: string): Promise<{ text: string }> {
  const lower = query.toLowerCase();
  const ctx = await getOrderAssistantContext(userId);

  if (ctx.orders.length === 0) {
    return { text: "You haven't placed any orders yet. When you do, I'll be able to track them here for you." };
  }

  if (/track|status|where|my order/.test(lower)) {
    const latest = ctx.orders[0];
    return {
      text: `Your most recent order **${latest.number}** is **${latest.status.replace(/([A-Z])/g, " $1")}** (placed ${new Date(latest.date).toLocaleDateString()}, total ${formatLKR(latest.total)}).\n\nYou can track it in Customer Dashboard → Orders.`,
    };
  }

  if (/how many|list|all/.test(lower)) {
    return {
      text: `You have ${ctx.orders.length} order(s):\n${ctx.orders.map((o, i) => `${i + 1}. ${o.number} — ${formatLKR(o.total)} — ${o.status}`).join("\n")}`,
    };
  }

  if (/return|cancel|refund/.test(lower)) {
    return { text: "You can request a cancellation/return in Customer Dashboard → Orders → your order. Open the order and use the *Cancel Order* or *Request Return* action. Our team reviews requests within 24 hours." };
  }

  return { text: `I currently see ${ctx.orders.length} order(s) for your account, the latest being **${ctx.orders[0].number}** (${ctx.orders[0].status}). Ask me to 'track my order' or 'list my orders'.` };
}