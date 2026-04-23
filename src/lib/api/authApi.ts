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

export type RegisterCompanyRequest = {
  companyName: string;
  companySlug: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyWebsite: string;
  displayName: string;
  legalName: string;
  termsAndConditions: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  proformPrefix: string;
  taxPercentage: number;
  currencySymbol: string;
  taxLabel: string;
  logoFile: File | null;
  ownerFullName: string;
  ownerEmail: string;
  password: string;
};

export async function registerCompany(request: RegisterCompanyRequest): Promise<void> {
  const formData = new FormData();

  formData.append("companyName", request.companyName);
  formData.append("companySlug", request.companySlug);
  formData.append("companyEmail", request.companyEmail);
  formData.append("companyPhone", request.companyPhone);
  formData.append("companyAddress", request.companyAddress);
  formData.append("companyWebsite", request.companyWebsite);
  formData.append("displayName", request.displayName);
  formData.append("legalName", request.legalName);
  formData.append("termsAndConditions", request.termsAndConditions);
  formData.append("primaryColor", request.primaryColor);
  formData.append("secondaryColor", request.secondaryColor);
  formData.append("accentColor", request.accentColor);
  formData.append("proformPrefix", request.proformPrefix);
  formData.append("taxPercentage", String(request.taxPercentage));
  formData.append("currencySymbol", request.currencySymbol);
  formData.append("taxLabel", request.taxLabel);
  formData.append("ownerFullName", request.ownerFullName);
  formData.append("ownerEmail", request.ownerEmail);
  formData.append("password", request.password);

  if (request.logoFile) {
    formData.append("logoFile", request.logoFile);
  }

  await apiClient.post("/api/auth/register-company", formData);
}