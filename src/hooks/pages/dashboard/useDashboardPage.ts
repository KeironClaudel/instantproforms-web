import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/providers/useAuth";
import { isCompanySetupComplete } from "@/lib/utils/companySetup";

export function useDashboardPage() {
  const { t } = useTranslation();
  const { user, companySettings } = useAuth();

  const isSetupComplete = isCompanySetupComplete(companySettings);

  return {
    companySettings,
    companyName: companySettings?.displayName?.trim() || t("common.defaults.companyName"),
    currencySymbol: companySettings?.currencySymbol?.trim() || "-",
    isSetupComplete,
    logoUrl: companySettings?.logoUrl ?? null,
    phone: companySettings?.phone?.trim() || t("common.defaults.notConfiguredYet"),
    prefix: companySettings?.proformPrefix?.trim() || "-",
    primaryColor: companySettings?.primaryColor ?? "#0f172a",
    taxLabel: companySettings?.taxLabel?.trim() || "-",
    taxPercentage:
      companySettings && Number.isFinite(companySettings.taxPercentage)
        ? `${companySettings.taxPercentage}%`
        : "-",
    userFirstName: user?.fullName?.split(" ")[0] ?? "User",
    website: companySettings?.website?.trim() || t("common.defaults.notConfiguredYet"),
  };
}
