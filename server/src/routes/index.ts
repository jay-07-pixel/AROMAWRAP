import { Router } from "express";
import { addressesRouter } from "./addresses.js";
import { profileRouter } from "./profile.js";
import { adminOrdersRouter } from "./admin/orders.js";
import { authRouter } from "./auth.js";
import { cartRouter } from "./cart.js";
import { healthRouter } from "./health.js";
import { ordersRouter } from "./orders.js";
import { productsRouter } from "./products.js";
import { uploadsRouter } from "./uploads.js";
import { wishlistRouter } from "./wishlist.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/wishlist", wishlistRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/profile", profileRouter);
apiRouter.use("/addresses", addressesRouter);
apiRouter.use("/admin/orders", adminOrdersRouter);
apiRouter.use("/uploads", uploadsRouter);
