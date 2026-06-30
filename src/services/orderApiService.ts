import { apiFetch } from "@/lib/api";

export interface ApiOrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  lineTotal: number;
}

export interface ApiOrderShippingAddress {
  name: string;
  email?: string | null;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ApiOrder {
  id: string;
  userId: string;
  items: ApiOrderItem[];
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  onlinePaymentReview: string | null;
  paymentRejectionReason: string | null;
  userClaimedPaidAt: string | null;
  shippingAddress: ApiOrderShippingAddress;
  createdAt: string;
  updatedAt: string;
}

export interface ApiAdminOrder extends ApiOrder {
  user?: {
    id: string;
    email: string;
    displayName: string | null;
  };
}

export interface CreateOrderRequest {
  shippingName: string;
  shippingEmail?: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  paymentMethod: "COD" | "ONLINE";
  userClaimedPaidAt?: string;
}

type OrderResponse = {
  success: true;
  data: ApiOrder;
};

type OrdersListResponse = {
  success: true;
  data: {
    orders: ApiOrder[];
  };
};

type AdminOrdersListResponse = {
  success: true;
  data: {
    orders: ApiAdminOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

type AdminOrderResponse = {
  success: true;
  data: ApiAdminOrder;
};

export async function createOrderApi(
  body: CreateOrderRequest
): Promise<ApiOrder> {
  const response = await apiFetch<OrderResponse>("/api/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return response.data;
}

export async function getOrdersApi(): Promise<ApiOrder[]> {
  const response = await apiFetch<OrdersListResponse>("/api/orders");
  return response.data.orders;
}

export async function getOrderByIdApi(orderId: string): Promise<ApiOrder> {
  const response = await apiFetch<OrderResponse>(`/api/orders/${orderId}`);
  return response.data;
}

export async function getAllAdminOrdersApi(): Promise<ApiAdminOrder[]> {
  const limit = 100;
  let page = 1;
  let totalPages = 1;
  const allOrders: ApiAdminOrder[] = [];

  do {
    const response = await apiFetch<AdminOrdersListResponse>(
      `/api/admin/orders?page=${page}&limit=${limit}`
    );
    allOrders.push(...response.data.orders);
    totalPages = response.data.pagination.totalPages;
    page += 1;
  } while (page <= totalPages);

  return allOrders;
}

export async function getAdminOrderByIdApi(
  orderId: string
): Promise<ApiAdminOrder> {
  const response = await apiFetch<AdminOrderResponse>(
    `/api/admin/orders/${orderId}`
  );
  return response.data;
}

export async function updateOrderStatusApi(
  orderId: string,
  status: string
): Promise<ApiAdminOrder> {
  const response = await apiFetch<AdminOrderResponse>(
    `/api/admin/orders/${orderId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
  return response.data;
}

export async function updateOnlinePaymentReviewApi(
  orderId: string,
  action: "approve" | "reject",
  rejectionReason?: string
): Promise<ApiAdminOrder> {
  const body: { action: "approve" | "reject"; rejectionReason?: string } = {
    action,
  };
  if (action === "reject" && rejectionReason) {
    body.rejectionReason = rejectionReason;
  }

  const response = await apiFetch<AdminOrderResponse>(
    `/api/admin/orders/${orderId}/payment-review`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    }
  );
  return response.data;
}
