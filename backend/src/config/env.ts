import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  mongodbUri:
    process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/jaffna_mobile_zone",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? "access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "refresh-secret",
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES ?? "15m",
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES ?? "7d",
  cookieSecure: process.env.COOKIE_SECURE === "true",
  emailFrom: process.env.EMAIL_FROM ?? "noreply@jaffnamobilezone.lk",
  aiProvider: process.env.AI_PROVIDER ?? "openai",
  aiApiKey: process.env.AI_API_KEY ?? "",
  aiBaseUrl: process.env.AI_BASE_URL ?? "https://api.openai.com/v1",
  aiModel: process.env.AI_MODEL ?? "gpt-4o-mini",
  aiMaxTokens: Number(process.env.AI_MAX_TOKENS ?? 600),
  disableAi: process.env.DISABLE_AI === "true",
  seedAdmin: process.env.SEED_ADMIN !== "false",
} as const;

export const isProduction = env.nodeEnv === "production";