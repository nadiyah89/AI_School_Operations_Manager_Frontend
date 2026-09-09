import { API_BASE_URL } from "./apiConfig";

export async function apiClient(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return response;
}