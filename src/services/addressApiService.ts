import { apiFetch } from "@/lib/api";

export interface ApiAddress {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  isDefault?: boolean;
}

type AddressResponse = {
  success: true;
  data: ApiAddress;
};

type AddressesListResponse = {
  success: true;
  data: {
    addresses: ApiAddress[];
  };
};

export async function getAddressesApi(): Promise<ApiAddress[]> {
  const response = await apiFetch<AddressesListResponse>("/api/addresses");
  return response.data.addresses;
}

export async function createAddressApi(
  body: CreateAddressRequest
): Promise<ApiAddress> {
  const response = await apiFetch<AddressResponse>("/api/addresses", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return response.data;
}

export async function updateAddressApi(
  addressId: string,
  body: UpdateAddressRequest
): Promise<ApiAddress> {
  const response = await apiFetch<AddressResponse>(`/api/addresses/${addressId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return response.data;
}

export async function deleteAddressApi(addressId: string): Promise<ApiAddress> {
  const response = await apiFetch<AddressResponse>(`/api/addresses/${addressId}`, {
    method: "DELETE",
  });
  return response.data;
}

export async function setDefaultAddressApi(
  addressId: string
): Promise<ApiAddress> {
  const response = await apiFetch<AddressResponse>(
    `/api/addresses/${addressId}/default`,
    {
      method: "PATCH",
    }
  );
  return response.data;
}
