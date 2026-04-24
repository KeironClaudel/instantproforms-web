import type { CompanySettings } from "@/types/company";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const configuredApiPublicOrigin = import.meta.env.VITE_API_PUBLIC_ORIGIN?.trim();

function getApiPublicOrigin(): string | null {
  if (configuredApiPublicOrigin) {
    return configuredApiPublicOrigin.replace(/\/+$/, "");
  }

  if (configuredApiBaseUrl && configuredApiBaseUrl.startsWith("http")) {
    return new URL(configuredApiBaseUrl).origin;
  }

  return null;
}

function resolveCompanyAssetUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (!configuredApiBaseUrl || configuredApiBaseUrl === "/") {
    return url;
  }

  const apiPublicOrigin = getApiPublicOrigin();

  if (!apiPublicOrigin) {
    return url;
  }

  return new URL(url, apiPublicOrigin).toString();
}

export function normalizeCompanySettings(settings: CompanySettings): CompanySettings {
  return {
    ...settings,
    logoUrl: resolveCompanyAssetUrl(settings.logoUrl),
  };
}
