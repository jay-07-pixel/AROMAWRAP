import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getPrimaryImageUrl } from "../lib/productSnapshot.js";
import { addWishlistItemSchema } from "../wishlist/schemas.js";
import { serializeWishlist } from "../wishlist/serializer.js";
import {
  findWishlistItemForUser,
  getOrCreateWishlist,
  getWishlistForUser,
} from "../wishlist/service.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";

export const wishlistRouter = Router();

wishlistRouter.use(requireAuth);

function getRouteParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

async function loadSerializedWishlist(userId: string) {
  const wishlist = await getWishlistForUser(userId);
  return serializeWishlist(wishlist);
}

wishlistRouter.get("/", async (req, res, next) => {
  try {
    const data = await loadSerializedWishlist(req.user!.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

wishlistRouter.post(
  "/items",
  validateBody(addWishlistItemSchema),
  async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const { productId } = req.body;

      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { images: true },
      });

      if (!product) {
        res.status(404).json({
          success: false,
          error: "Product not found",
        });
        return;
      }

      const wishlist = await getOrCreateWishlist(userId);

      const existingItem = await prisma.wishlistItem.findUnique({
        where: {
          wishlistId_productId: {
            wishlistId: wishlist.id,
            productId,
          },
        },
      });

      if (existingItem) {
        res.status(409).json({
          success: false,
          error: "Product already in wishlist",
        });
        return;
      }

      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
          unitPrice: product.price,
          originalPrice: product.originalPrice,
          name: product.name,
          image: getPrimaryImageUrl(product),
          badge: product.badge,
        },
      });

      await prisma.wishlist.update({
        where: { id: wishlist.id },
        data: { updatedAt: new Date() },
      });

      const data = await loadSerializedWishlist(userId);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

wishlistRouter.delete("/items/:id", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const itemId = getRouteParam(req.params.id);

    const item = await findWishlistItemForUser(userId, itemId);
    if (!item) {
      res.status(404).json({
        success: false,
        error: "Wishlist item not found",
      });
      return;
    }

    await prisma.wishlistItem.delete({ where: { id: item.id } });
    await prisma.wishlist.update({
      where: { id: item.wishlistId },
      data: { updatedAt: new Date() },
    });

    const data = await loadSerializedWishlist(userId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

wishlistRouter.delete("/", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const wishlist = await getOrCreateWishlist(userId);

    await prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id },
    });
    await prisma.wishlist.update({
      where: { id: wishlist.id },
      data: { updatedAt: new Date() },
    });

    const data = await loadSerializedWishlist(userId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});
