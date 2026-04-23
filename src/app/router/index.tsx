import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { NewProformPage } from "@/pages/NewProformPage";
import { OnboardingCompanyPage } from "@/pages/OnboardingCompanyPage";
import { ProformsListPage } from "@/pages/ProformsListPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "onboarding/company",
        element: <OnboardingCompanyPage />,
      },
      {
        path: "proforms/new",
        element: <NewProformPage />,
      },
      {
        path: "proforms",
        element: <ProformsListPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);