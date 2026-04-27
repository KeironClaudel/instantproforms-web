import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/providers/useAuth";
import { isCompanySetupComplete } from "@/lib/utils/companySetup";
import { PageLoader } from "@/components/ui/PageLoader";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, companySettings } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader message={t("components.protectedRoute.loadingWorkspace")} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const isOnboardingRoute = location.pathname.startsWith("/app/onboarding");
  const isSetupComplete = isCompanySetupComplete(companySettings);

  if (!isSetupComplete && !isOnboardingRoute) {
    return <Navigate to="/app/onboarding/company" replace />;
  }

  if (isSetupComplete && isOnboardingRoute) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
