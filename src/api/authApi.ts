import { apiClient } from "./apiClient";
import type { AuthResponse, LoginCredentials } from "../types/auth";

export async function login(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const response = await apiClient("/api/Auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Login failed.");
  }

  return response.json();
}