import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { NewProformPage } from "@/pages/NewProformPage";
import { OnboardingCompanyPage } from "@/pages/OnboardingCompanyPage";
import { ProformsListPage } from "@/pages/ProformsListPage";
import { ProformDetailsPage } from "@/pages/ProformDetailsPage";

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
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
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
        path: "proforms/:id",
        element: <ProformDetailsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);
