import { z } from "zod";

const uploadedProductImagePathSchema = z
  .string()
  .trim()
  .regex(/^\/uploads\/products\/[A-Za-z0-9-]+\.(jpg|jpeg|png|webp)$/i);

const imageInputSchema = z.object({
  imageUrl: z.union([z.string().url(), uploadedProductImagePathSchema]),
  sortOrder: z.number().int().min(0).optional(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1),
  category: z.string().trim().min(1).max(100),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional().nullable(),
  badge: z.string().trim().max(50).optional().nullable(),
  stock: z.number().int().min(0).default(0),
  rating: z.number().min(0).max(5).optional().nullable(),
  reviewsCount: z.number().int().min(0).optional().nullable(),
  images: z.array(imageInputSchema).min(1),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductsQuerySchema = z.object({
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
  sort: z
    .enum(["newest", "price-low", "price-high", "name-asc"])
    .optional()
    .default("newest"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
