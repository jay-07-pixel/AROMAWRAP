import { z } from "zod";

export const deleteProductImageSchema = z.object({
  url: z.string().trim().min(1),
});

export type DeleteProductImageInput = z.infer<typeof deleteProductImageSchema>;
