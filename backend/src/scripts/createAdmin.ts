import mongoose from "mongoose";
import { env } from "../config/env";
import { ensureAdminAccount } from "../services/adminSeed.service";

async function createAdmin(): Promise<void> {
  await mongoose.connect(env.mongodbUri);

  const result = await ensureAdminAccount();
  const status = result.created ? "created" : result.repaired ? "repaired" : "already healthy";

  console.log(
    `[seed] Admin ${status} -> username: ${result.username} | email: ${result.email}` +
      (result.created ? " | password: default (Admin@1234 unless ADMIN_PASSWORD is set)" : "")
  );

  await mongoose.disconnect();
}

createAdmin().catch((err) => {
  console.error("[seed] Failed to create admin", err);
  process.exit(1);
});