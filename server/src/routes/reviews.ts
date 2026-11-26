import { Router } from "express";
import { OrderStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { writeLimiter } from "../middleware/rateLimit.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { serializeReview } from "../reviews/serializer.js";
import {
  listReviewsQuerySchema,
  submitReviewSchema,
  type ListReviewsQuery,
} from "../reviews/schemas.js";
import {
  getUserReviewForProduct,
  listProductReviews,
  submitProductReview,
} from "../reviews/service.js";

export const reviewsRouter = Router({ mergeParams: true });

function getRouteParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

async function productExists(productId: string): Promise<boolean> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  return !!product;
}

reviewsRouter.get(
  "/",
  validateQuery(listReviewsQuerySchema),
  async (req, res, next) => {
    try {
      const productId = getRouteParam(req.params.productId);
      const { page, limit } = res.locals.validatedQuery as ListReviewsQuery;

      if (!(await productExists(productId))) {
        res.status(404).json({
          success: false,
          error: "Product not found",
        });
        return;
      }

      const data = await listProductReviews(productId, page, limit);

      res.json({
        success: true,
        data: {
          items: data.items.map(serializeReview),
          pagination: data.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

reviewsRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const productId = getRouteParam(req.params.productId);

    if (!(await productExists(productId))) {
      res.status(404).json({
        success: false,
        error: "Product not found",
      });
      return;
    }

    const review = await getUserReviewForProduct(productId, req.user!.id);

    res.json({
      success: true,
      data: review ? serializeReview(review) : null,
    });
  } catch (error) {
    next(error);
  }
});

reviewsRouter.post(
  "/",
  requireAuth,
  writeLimiter,
  validateBody(submitReviewSchema),
  async (req, res, next) => {
    try {
      const productId = getRouteParam(req.params.productId);

      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, category: true },
      });

      if (!product) {
        res.status(404).json({
          success: false,
          error: "Product not found",
        });
        return;
      }

      if (product.category.toLowerCase().includes("dhoop")) {
        res.status(409).json({
          success: false,
          error: "Reviews are not open for Coming Soon products yet.",
        });
        return;
      }

      const purchased = await prisma.orderItem.findFirst({
        where: {
          productId,
          order: {
            userId: req.user!.id,
            status: { not: OrderStatus.CANCELLED },
          },
        },
        select: { id: true },
      });

      if (!purchased) {
        res.status(403).json({
          success: false,
          error: "Only customers who have ordered this product can leave a review.",
        });
        return;
      }

      const review = await submitProductReview(
        productId,
        req.user!.id,
        req.body
      );

      res.status(201).json({
        success: true,
        data: serializeReview(review),
      });
    } catch (error) {
      next(error);
    }
  }
);
