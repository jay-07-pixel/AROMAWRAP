import type { Prisma } from "@prisma/client";
import { decimalToNumber } from "../lib/productSnapshot.js";

const orderItemInclude = {} as const;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: typeof orderItemInclude };
}>;

export type OrderWithItemsAndUser = Prisma.OrderGetPayload<{
  include: {
    items: typeof orderItemInclude;
    user: { select: { id: true; email: true; displayName: true } };
  };
}>;

export function serializeOrderItem(
  item: Prisma.OrderItemGetPayload<object>
) {
  const unitPrice = decimalToNumber(item.unitPrice) ?? 0;

  return {
    id: item.id,
    productId: item.productId,
    name: item.productNameSnapshot,
    price: unitPrice,
    quantity: item.quantity,
    image: item.productImageSnapshot,
    lineTotal: decimalToNumber(item.lineTotal) ?? 0,
  };
}

export function serializeOrder(order: OrderWithItems) {
  const items = order.items.map(serializeOrderItem);

  return {
    id: order.id,
    userId: order.userId,
    items,
    total: decimalToNumber(order.total) ?? 0,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    onlinePaymentReview: order.onlinePaymentReview,
    paymentRejectionReason: order.paymentRejectionReason,
    userClaimedPaidAt: order.userClaimedPaidAt,
    shippingAddress: {
      name: order.shippingName,
      email: order.shippingEmail,
      phone: order.shippingPhone,
      address: order.shippingAddress,
      city: order.shippingCity,
      state: order.shippingState,
      pincode: order.shippingPincode,
    },
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export function serializeAdminOrder(order: OrderWithItemsAndUser) {
  return {
    ...serializeOrder(order),
    user: order.user,
  };
}
