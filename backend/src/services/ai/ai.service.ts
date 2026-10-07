import { getAIConfig } from "../../config/ai";
import { logger } from "../../utils/logger";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function callLLM(
  messages: AIMessage[],
  opts?: { json?: boolean; maxTokens?: number; temperature?: number }
): Promise<string> {
  const config = getAIConfig();

  if (config.provider === "rulebased") {
    throw new Error("AI_OFFLINE");
  }

  const url = `${config.baseUrl.replace(/\/$/, "")}/chat/completions`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: opts?.maxTokens ?? config.maxTokens,
        temperature: opts?.temperature ?? 0.2,
        ...(opts?.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      logger.error("AI provider error", { status: res.status, text: text.slice(0, 300) });
      throw new Error("AI_PROVIDER_ERROR");
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return json.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    logger.error("AI call failed", { message: err instanceof Error ? err.message : String(err) });
    throw err;
  }
}

export async function callLLMAggregated<T = Record<string, unknown>>(
  messages: AIMessage[]
): Promise<T> {
  const raw = await callLLM(messages, { json: true, temperature: 0 });
  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return {} as T;
  }
}

export function isAiOffline(err: unknown): boolean {
  return err instanceof Error && err.message === "AI_OFFLINE";
}