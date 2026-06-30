import { Router } from "express";
import { createOrderSchema } from "../orders/schemas.js";
import { serializeOrder } from "../orders/serializer.js";
import {
  createOrderFromCart,
  findOrderForUser,
  getOrdersForUser,
  OrderError,
} from "../orders/service.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

function getRouteParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

ordersRouter.post("/", validateBody(createOrderSchema), async (req, res, next) => {
  try {
    const order = await createOrderFromCart(req.user!.id, req.body);
    res.status(201).json({
      success: true,
      data: serializeOrder(order),
    });
  } catch (error) {
    if (error instanceof OrderError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
});

ordersRouter.get("/", async (req, res, next) => {
  try {
    const orders = await getOrdersForUser(req.user!.id);
    res.json({
      success: true,
      data: {
        orders: orders.map(serializeOrder),
      },
    });
  } catch (error) {
    next(error);
  }
});

ordersRouter.get("/:id", async (req, res, next) => {
  try {
    const orderId = getRouteParam(req.params.id);
    const order = await findOrderForUser(req.user!.id, orderId);

    if (!order) {
      res.status(404).json({
        success: false,
        error: "Order not found",
      });
      return;
    }

    res.json({
      success: true,
      data: serializeOrder(order),
    });
  } catch (error) {
    next(error);
  }
});
