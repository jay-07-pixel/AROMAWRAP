import { z } from "zod";

export const MAX_LINE_QUANTITY = 50;

export const addCartItemSchema = z.object({
  productId: z.string().trim().min(1).max(64),
  quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY).optional().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
