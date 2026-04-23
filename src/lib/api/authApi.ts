import { apiClient } from "@/lib/api/apiClient";
import type { AuthUser, LoginRequest, LoginResponse } from "@/types/auth";

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/api/auth/login", request);
  return data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>("/api/auth/me");
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/api/auth/logout");
}

export async function refreshToken(): Promise<void> {
  await apiClient.post("/api/auth/refresh");
}