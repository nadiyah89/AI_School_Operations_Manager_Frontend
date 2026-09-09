import { API_BASE_URL } from "./apiConfig";

export async function apiClient(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = localStorage.getItem("auth_token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  return response;
}