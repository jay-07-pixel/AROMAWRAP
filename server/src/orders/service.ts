import {
  OnlinePaymentReview,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { AdminListOrdersQuery, CreateOrderInput } from "./schemas.js";

const orderInclude = {
  items: { orderBy: { id: "asc" as const } },
} as const;

const adminOrderInclude = {
  items: { orderBy: { id: "asc" as const } },
  user: {
    select: {
      id: true,
      email: true,
      displayName: true,
    },
  },
} as const;

function computeLineTotal(unitPrice: Prisma.Decimal, quantity: number) {
  return new Prisma.Decimal(unitPrice).mul(quantity);
}

export async function findOrderForUser(userId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderInclude,
  });
}

export async function getOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
}

export function buildAdminOrderWhere(
  query: AdminListOrdersQuery
): Prisma.OrderWhereInput {
  const andFilters: Prisma.OrderWhereInput[] = [];

  if (query.status) {
    andFilters.push({ status: query.status });
  }

  if (query.paymentStatus) {
    andFilters.push({ paymentStatus: query.paymentStatus });
  }

  if (query.fromDate) {
    andFilters.push({ createdAt: { gte: query.fromDate } });
  }

  if (query.toDate) {
    const end = new Date(query.toDate);
    end.setHours(23, 59, 59, 999);
    andFilters.push({ createdAt: { lte: end } });
  }

  if (query.search) {
    andFilters.push({
      OR: [
        { id: { contains: query.search } },
        { shippingName: { contains: query.search } },
        { shippingEmail: { contains: query.search } },
        { shippingPhone: { contains: query.search } },
        { shippingCity: { contains: query.search } },
        { shippingPincode: { contains: query.search } },
        { user: { email: { contains: query.search } } },
        { user: { displayName: { contains: query.search } } },
      ],
    });
  }

  return andFilters.length > 0 ? { AND: andFilters } : {};
}

export async function listAdminOrders(query: AdminListOrdersQuery) {
  const where = buildAdminOrderWhere(query);
  const skip = (query.page - 1) * query.limit;

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: adminOrderInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
  ]);

  return { total, orders };
}

export async function getAdminOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: adminOrderInclude,
  });
}

export async function createOrderFromCart(
  userId: string,
  input: CreateOrderInput
) {
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      throw new OrderError("Cart is empty", 400);
    }

    const products = await tx.product.findMany({
      where: { id: { in: cart.items.map((item) => item.productId) } },
      select: { id: true, name: true, price: true },
    });
    const productsById = new Map(products.map((product) => [product.id, product]));

    const orderItems = cart.items.map((item) => {
      const product = productsById.get(item.productId);
      if (!product) {
        throw new OrderError("An item in your cart is no longer available. Please review your cart.", 409);
      }
      return {
        productId: item.productId,
        productNameSnapshot: product.name,
        productImageSnapshot: item.image,
        unitPrice: product.price,
        quantity: item.quantity,
        lineTotal: computeLineTotal(product.price, item.quantity),
      };
    });

    const total = orderItems.reduce(
      (sum, item) => sum.add(item.lineTotal),
      new Prisma.Decimal(0)
    );

    const isOnline = input.paymentMethod === PaymentMethod.ONLINE;

    const order = await tx.order.create({
      data: {
        userId,
        total,
        paymentMethod: input.paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        onlinePaymentReview: isOnline
          ? OnlinePaymentReview.PENDING
          : null,
        userClaimedPaidAt: isOnline && input.userClaimedPaidAt ? new Date() : null,
        shippingName: input.shippingName,
        shippingEmail: input.shippingEmail,
        shippingPhone: input.shippingPhone,
        shippingAddress: input.shippingAddress,
        shippingCity: input.shippingCity,
        shippingState: input.shippingState,
        shippingPincode: input.shippingPincode,
        items: {
          create: orderItems,
        },
      },
      include: orderInclude,
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return order;
  });
}

export class OrderError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "OrderError";
  }
}
