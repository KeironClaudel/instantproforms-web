import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/useAuth";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function useLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const state = location.state as LocationState | null;
  const redirectPath = state?.from?.pathname ?? "/app";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login({
        email,
        password,
      });

      navigate(redirectPath, { replace: true });
    } catch {
      setErrorMessage(t("pages.login.invalidCredentials"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    email,
    errorMessage,
    handleSubmit,
    isLoading,
    isSubmitting,
    password,
    setEmail,
    setPassword,
    shouldRedirect: !isLoading && isAuthenticated,
  };
}
