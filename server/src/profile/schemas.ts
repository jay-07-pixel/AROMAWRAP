import { z } from "zod";

export const updateProfileSchema = z
  .object({
    displayName: z.string().trim().min(1).max(200).optional(),
    phone: z
      .string()
      .trim()
      .max(30)
      .optional()
      .or(z.literal(""))
      .transform((value) => (value === "" ? null : value)),
    photoUrl: z
      .string()
      .trim()
      .url()
      .optional()
      .or(z.literal(""))
      .transform((value) => (value === "" ? null : value)),
  })
  .refine(
    (data) =>
      data.displayName !== undefined ||
      data.phone !== undefined ||
      data.photoUrl !== undefined,
    { message: "At least one field is required" }
  );

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
