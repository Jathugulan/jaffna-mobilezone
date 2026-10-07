import type { ProductQuery } from "../types";

const NUMBER_WORDS: Record<string, number> = {
  fifty: 50e3, hundred: 100, thousand: 1000, lakh: 100000,
  "one lakh": 100000, "1 lakh": 100000, "k": 1000, m: 1_000_000,
};

function parseBudget(text: string): number[] {
  const matches = text.match(/(rs\.?\s*)?([\d,]+)\s*k\b|([\d,]+)\s*lakh|\b([\d,]+)\s*(?:million|bn)\b|\b(?:under|below|less than|between)\s+(?:rs\.?\s*)?([\d,]{3,})/gi);
  if (!matches) return [];
  const numbers: number[] = [];
  for (const m of matches) {
    const lower = m.toLowerCase();
    if (lower.includes("lakh")) {
      const num = m.match(/(\d[\d,]*)/);
      if (num) numbers.push(parseFloat(num[1].replace(/,/g, "")) * 100000);
    } else if (lower.includes("k")) {
      const num = m.match(/(\d[\d,]*)/);
      if (num) numbers.push(parseFloat(num[1].replace(/,/g, "")) * 1000);
    } else {
      const num = m.match(/(\d[\d,]*)/);
      if (num) numbers.push(parseFloat(num[1].replace(/,/g, "")));
    }
  }
  return numbers;
}

const STORAGE_RE = /(\d+\s*(?:gb|tb))/g;

function parseStorage(text: string): string[] {
  const matches = text.match(STORAGE_RE);
  if (!matches) return [];
  return matches.map((s) => s.replace(/\s+/g, "").toLowerCase());
}

const RAM_RE = /\b(\d+)\s*(?:gb\s*)?ram\b/i;

function parseRam(text: string): string | undefined {
  const m = text.match(RAM_RE);
  if (!m) return undefined;
  return m[0].toLowerCase().replace(/\s+/g, "");
}

const CAMERA_RE = /(\d+\s*mp)/i;

export function naturalToProductQuery(text: string): { query: ProductQuery; hints: string[] } {
  const lower = text.toLowerCase();
  const hints: string[] = [];
  const query: ProductQuery = {};

  const budgets = parseBudget(text);
  if (budgets.length) {
    const max = Math.max(...budgets);
    query.maxPrice = max;
    hints.push(`budget up to Rs.${max.toLocaleString()}`);
  }

  if (/30000|30k|twenty|twenty.?five|\b30\b/.test(lower)) {
    // keep above explicit budget parsing only
  }

  const storage = parseStorage(text);
  if (storage.length) {
    query.storage = storage[0].replace(/gb$/, "");
    hints.push(`storage ${storage[0].toUpperCase()}`);
  }

  const ram = parseRam(text);
  if (ram) {
    const ramNum = ram.replace(/[^0-9]/g, "");
    query.ram = ram.replace(/ram/, "") + "GB";
    hints.push(`RAM ${ramNum}GB`);
  }

  const camera = text.match(CAMERA_RE);
  if (camera) {
    hints.push(`camera ${camera[1].toUpperCase()}`);
  }

  if (/5g|5 g/.test(lower)) {
    query.supports5G = true;
    hints.push("5G support");
  }

  if (/gaming/i.test(lower)) {
    query.deal = true; // gaming => high performance: pick new/best sellers below
    hints.push("gaming focus");
  }

  if (/camera|photography|photo/gi.test(lower)) {
    hints.push("camera focus");
  }

  if (/battery|long.?lasting|backup/i.test(lower)) {
    hints.push("battery focus");
  }

  if (/best|top|good/i.test(lower)) query.bestSeller = undefined;
  if (/new|latest|launch/i.test(lower)) {
    query.newArrival = true;
    query.sort = "newest";
    hints.push("new arrivals");
  }

  if (/deal|offer|discount|cheap|under/.test(lower)) {
    query.onOffer = query.onOffer ?? true;
    if (!query.maxPrice && /deal|offer|discount/.test(lower)) hints.push("offers");
  }

  // brand detection
  const brands: string[] = [
    "samsung", "apple|iphone", "xiaomi", "redmi", "oneplus", "google|pixel",
    "oppo", "vivo", "realme", "nokia", "honor", "tecno", "infinix", "nothing",
  ];
  for (const b of brands) {
    const m = lower.match(new RegExp(b, "i"));
    if (m) {
      query.brand = query.brand ? undefined : b.includes("apple") ? "apple" : b === "google|pixel" ? "google" : b;
      hints.push(`brand: ${String(query.brand).toUpperCase()}`);
      break;
    }
  }

  return { query, hints };
}