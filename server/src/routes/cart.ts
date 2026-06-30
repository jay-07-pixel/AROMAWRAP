import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getPrimaryImageUrl } from "../lib/productSnapshot.js";
import { addCartItemSchema, updateCartItemSchema } from "../cart/schemas.js";
import { serializeCart } from "../cart/serializer.js";
import {
  findCartItemForUser,
  getCartForUser,
  getOrCreateCart,
} from "../cart/service.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";

export const cartRouter = Router();

cartRouter.use(requireAuth);

function getRouteParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

async function loadSerializedCart(userId: string) {
  const cart = await getCartForUser(userId);
  return serializeCart(cart);
}

cartRouter.get("/", async (req, res, next) => {
  try {
    const data = await loadSerializedCart(req.user!.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

cartRouter.post(
  "/items",
  validateBody(addCartItemSchema),
  async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const { productId, quantity } = req.body;

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

      const cart = await getOrCreateCart(userId);
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
            unitPrice: product.price,
            name: product.name,
            image: getPrimaryImageUrl(product),
          },
        });
      }

      await prisma.cart.update({
        where: { id: cart.id },
        data: { updatedAt: new Date() },
      });

      const data = await loadSerializedCart(userId);
      res.status(existingItem ? 200 : 201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

cartRouter.patch(
  "/items/:id",
  validateBody(updateCartItemSchema),
  async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const itemId = getRouteParam(req.params.id);
      const { quantity } = req.body;

      const item = await findCartItemForUser(userId, itemId);
      if (!item) {
        res.status(404).json({
          success: false,
          error: "Cart item not found",
        });
        return;
      }

      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity },
      });

      await prisma.cart.update({
        where: { id: item.cartId },
        data: { updatedAt: new Date() },
      });

      const data = await loadSerializedCart(userId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

cartRouter.delete("/items/:id", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const itemId = getRouteParam(req.params.id);

    const item = await findCartItemForUser(userId, itemId);
    if (!item) {
      res.status(404).json({
        success: false,
        error: "Cart item not found",
      });
      return;
    }

    await prisma.cartItem.delete({ where: { id: item.id } });
    await prisma.cart.update({
      where: { id: item.cartId },
      data: { updatedAt: new Date() },
    });

    const data = await loadSerializedCart(userId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

cartRouter.delete("/", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const cart = await getOrCreateCart(userId);

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    const data = await loadSerializedCart(userId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});
