import { z } from "zod";

export const submitReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(100).optional(),
  comment: z.string().trim().min(1).max(2000),
});

export const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>;
