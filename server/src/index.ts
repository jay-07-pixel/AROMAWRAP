import fs from "fs";
import path from "path";
import { createApp } from "./app.js";
import { env } from "./lib/env.js";
import { connectDatabase, disconnectDatabase } from "./lib/prisma.js";
import { UPLOAD_SUBDIRS } from "./uploads/config.js";

async function ensureUploadDirectories() {
  fs.mkdirSync(env.uploadDir, { recursive: true });

  for (const subdir of Object.values(UPLOAD_SUBDIRS)) {
    fs.mkdirSync(path.join(env.uploadDir, subdir), { recursive: true });
  }
}

async function main() {
  await ensureUploadDirectories();

  try {
    await connectDatabase();
    console.log("Database connected");
  } catch (error) {
    console.warn(
      "Database connection failed — server will start; /api/health will report status.",
      error instanceof Error ? error.message : error
    );
  }

  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`AromaWrap API listening on http://localhost:${env.port}`);
    console.log(`Health check: http://localhost:${env.port}/api/health`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
