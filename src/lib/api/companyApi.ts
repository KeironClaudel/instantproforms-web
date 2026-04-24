import { apiClient } from "@/lib/api/apiClient";
import { normalizeCompanySettings } from "@/lib/utils/companySettings";
import type { CompanySettings } from "@/types/company";

export async function getCompanySettings(): Promise<CompanySettings> {
  const { data } = await apiClient.get("/api/company-settings");
  return normalizeCompanySettings(data);
}
