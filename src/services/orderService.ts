import type { ApiOrder } from "./orderApiService";
import {
  createOrderApi,
  getAdminOrderByIdApi,
  getAllAdminOrdersApi,
  getOrderByIdApi,
  getOrdersApi,
  updateOnlinePaymentReviewApi,
  updateOrderStatusApi,
} from "./orderApiService";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderTimestamp {
  toDate: () => Date;
  toMillis: () => number;
}

export interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    name: string;
    email?: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: "cod" | "online";
  paymentStatus: "pending" | "paid" | "failed";
  onlinePaymentReview?: "pending" | "approved" | "rejected";
  paymentRejectionReason?: string;
  userClaimedPaidAt?: OrderTimestamp;
  createdAt?: OrderTimestamp;
  updatedAt?: OrderTimestamp;
}

export interface CreateOrderInput {
  shippingName: string;
  shippingEmail?: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  paymentMethod: "cod" | "online";
  userClaimedPaidAt?: Date;
}

function toTimestampLike(value: string | null | undefined): OrderTimestamp | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return {
    toDate: () => date,
    toMillis: () => date.getTime(),
  };
}

function toLowerEnum<T extends string>(value: string): T {
  return value.toLowerCase() as T;
}

function mapApiOrder(api: ApiOrder): Order {
  return {
    id: api.id,
    userId: api.userId,
    items: api.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image ?? "",
    })),
    total: api.total,
    status: toLowerEnum<Order["status"]>(api.status),
    shippingAddress: {
      name: api.shippingAddress.name,
      email: api.shippingAddress.email ?? undefined,
      phone: api.shippingAddress.phone,
      address: api.shippingAddress.address,
      city: api.shippingAddress.city,
      state: api.shippingAddress.state,
      pincode: api.shippingAddress.pincode,
    },
    paymentMethod: toLowerEnum<Order["paymentMethod"]>(api.paymentMethod),
    paymentStatus: toLowerEnum<Order["paymentStatus"]>(api.paymentStatus),
    onlinePaymentReview: api.onlinePaymentReview
      ? toLowerEnum<NonNullable<Order["onlinePaymentReview"]>>(
          api.onlinePaymentReview
        )
      : undefined,
    paymentRejectionReason: api.paymentRejectionReason ?? undefined,
    userClaimedPaidAt: toTimestampLike(api.userClaimedPaidAt),
    createdAt: toTimestampLike(api.createdAt),
    updatedAt: toTimestampLike(api.updatedAt),
  };
}

function toApiPaymentMethod(method: CreateOrderInput["paymentMethod"]) {
  return method === "cod" ? "COD" : "ONLINE";
}

function toApiOrderStatus(status: Order["status"]) {
  return status.toUpperCase();
}

export const createOrder = async (input: CreateOrderInput): Promise<string> => {
  try {
    const order = await createOrderApi({
      shippingName: input.shippingName,
      shippingEmail: input.shippingEmail,
      shippingPhone: input.shippingPhone,
      shippingAddress: input.shippingAddress,
      shippingCity: input.shippingCity,
      shippingState: input.shippingState,
      shippingPincode: input.shippingPincode,
      paymentMethod: toApiPaymentMethod(input.paymentMethod),
      userClaimedPaidAt: input.userClaimedPaidAt?.toISOString(),
    });
    return order.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  try {
    const order = await getAdminOrderByIdApi(id);
    return mapApiOrder(order);
  } catch (error) {
    console.error("Error getting order:", error);
    throw error;
  }
};

export const getUserOrderById = async (id: string): Promise<Order | null> => {
  try {
    const order = await getOrderByIdApi(id);
    return mapApiOrder(order);
  } catch (error) {
    console.error("Error getting user order:", error);
    throw error;
  }
};

export const getUserOrders = async (_userId?: string): Promise<Order[]> => {
  try {
    const orders = await getOrdersApi();
    return orders.map(mapApiOrder);
  } catch (error) {
    console.error("Error getting user orders:", error);
    throw error;
  }
};

export const subscribeToUserOrders = (
  _userId: string,
  callback: (orders: Order[]) => void
): (() => void) => {
  let active = true;

  void (async () => {
    try {
      const orders = await getUserOrders();
      if (active) callback(orders);
    } catch (error) {
      console.error("Error loading user orders:", error);
      if (active) callback([]);
    }
  })();

  return () => {
    active = false;
  };
};

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const orders = await getAllAdminOrdersApi();
    return orders.map(mapApiOrder);
  } catch (error) {
    console.error("Error getting all orders:", error);
    throw error;
  }
};

export const updateOrderStatus = async (
  id: string,
  status: Order["status"]
): Promise<void> => {
  try {
    await updateOrderStatusApi(id, toApiOrderStatus(status));
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const updatePaymentStatus = async (
  _id: string,
  _paymentStatus: Order["paymentStatus"]
): Promise<void> => {
  throw new Error("Payment status updates are handled via payment review");
};

export const updateOnlinePaymentReview = async (
  id: string,
  action: "approve" | "reject",
  rejectionReason?: string
): Promise<void> => {
  try {
    await updateOnlinePaymentReviewApi(id, action, rejectionReason);
  } catch (error) {
    console.error("Error updating online payment review:", error);
    throw error;
  }
};
