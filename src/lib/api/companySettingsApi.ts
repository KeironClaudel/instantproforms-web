import { apiClient } from "@/lib/api/apiClient";
import { normalizeCompanySettings } from "@/lib/utils/companySettings";
import type { CompanySettings } from "@/types/company";

export type UpdateCompanySettingsRequest = {
  displayName: string;
  legalName: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  termsAndConditions: string | null;
  logoFileName: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  proformPrefix: string;
  taxPercentage: number;
  currencySymbol: string;
  taxLabel: string;
};

export async function getCurrentCompanySettings(): Promise<CompanySettings> {
  const { data } = await apiClient.get<CompanySettings>("/api/company-settings");
  return normalizeCompanySettings(data);
}

export async function updateCompanySettings(
  request: UpdateCompanySettingsRequest,
): Promise<void> {
  await apiClient.put("/api/company-settings", request);
}

export async function replaceCompanyLogo(file: File): Promise<void> {
  const formData = new FormData();
  formData.append("logoFile", file);

  await apiClient.put("/api/company-settings/logo", formData);
}
