import { apiFetch } from "@/lib/api";

export interface ApiUser {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  photoUrl: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

type ApiSuccessResponse<T> = { success: true } & T;

type AuthUserResponse = ApiSuccessResponse<{ user: ApiUser }>;
type MeResponse = ApiSuccessResponse<{ user: ApiUser | null }>;
type LogoutResponse = ApiSuccessResponse<Record<string, never>>;

export async function apiLogin(
  email: string,
  password: string
): Promise<ApiUser> {
  const data = await apiFetch<AuthUserResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return data.user;
}

export async function apiRegister(
  email: string,
  password: string,
  displayName: string
): Promise<ApiUser> {
  const data = await apiFetch<AuthUserResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, displayName }),
  });

  return data.user;
}

export async function apiLogout(): Promise<void> {
  await apiFetch<LogoutResponse>("/api/auth/logout", {
    method: "POST",
  });
}

export async function apiGetMe(): Promise<ApiUser | null> {
  const data = await apiFetch<MeResponse>("/api/auth/me");
  return data.user;
}

type ForgotPasswordResponse = ApiSuccessResponse<{
  message: string;
}>;

type ResetPasswordResponse = ApiSuccessResponse<{
  message: string;
}>;

export async function apiForgotPassword(email: string): Promise<string> {
  const data = await apiFetch<ForgotPasswordResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return data.message;
}

export async function apiResetPassword(
  email: string,
  otp: string,
  password: string
): Promise<string> {
  const data = await apiFetch<ResetPasswordResponse>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, otp, password }),
  });
  return data.message;
}
