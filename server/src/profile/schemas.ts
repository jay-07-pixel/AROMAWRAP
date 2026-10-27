import { z } from "zod";

const emptyToNull = (value: string | null | undefined) =>
  value === "" ? null : value;

export const updateProfileSchema = z
  .object({
    displayName: z.string().trim().min(1).max(200).optional(),
    phone: z
      .string()
      .trim()
      .max(30)
      .regex(/^[0-9+\-\s()]*$/, "Phone number can only contain digits, spaces, +, - and brackets")
      .nullable()
      .optional()
      .transform(emptyToNull),
    photoUrl: z.string().trim().max(2048).nullable().optional().transform(emptyToNull),
  })
  .refine(
    (data) =>
      data.displayName !== undefined ||
      data.phone !== undefined ||
      data.photoUrl !== undefined,
    { message: "At least one field is required" }
  );

/** New profile photos must come from the profile upload endpoint. */
export const UPLOADED_PROFILE_PHOTO = /^\/uploads\/users\/[A-Za-z0-9-]+\.(jpg|jpeg|png|webp)$/i;

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
