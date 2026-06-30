export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiSuccessResponse<T> = {
  success: true;
} & T;

type ApiErrorResponse = {
  success: false;
  error: string;
};

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T | ApiErrorResponse;

  if (!response.ok || (data as ApiErrorResponse).success === false) {
    const message =
      (data as ApiErrorResponse).error ||
      `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message);
  }

  return data as T;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  return parseJsonResponse<T>(response);
}
