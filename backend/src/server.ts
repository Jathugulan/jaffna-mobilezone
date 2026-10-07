import { createApp } from "./app";
import { connectDatabase } from "./config/database";
import { env, isProduction } from "./config/env";
import { logger } from "./utils/logger";
import { ensureAdminAccount } from "./services/adminSeed.service";

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();

    // Guarantees the admin account exists so `admin` / `Admin@1234` can always log in.
    // Runs on every non-production boot (and in production when SEED_ADMIN=true).
    if (!isProduction && env.seedAdmin) {
      try {
        await ensureAdminAccount();
      } catch (seedErr) {
        logger.error("Admin seed check failed - login may be unavailable until it is fixed.", {
          message: seedErr instanceof Error ? seedErr.message : String(seedErr),
          hint: "Re-run it manually with `npm run seed:admin` inside the backend folder.",
        });
      }
    }

    const app = createApp();
    const server = app.listen(env.port, () => {
      logger.info(`Jaffna Mobile Zone API running on http://localhost:${env.port} (${env.nodeEnv})`);
    });

    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        logger.error(`Port ${env.port} is already in use (EADDRINUSE) - another API instance is still listening.`, {
          hint: "A leftover nodemon/ts-node process usually keeps the port open. Stop it and run `npm run dev` again.",
          windowsFix: `Get-NetTCPConnection -LocalPort ${env.port} | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { taskkill /PID $_ /T /F }`,
          macLinuxFix: `lsof -ti :${env.port} | xargs kill -9`,
          alternative: `Or set a free port in backend/.env, e.g. PORT=${env.port + 1}`,
        });
      } else if (err.code === "EACCES") {
        logger.error(`Not allowed to bind port ${env.port} (EACCES).`, {
          alternative: `Set a port above 1024 in backend/.env, e.g. PORT=5000`,
        });
      } else {
        logger.error("HTTP server error", { code: err.code, message: err.message });
      }
      process.exit(1);
    });

    const shutdown = (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      server.close(() => {
        void (async () => {
          const { disconnectDatabase } = await import("./config/database");
          await disconnectDatabase();
          process.exit(0);
        })();
      });
      setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    logger.error("Failed to start server", { message: err instanceof Error ? err.message : String(err) });
    process.exit(1);
  }
}

bootstrap();