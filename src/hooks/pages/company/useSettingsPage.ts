import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "@/app/providers/useAuth";
import {
  getCurrentCompanySettings,
  replaceCompanyLogo,
  updateCompanySettings,
} from "@/lib/api/companySettingsApi";
import { createErrorFeedback, createSuccessFeedback } from "@/lib/utils/feedback";
import type { CompanySettings } from "@/types/company";

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

function createEmptyFormState() {
  return {
    accentColor: "#dbe2ff",
    address: "",
    currencySymbol: "₡",
    displayName: "",
    email: "",
    legalName: "",
    logoFileName: "",
    phone: "",
    primaryColor: "#1B2D5A",
    proformPrefix: "PRO",
    secondaryColor: "#e6c7f0",
    taxLabel: "Tax",
    taxPercentage: "0",
    termsAndConditions: "",
    website: "",
  };
}

type SettingsFormState = ReturnType<typeof createEmptyFormState>;

function buildFormState(settings: CompanySettings): SettingsFormState {
  return {
    accentColor: settings.accentColor ?? "#dbe2ff",
    address: settings.address ?? "",
    currencySymbol: settings.currencySymbol ?? "₡",
    displayName: settings.displayName ?? "",
    email: settings.email ?? "",
    legalName: settings.legalName ?? "",
    logoFileName: settings.logoFileName ?? "",
    phone: settings.phone ?? "",
    primaryColor: settings.primaryColor ?? "#1B2D5A",
    proformPrefix: settings.proformPrefix ?? "PRO",
    secondaryColor: settings.secondaryColor ?? "#e6c7f0",
    taxLabel: settings.taxLabel ?? "Tax",
    taxPercentage: String(settings.taxPercentage ?? 0),
    termsAndConditions: settings.termsAndConditions ?? "",
    website: settings.website ?? "",
  };
}

export function useSettingsPage() {
  const { companySettings, refreshCompanySettings } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [form, setForm] = useState<SettingsFormState>(() =>
    companySettings ? buildFormState(companySettings) : createEmptyFormState(),
  );

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const settings = await getCurrentCompanySettings(true);
        setForm(buildFormState(settings));
      } catch {
        setFeedback(createErrorFeedback("Failed to load company settings."));
      } finally {
        setIsLoading(false);
      }
    }

    void loadSettings();
  }, []);

  const previewStyles = useMemo(
    () => ({
      accentColor: form.accentColor || "#dbe2ff",
      currencySymbol: form.currencySymbol || "₡",
      displayName: form.displayName || "Your Company",
      prefix: form.proformPrefix || "PRO",
      primaryColor: form.primaryColor || "#1B2D5A",
      secondaryColor: form.secondaryColor || "#e6c7f0",
      taxLabel: form.taxLabel || "Tax",
      taxPercentage: form.taxPercentage || "0",
    }),
    [form],
  );

  function clearFeedback() {
    setFeedback(null);
  }

  function updateField<K extends keyof SettingsFormState>(field: K, value: SettingsFormState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    const parsedTaxPercentage = Number(form.taxPercentage);

    if (!Number.isFinite(parsedTaxPercentage) || parsedTaxPercentage < 0 || parsedTaxPercentage > 100) {
      setFeedback(createErrorFeedback("Tax percentage must be between 0 and 100."));
      return;
    }

    setIsSaving(true);

    try {
      await updateCompanySettings({
        accentColor: form.accentColor.trim() || null,
        address: form.address.trim() || null,
        currencySymbol: form.currencySymbol.trim(),
        displayName: form.displayName.trim(),
        email: form.email.trim() || null,
        legalName: form.legalName.trim() || null,
        logoFileName: form.logoFileName.trim() || null,
        phone: form.phone.trim() || null,
        primaryColor: form.primaryColor.trim() || null,
        proformPrefix: form.proformPrefix.trim(),
        secondaryColor: form.secondaryColor.trim() || null,
        taxLabel: form.taxLabel.trim(),
        taxPercentage: parsedTaxPercentage,
        termsAndConditions: form.termsAndConditions.trim() || null,
        website: form.website.trim() || null,
      });

      await refreshCompanySettings();
      setFeedback(createSuccessFeedback("Company settings updated successfully."));
    } catch {
      setFeedback(createErrorFeedback("Failed to update company settings."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    clearFeedback();

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploadingLogo(true);

    try {
      await replaceCompanyLogo(file);
      await refreshCompanySettings();
      setFeedback(createSuccessFeedback("Company logo updated successfully."));
    } catch {
      setFeedback(createErrorFeedback("Failed to update the company logo."));
    } finally {
      setIsUploadingLogo(false);
      event.target.value = "";
    }
  }

  return {
    companySettings,
    feedback,
    form,
    handleLogoChange,
    handleSubmit,
    isLoading,
    isSaving,
    isUploadingLogo,
    previewStyles,
    updateField,
  };
}
