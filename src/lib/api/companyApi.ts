import { apiClient } from "@/lib/api/apiClient";
import type { CompanySettings } from "@/types/company";

export async function getCompanySettings(): Promise<CompanySettings> {
  const { data } = await apiClient.get<CompanySettings>("/api/company-settings/me");
  return data;
}