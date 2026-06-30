import { z } from "zod";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

const shippingFieldsSchema = z.object({
  shippingName: z.string().trim().min(1).max(200),
  shippingEmail: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
  shippingPhone: z.string().trim().min(1).max(30),
  shippingAddress: z.string().trim().min(1).max(500),
  shippingCity: z.string().trim().min(1).max(100),
  shippingState: z.string().trim().min(1).max(100),
  shippingPincode: z.string().trim().min(1).max(20),
});

export const createOrderSchema = shippingFieldsSchema
  .extend({
    paymentMethod: z.nativeEnum(PaymentMethod),
    userClaimedPaidAt: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === PaymentMethod.COD && data.userClaimedPaidAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "userClaimedPaidAt is only allowed for ONLINE payments",
        path: ["userClaimedPaidAt"],
      });
    }
  });

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export const updatePaymentReviewSchema = z
  .object({
    action: z.enum(["approve", "reject"]),
    rejectionReason: z.string().trim().min(1).max(1000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.action === "reject" && !data.rejectionReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "rejectionReason is required when rejecting payment",
        path: ["rejectionReason"],
      });
    }
  });

export const adminListOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  search: z.string().trim().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdatePaymentReviewInput = z.infer<
  typeof updatePaymentReviewSchema
>;
export type AdminListOrdersQuery = z.infer<typeof adminListOrdersQuerySchema>;
