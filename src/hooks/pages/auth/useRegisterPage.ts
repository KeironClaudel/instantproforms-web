import axios from "axios";
import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { registerCompany } from "@/lib/api/authApi";
import { createErrorFeedback, createSuccessFeedback } from "@/lib/utils/feedback";

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

type RegisterFormState = {
  companyName: string;
  companySlug: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyWebsite: string;
  displayName: string;
  legalName: string;
  termsAndConditions: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  proformPrefix: string;
  taxPercentage: string;
  currencySymbol: string;
  taxLabel: string;
  ownerFullName: string;
  ownerEmail: string;
  password: string;
  confirmPassword: string;
};

function createInitialFormState(defaultTerms: string, defaultTaxLabel: string): RegisterFormState {
  return {
    accentColor: "#dbe2ff",
    companyAddress: "",
    companyEmail: "",
    companyName: "",
    companyPhone: "",
    companySlug: "",
    companyWebsite: "",
    confirmPassword: "",
    currencySymbol: "₡",
    displayName: "",
    legalName: "",
    ownerEmail: "",
    ownerFullName: "",
    password: "",
    primaryColor: "#1B2D5A",
    proformPrefix: "PRO",
    secondaryColor: "#e6c7f0",
    taxLabel: defaultTaxLabel,
    taxPercentage: "13",
    termsAndConditions: defaultTerms,
  };
}

function getRegisterErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  const responseData = error.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (
    responseData &&
    typeof responseData === "object" &&
    "message" in responseData &&
    typeof responseData.message === "string" &&
    responseData.message.trim()
  ) {
    return responseData.message;
  }

  return fallbackMessage;
}

export function useRegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const submitLockRef = useRef(false);

  const [form, setForm] = useState<RegisterFormState>(() =>
    createInitialFormState(
      t("pages.register.defaults.terms"),
      t("common.defaults.taxLabel"),
    ),
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const preview = useMemo(
    () => ({
      accentColor: form.accentColor,
      currencySymbol: form.currencySymbol.trim() || "₡",
      displayName: form.displayName.trim() || t("common.defaults.companyName"),
      prefix: form.proformPrefix.trim() || "PRO",
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      taxLabel: form.taxLabel.trim() || t("common.defaults.taxLabel"),
      taxPercentage: form.taxPercentage.trim() || "0",
    }),
    [form, t],
  );

  function updateField<K extends keyof RegisterFormState>(field: K, value: RegisterFormState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    setLogoFile(event.target.files?.[0] ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitLockRef.current) {
      return;
    }

    setFeedback(null);

    const parsedTaxPercentage = Number(form.taxPercentage);

    if (!form.companyName.trim()) {
      setFeedback(createErrorFeedback(t("pages.register.feedback.companyNameRequired")));
      return;
    }

    if (!form.companySlug.trim()) {
      setFeedback(createErrorFeedback(t("pages.register.feedback.companySlugRequired")));
      return;
    }

    if (!form.displayName.trim()) {
      setFeedback(createErrorFeedback(t("pages.register.feedback.displayNameRequired")));
      return;
    }

    if (!form.ownerFullName.trim()) {
      setFeedback(createErrorFeedback(t("pages.register.feedback.ownerFullNameRequired")));
      return;
    }

    if (!form.ownerEmail.trim()) {
      setFeedback(createErrorFeedback(t("pages.register.feedback.ownerEmailRequired")));
      return;
    }

    if (!form.password.trim()) {
      setFeedback(createErrorFeedback(t("pages.register.feedback.passwordRequired")));
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFeedback(createErrorFeedback(t("pages.register.feedback.passwordMismatch")));
      return;
    }

    if (!logoFile) {
      setFeedback(createErrorFeedback(t("pages.register.feedback.logoRequired")));
      return;
    }

    if (
      !Number.isFinite(parsedTaxPercentage) ||
      parsedTaxPercentage < 0 ||
      parsedTaxPercentage > 100
    ) {
      setFeedback(createErrorFeedback(t("pages.register.feedback.taxRange")));
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      await registerCompany({
        companyName: form.companyName.trim(),
        companySlug: form.companySlug.trim(),
        companyEmail: form.companyEmail.trim(),
        companyPhone: form.companyPhone.trim(),
        companyAddress: form.companyAddress.trim(),
        companyWebsite: form.companyWebsite.trim(),
        displayName: form.displayName.trim(),
        legalName: form.legalName.trim(),
        termsAndConditions: form.termsAndConditions.trim(),
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        accentColor: form.accentColor,
        proformPrefix: form.proformPrefix.trim(),
        taxPercentage: parsedTaxPercentage,
        currencySymbol: form.currencySymbol.trim(),
        taxLabel: form.taxLabel.trim(),
        logoFile,
        ownerFullName: form.ownerFullName.trim(),
        ownerEmail: form.ownerEmail.trim(),
        password: form.password,
      });

      setFeedback(createSuccessFeedback(t("pages.register.feedback.success")));

      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 900);
    } catch (error) {
      setFeedback(
        createErrorFeedback(
          getRegisterErrorMessage(error, t("pages.register.feedback.failed")),
        ),
      );
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return {
    feedback,
    form,
    handleLogoChange,
    handleSubmit,
    isSubmitting,
    logoFile,
    preview,
    updateField,
  };
}
