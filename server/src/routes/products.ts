import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
  createProductSchema,
  listProductsQuerySchema,
  updateProductSchema,
  type ListProductsQuery,
} from "../products/schemas.js";
import { serializeProduct } from "../products/serializer.js";
import { buildUniqueSlug, slugify } from "../products/utils.js";

export const productsRouter = Router();

const productInclude = { images: true } as const;

function getRouteParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function getSortOrder(
  sort: string
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-low":
      return { price: "asc" };
    case "price-high":
      return { price: "desc" };
    case "name-asc":
      return { name: "asc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

productsRouter.get(
  "/",
  validateQuery(listProductsQuerySchema),
  async (req, res, next) => {
    try {
      const { category, search, sort, page, limit } =
        res.locals.validatedQuery as ListProductsQuery;

      const andFilters: Prisma.ProductWhereInput[] = [];

      if (category) {
        andFilters.push({ category });
      }

      if (search) {
        andFilters.push({
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
            { category: { contains: search } },
          ],
        });
      }

      const where: Prisma.ProductWhereInput =
        andFilters.length > 0 ? { AND: andFilters } : {};

      const skip = (page - 1) * limit;

      const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          include: productInclude,
          orderBy: getSortOrder(sort),
          skip,
          take: limit,
        }),
      ]);

      res.json({
        success: true,
        data: {
          items: products.map(serializeProduct),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

productsRouter.get("/slug/:slug", async (req, res, next) => {
  try {
    const slug = getRouteParam(req.params.slug);
    const product = await prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });

    if (!product) {
      res.status(404).json({
        success: false,
        error: "Product not found",
      });
      return;
    }

    res.json({
      success: true,
      data: serializeProduct(product),
    });
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = getRouteParam(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });

    if (!product) {
      res.status(404).json({
        success: false,
        error: "Product not found",
      });
      return;
    }

    res.json({
      success: true,
      data: serializeProduct(product),
    });
  } catch (error) {
    next(error);
  }
});

productsRouter.post(
  "/",
  requireAdmin,
  validateBody(createProductSchema),
  async (req, res, next) => {
    try {
      const {
        name,
        slug: inputSlug,
        description,
        category,
        price,
        originalPrice,
        badge,
        stock,
        rating,
        reviewsCount,
        images,
      } = req.body;

      const baseSlug = inputSlug ? slugify(inputSlug) : slugify(name);
      const slugSource = inputSlug ?? name;

      const finalSlug = await buildUniqueSlug(slugSource, async (candidate) =>
        prisma.product.findUnique({
          where: { slug: candidate },
          select: { id: true },
        })
      );

      const product = await prisma.product.create({
        data: {
          name,
          slug: finalSlug || baseSlug,
          description,
          category,
          price,
          originalPrice: originalPrice ?? null,
          badge: badge ?? null,
          stock,
          rating: rating ?? null,
          reviewsCount: reviewsCount ?? null,
          images: {
            create: images.map(
              (
                image: { imageUrl: string; sortOrder?: number },
                index: number
              ) => ({
                imageUrl: image.imageUrl,
                sortOrder: image.sortOrder ?? index,
              })
            ),
          },
        },
        include: productInclude,
      });

      res.status(201).json({
        success: true,
        data: serializeProduct(product),
      });
    } catch (error) {
      next(error);
    }
  }
);

productsRouter.patch(
  "/:id",
  requireAdmin,
  validateBody(updateProductSchema),
  async (req, res, next) => {
    try {
      const productId = getRouteParam(req.params.id);
      const existing = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, slug: true },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          error: "Product not found",
        });
        return;
      }

      const {
        name,
        slug: inputSlug,
        description,
        category,
        price,
        originalPrice,
        badge,
        stock,
        rating,
        reviewsCount,
        images,
      } = req.body;

      let slug = existing.slug;
      if (inputSlug) {
        slug = await buildUniqueSlug(
          slugify(inputSlug),
          async (candidate) =>
            prisma.product.findUnique({
              where: { slug: candidate },
              select: { id: true },
            }),
          existing.id
        );
      } else if (name && name !== existing.name) {
        slug = await buildUniqueSlug(
          name,
          async (candidate) =>
            prisma.product.findUnique({
              where: { slug: candidate },
              select: { id: true },
            }),
          existing.id
        );
      }

      const product = await prisma.$transaction(async (tx) => {
        if (images) {
          await tx.productImage.deleteMany({
            where: { productId: existing.id },
          });
        }

        return tx.product.update({
          where: { id: existing.id },
          data: {
            ...(name !== undefined ? { name } : {}),
            slug,
            ...(description !== undefined ? { description } : {}),
            ...(category !== undefined ? { category } : {}),
            ...(price !== undefined ? { price } : {}),
            ...(originalPrice !== undefined
              ? { originalPrice: originalPrice ?? null }
              : {}),
            ...(badge !== undefined ? { badge: badge ?? null } : {}),
            ...(stock !== undefined ? { stock } : {}),
            ...(rating !== undefined ? { rating: rating ?? null } : {}),
            ...(reviewsCount !== undefined
              ? { reviewsCount: reviewsCount ?? null }
              : {}),
            ...(images
              ? {
                  images: {
                    create: images.map(
                      (
                        image: { imageUrl: string; sortOrder?: number },
                        index: number
                      ) => ({
                        imageUrl: image.imageUrl,
                        sortOrder: image.sortOrder ?? index,
                      })
                    ),
                  },
                }
              : {}),
          },
          include: productInclude,
        });
      });

      res.json({
        success: true,
        data: serializeProduct(product),
      });
    } catch (error) {
      next(error);
    }
  }
);

productsRouter.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const productId = getRouteParam(req.params.id);
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Product not found",
      });
      return;
    }

    await prisma.product.delete({
      where: { id: existing.id },
    });

    res.json({
      success: true,
      data: { id: existing.id },
    });
  } catch (error) {
    next(error);
  }
});
