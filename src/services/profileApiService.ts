import { apiFetch } from "@/lib/api";

export interface ApiProfile {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  photoUrl: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  phone?: string | null;
  photoUrl?: string | null;
}

type ProfileResponse = {
  success: true;
  data: ApiProfile;
};

export async function getProfileApi(): Promise<ApiProfile> {
  const response = await apiFetch<ProfileResponse>("/api/profile");
  return response.data;
}

export async function updateProfileApi(
  body: UpdateProfileRequest
): Promise<ApiProfile> {
  const response = await apiFetch<ProfileResponse>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return response.data;
}
