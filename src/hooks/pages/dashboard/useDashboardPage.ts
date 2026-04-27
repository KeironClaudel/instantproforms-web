import { useAuth } from "@/app/providers/useAuth";
import { isCompanySetupComplete } from "@/lib/utils/companySetup";

export function useDashboardPage() {
  const { user, companySettings } = useAuth();

  const isSetupComplete = isCompanySetupComplete(companySettings);

  return {
    companySettings,
    companyName: companySettings?.displayName?.trim() || "Your Company",
    currencySymbol: companySettings?.currencySymbol?.trim() || "-",
    isSetupComplete,
    logoUrl: companySettings?.logoUrl ?? null,
    phone: companySettings?.phone?.trim() || "Not configured yet",
    prefix: companySettings?.proformPrefix?.trim() || "-",
    primaryColor: companySettings?.primaryColor ?? "#0f172a",
    taxLabel: companySettings?.taxLabel?.trim() || "-",
    taxPercentage:
      companySettings && Number.isFinite(companySettings.taxPercentage)
        ? `${companySettings.taxPercentage}%`
        : "-",
    userFirstName: user?.fullName?.split(" ")[0] ?? "User",
    website: companySettings?.website?.trim() || "Not configured yet",
  };
}
