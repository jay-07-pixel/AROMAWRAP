import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, "../..");

dotenv.config({ path: path.join(serverRoot, ".env") });

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: required("DATABASE_URL"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:8080",
  uploadDir: path.resolve(serverRoot, process.env.UPLOAD_DIR ?? "uploads"),
  sessionSecret: required("SESSION_SECRET"),
  sessionName: process.env.SESSION_NAME ?? "aromawrap.sid",
  isProduction: process.env.NODE_ENV === "production",
};
