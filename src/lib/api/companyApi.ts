import { apiClient } from "@/lib/api/apiClient";
import { normalizeCompanySettings } from "@/lib/utils/companySettings";
import type { CompanySettings } from "@/types/company";

function buildCompanySettingsUrl(forceFresh?: boolean): string {
  if (!forceFresh) {
    return "/api/company-settings";
  }

  return `/api/company-settings?refresh=${Date.now()}`;
}

export async function getCompanySettings(forceFresh?: boolean): Promise<CompanySettings> {
  const { data } = await apiClient.get(buildCompanySettingsUrl(forceFresh));
  return normalizeCompanySettings(data);
}
