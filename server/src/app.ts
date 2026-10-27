import cors from "cors";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import { env } from "./lib/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", env.trustProxy);

  app.use(
    helmet({
      // Product photos are loaded from aromawrap.co.in and www.aromawrap.co.in.
      crossOriginResourcePolicy: { policy: "same-site" },
    })
  );

  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: false, limit: "100kb" }));

  app.use(
    session({
      name: env.sessionName,
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      proxy: env.trustProxy > 0,
      cookie: {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  app.use(
    "/uploads",
    express.static(env.uploadDir, {
      dotfiles: "deny",
      index: false,
      redirect: false,
      setHeaders: (res) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Security-Policy", "default-src 'none'; img-src 'self'; sandbox");
      },
    })
  );
  app.use("/api", apiLimiter, apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
