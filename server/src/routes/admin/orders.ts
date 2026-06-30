import { Router } from "express";
import {
  OnlinePaymentReview,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import {
  adminListOrdersQuerySchema,
  updateOrderStatusSchema,
  updatePaymentReviewSchema,
  type AdminListOrdersQuery,
} from "../../orders/schemas.js";
import { serializeAdminOrder } from "../../orders/serializer.js";
import {
  getAdminOrderById,
  listAdminOrders,
} from "../../orders/service.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { validateBody, validateQuery } from "../../middleware/validate.js";

export const adminOrdersRouter = Router();

adminOrdersRouter.use(requireAdmin);

function getRouteParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

adminOrdersRouter.get(
  "/",
  validateQuery(adminListOrdersQuerySchema),
  async (req, res, next) => {
    try {
      const query = res.locals.validatedQuery as AdminListOrdersQuery;
      const { total, orders } = await listAdminOrders(query);

      res.json({
        success: true,
        data: {
          orders: orders.map(serializeAdminOrder),
          pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit) || 1,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

adminOrdersRouter.get("/:id", async (req, res, next) => {
  try {
    const orderId = getRouteParam(req.params.id);
    const order = await getAdminOrderById(orderId);

    if (!order) {
      res.status(404).json({
        success: false,
        error: "Order not found",
      });
      return;
    }

    res.json({
      success: true,
      data: serializeAdminOrder(order),
    });
  } catch (error) {
    next(error);
  }
});

adminOrdersRouter.patch(
  "/:id/status",
  validateBody(updateOrderStatusSchema),
  async (req, res, next) => {
    try {
      const orderId = getRouteParam(req.params.id);
      const { status } = req.body;

      const existing = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          error: "Order not found",
        });
        return;
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          items: { orderBy: { id: "asc" } },
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: serializeAdminOrder(order),
      });
    } catch (error) {
      next(error);
    }
  }
);

adminOrdersRouter.patch(
  "/:id/payment-review",
  validateBody(updatePaymentReviewSchema),
  async (req, res, next) => {
    try {
      const orderId = getRouteParam(req.params.id);
      const { action, rejectionReason } = req.body;

      const existing = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          error: "Order not found",
        });
        return;
      }

      if (existing.paymentMethod !== PaymentMethod.ONLINE) {
        res.status(400).json({
          success: false,
          error: "Payment review is only available for ONLINE orders",
        });
        return;
      }

      const updateData =
        action === "approve"
          ? {
              paymentStatus: PaymentStatus.PAID,
              onlinePaymentReview: OnlinePaymentReview.APPROVED,
              paymentRejectionReason: null,
            }
          : {
              paymentStatus: PaymentStatus.FAILED,
              onlinePaymentReview: OnlinePaymentReview.REJECTED,
              paymentRejectionReason: rejectionReason,
            };

      const order = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          items: { orderBy: { id: "asc" } },
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: serializeAdminOrder(order),
      });
    } catch (error) {
      next(error);
    }
  }
);
