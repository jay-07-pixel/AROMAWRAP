import {
  OnlinePaymentReview,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { allocateOrderNumber } from "./orderNumber.js";
import type { AdminListOrdersQuery, CreateOrderInput } from "./schemas.js";

const MAX_PENDING_UPI_ORDERS = 3;
const MAX_ORDER_NUMBER_RETRIES = 5;

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

function isOrderNumberCollision(error: unknown): boolean {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = error.meta?.target;
    if (typeof target === "string") return target.includes("orderNumber");
    if (Array.isArray(target)) return target.includes("orderNumber");
    return true;
  }
  return false;
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
        { orderNumber: { contains: query.search } },
        { upiTransactionRef: { contains: query.search } },
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
  for (let attempt = 0; attempt < MAX_ORDER_NUMBER_RETRIES; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const isOnline = input.paymentMethod === PaymentMethod.ONLINE;

        if (isOnline) {
          const pendingUpiCount = await tx.order.count({
            where: {
              userId,
              paymentMethod: PaymentMethod.ONLINE,
              onlinePaymentReview: OnlinePaymentReview.PENDING,
              status: { not: OrderStatus.CANCELLED },
            },
          });

          if (pendingUpiCount >= MAX_PENDING_UPI_ORDERS) {
            throw new OrderError(
              "You already have pending UPI orders awaiting verification. Please wait for verification before placing another.",
              429
            );
          }
        }

        const cart = await tx.cart.findUnique({
          where: { userId },
          include: { items: true },
        });

        if (!cart || cart.items.length === 0) {
          throw new OrderError("Cart is empty", 400);
        }

        const products = await tx.product.findMany({
          where: { id: { in: cart.items.map((item) => item.productId) } },
          select: { id: true, name: true, price: true, category: true, stock: true },
        });
        const productsById = new Map(products.map((product) => [product.id, product]));

        const orderItems = [];
        for (const item of cart.items) {
          const product = productsById.get(item.productId);
          if (!product) {
            throw new OrderError(
              "An item in your cart is no longer available. Please review your cart.",
              409
            );
          }
          if (product.category.toLowerCase().includes("dhoop")) {
            throw new OrderError(
              "Dhoop sticks are coming soon. Please remove them from your cart. Only Agarbatti can be ordered right now.",
              409
            );
          }

          // Atomic conditional stock decrement prevents overselling under concurrent checkouts.
          const updated = await tx.product.updateMany({
            where: {
              id: product.id,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          if (updated.count === 0) {
            const availableText =
              product.stock <= 0
                ? `"${product.name}" is currently out of stock.`
                : `Only ${product.stock} left in stock for "${product.name}". Please reduce the quantity in your cart.`;
            throw new OrderError(availableText, 409);
          }

          orderItems.push({
            productId: item.productId,
            productNameSnapshot: product.name,
            productImageSnapshot: item.image,
            unitPrice: product.price,
            quantity: item.quantity,
            lineTotal: computeLineTotal(product.price, item.quantity),
          });
        }

        const total = orderItems.reduce(
          (sum, item) => sum.add(item.lineTotal),
          new Prisma.Decimal(0)
        );

        const orderNumber = await allocateOrderNumber(tx, attempt);

        const order = await tx.order.create({
          data: {
            orderNumber,
            userId,
            total,
            paymentMethod: input.paymentMethod,
            paymentStatus: PaymentStatus.PENDING,
            onlinePaymentReview: isOnline
              ? OnlinePaymentReview.PENDING
              : null,
            upiTransactionRef: isOnline ? input.upiTransactionRef ?? null : null,
            userClaimedPaidAt:
              isOnline && input.userClaimedPaidAt ? new Date() : null,
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
    } catch (error) {
      if (isOrderNumberCollision(error) && attempt < MAX_ORDER_NUMBER_RETRIES - 1) {
        continue;
      }
      throw error;
    }
  }

  throw new OrderError("Could not generate an order number. Please try again.", 503);
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
