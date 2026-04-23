import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/useAuth";
import { isCompanySetupComplete } from "@/lib/utils/companySetup";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading, companySettings } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Loading session...
      </div>
    );
  }

  // 🚫 no login → login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const isOnboardingRoute = location.pathname.startsWith("/app/onboarding");
  const isSetupComplete = isCompanySetupComplete(companySettings);

  // 🚀 caso clave: falta onboarding
  if (!isSetupComplete && !isOnboardingRoute) {
    return <Navigate to="/app/onboarding/company" replace />;
  }

  // 🚫 evitar volver al onboarding si ya completó
  if (isSetupComplete && isOnboardingRoute) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}