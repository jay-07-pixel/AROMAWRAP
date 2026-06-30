import { z } from "zod";

const addressFieldsSchema = z.object({
  fullName: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(30),
  addressLine1: z.string().trim().min(1).max(500),
  addressLine2: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  pincode: z.string().trim().min(1).max(20),
  country: z.string().trim().min(1).max(100).optional().default("India"),
  isDefault: z.boolean().optional().default(false),
});

export const createAddressSchema = addressFieldsSchema;

export const updateAddressSchema = addressFieldsSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" }
);

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
