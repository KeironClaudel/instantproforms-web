import axios from "axios";
import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { registerCompany } from "@/lib/api/authApi";
import { createErrorFeedback, createSuccessFeedback } from "@/lib/utils/feedback";

const defaultTerms = `The warranty does not cover damage, failures, or modifications caused by improper handling, intervention, or alterations performed by third parties unrelated to the company.

Any issue related to the installation must be reported directly to the company before any repair or intervention.

If the client authorizes repairs by third parties without prior assessment, the granted warranty will be automatically voided.

The company is not responsible for damage caused by overloads, defective equipment, unauthorized connections, or improper use.`;

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

const initialFormState: RegisterFormState = {
  companyName: "",
  companySlug: "",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  companyWebsite: "",
  displayName: "",
  legalName: "",
  termsAndConditions: defaultTerms,
  primaryColor: "#1B2D5A",
  secondaryColor: "#e6c7f0",
  accentColor: "#dbe2ff",
  proformPrefix: "PRO",
  taxPercentage: "13",
  currencySymbol: "₡",
  taxLabel: "Tax",
  ownerFullName: "",
  ownerEmail: "",
  password: "",
  confirmPassword: "",
};

function getRegisterErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Failed to register the company.";
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

  return "Failed to register the company.";
}

export function useRegisterPage() {
  const navigate = useNavigate();
  const submitLockRef = useRef(false);

  const [form, setForm] = useState(initialFormState);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const preview = useMemo(
    () => ({
      accentColor: form.accentColor,
      currencySymbol: form.currencySymbol.trim() || "₡",
      displayName: form.displayName.trim() || "Your Company",
      prefix: form.proformPrefix.trim() || "PRO",
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      taxLabel: form.taxLabel.trim() || "Tax",
      taxPercentage: form.taxPercentage.trim() || "0",
    }),
    [form],
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
      setFeedback(createErrorFeedback("Company name is required."));
      return;
    }

    if (!form.companySlug.trim()) {
      setFeedback(createErrorFeedback("Company slug is required."));
      return;
    }

    if (!form.displayName.trim()) {
      setFeedback(createErrorFeedback("Display name is required."));
      return;
    }

    if (!form.ownerFullName.trim()) {
      setFeedback(createErrorFeedback("Owner full name is required."));
      return;
    }

    if (!form.ownerEmail.trim()) {
      setFeedback(createErrorFeedback("Owner email is required."));
      return;
    }

    if (!form.password.trim()) {
      setFeedback(createErrorFeedback("Password is required."));
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFeedback(createErrorFeedback("Passwords do not match."));
      return;
    }

    if (!logoFile) {
      setFeedback(createErrorFeedback("Company logo is required."));
      return;
    }

    if (
      !Number.isFinite(parsedTaxPercentage) ||
      parsedTaxPercentage < 0 ||
      parsedTaxPercentage > 100
    ) {
      setFeedback(createErrorFeedback("Tax percentage must be between 0 and 100."));
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

      setFeedback(createSuccessFeedback("Company registered successfully. Redirecting to login..."));

      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 900);
    } catch (error) {
      setFeedback(createErrorFeedback(getRegisterErrorMessage(error)));
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
