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

const isProduction = process.env.NODE_ENV === "production";

function parseOrigins(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const corsOrigins = parseOrigins(
  process.env.CORS_ORIGIN ?? (isProduction ? "" : "http://localhost:8080")
);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: required("DATABASE_URL"),
  corsOrigins,
  uploadDir: path.resolve(serverRoot, process.env.UPLOAD_DIR ?? "uploads"),
  sessionSecret: required("SESSION_SECRET"),
  sessionName: process.env.SESSION_NAME ?? "aromawrap.sid",
  isProduction,
  /** Only an explicit NODE_ENV=development unlocks development conveniences. */
  isDevelopment: process.env.NODE_ENV === "development",
  /** Number of reverse proxies (nginx) in front of Express; needed for real client IPs and secure cookies. */
  trustProxy: Number(process.env.TRUST_PROXY ?? (isProduction ? 1 : 0)),
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM,
};

if (isProduction) {
  if (env.corsOrigins.length === 0) {
    throw new Error("CORS_ORIGIN must list the site origin(s) in production, e.g. https://aromawrap.co.in");
  }
  if (env.corsOrigins.some((origin) => origin === "*" || origin.startsWith("http://"))) {
    throw new Error("CORS_ORIGIN must only contain https:// origins in production");
  }
  if (env.sessionSecret.length < 32 || env.sessionSecret.startsWith("change-me")) {
    throw new Error("SESSION_SECRET must be a random value of at least 32 characters in production");
  }
  if (!Number.isInteger(env.trustProxy) || env.trustProxy < 0) {
    throw new Error("TRUST_PROXY must be a whole number (1 when behind nginx)");
  }
}
