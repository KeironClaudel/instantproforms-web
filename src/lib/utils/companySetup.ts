import type { CompanySettings } from "@/types/company";

export function isCompanySetupComplete(settings: CompanySettings | null): boolean {
  if (!settings) {
    return false;
  }

  const hasDisplayName = settings.displayName.trim().length > 0;
  const hasPrefix = settings.proformPrefix.trim().length > 0;
  const hasCurrency = settings.currencySymbol.trim().length > 0;
  const hasValidTax =
    Number.isFinite(settings.taxPercentage) &&
    settings.taxPercentage >= 0 &&
    settings.taxPercentage <= 100;

  return hasDisplayName && hasPrefix && hasCurrency && hasValidTax;
}