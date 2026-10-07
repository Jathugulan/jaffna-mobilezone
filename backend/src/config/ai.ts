import { env } from "./env";

export interface AIConfig {
  provider: "openai" | "rulebased";
  apiKey?: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
}

/**
 * `.env.example` ships a placeholder key so contributors can see the shape of the
 * config. Treat placeholders and obviously incomplete keys as "not configured" so
 * the app falls back to the grounded rule-based engine instead of firing doomed
 * requests at the provider (which would surface as 500s).
 */
function isUsableApiKey(key: string | undefined): boolean {
  if (!key) return false;
  const normalized = key.trim().toLowerCase();
  if (!normalized) return false;
  return !(
    normalized.includes("your-") ||
    normalized.includes("placeholder") ||
    normalized.includes("changeme") ||
    normalized.includes("example")
  );
}

export function getAIConfig(): AIConfig {
  const disabled = env.disableAi || !isUsableApiKey(env.aiApiKey);
  return {
    provider: disabled ? "rulebased" : "openai",
    apiKey: env.aiApiKey || undefined,
    baseUrl: env.aiBaseUrl,
    model: env.aiModel,
    maxTokens: env.aiMaxTokens,
  };
}