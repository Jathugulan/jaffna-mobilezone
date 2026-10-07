type Level = "info" | "warn" | "error" | "debug";

const shouldInclude = (level: Level): boolean => {
  if (process.env.NODE_ENV === "test") return false;
  if (process.env.NODE_ENV === "production") {
    return level === "error" || level === "warn";
  }
  return true;
};

function write(level: Level, message: string, meta?: unknown): void {
  if (!shouldInclude(level)) return;
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
  if (meta !== undefined) {
    // eslint-disable-next-line no-console
    console.log(line, JSON.stringify(meta));
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

export const logger = {
  info: (message: string, meta?: unknown) => write("info", message, meta),
  warn: (message: string, meta?: unknown) => write("warn", message, meta),
  error: (message: string, meta?: unknown) => write("error", message, meta),
  debug: (message: string, meta?: unknown) => write("debug", message, meta),
};