import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/useAuth";
import { replaceCompanyLogo, updateCompanySettings } from "@/lib/api/companySettingsApi";
import { isCompanySetupComplete } from "@/lib/utils/companySetup";
import { createErrorFeedback, createSuccessFeedback } from "@/lib/utils/feedback";

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

export function useOnboardingCompanyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { companySettings, refreshCompanySettings, isLoading } = useAuth();

  const [displayName, setDisplayName] = useState(companySettings?.displayName ?? "");
  const [proformPrefix, setProformPrefix] = useState(companySettings?.proformPrefix ?? "PRO");
  const [taxPercentage, setTaxPercentage] = useState(String(companySettings?.taxPercentage ?? 13));
  const [currencySymbol, setCurrencySymbol] = useState(companySettings?.currencySymbol ?? "₡");
  const [taxLabel, setTaxLabel] = useState(companySettings?.taxLabel ?? t("common.defaults.taxLabel"));
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const hasHydratedFormRef = useRef(false);

  useEffect(() => {
    if (!companySettings || hasHydratedFormRef.current) {
      return;
    }

    setDisplayName(companySettings.displayName ?? "");
    setProformPrefix(companySettings.proformPrefix ?? "PRO");
    setTaxPercentage(String(companySettings.taxPercentage ?? 13));
    setCurrencySymbol(companySettings.currencySymbol ?? "₡");
    setTaxLabel(companySettings.taxLabel ?? t("common.defaults.taxLabel"));
    hasHydratedFormRef.current = true;
  }, [companySettings, t]);

  const preview = useMemo(
    () => ({
      currency: currencySymbol.trim() || "₡",
      displayName: displayName.trim() || t("common.defaults.companyName"),
      prefix: proformPrefix.trim() || "PRO",
      tax: taxPercentage.trim() || "0",
      taxLabel: taxLabel.trim() || t("common.defaults.taxLabel"),
    }),
    [currencySymbol, displayName, proformPrefix, t, taxLabel, taxPercentage],
  );

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    setLogoFile(event.target.files?.[0] ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const parsedTaxPercentage = Number(taxPercentage);

    if (!displayName.trim()) {
      setFeedback(createErrorFeedback(t("pages.onboardingCompany.feedback.displayNameRequired")));
      return;
    }

    if (!proformPrefix.trim()) {
      setFeedback(createErrorFeedback(t("pages.onboardingCompany.feedback.prefixRequired")));
      return;
    }

    if (!currencySymbol.trim()) {
      setFeedback(createErrorFeedback(t("pages.onboardingCompany.feedback.currencyRequired")));
      return;
    }

    if (
      !Number.isFinite(parsedTaxPercentage) ||
      parsedTaxPercentage < 0 ||
      parsedTaxPercentage > 100
    ) {
      setFeedback(createErrorFeedback(t("pages.onboardingCompany.feedback.taxRange")));
      return;
    }

    setIsSubmitting(true);

    try {
      await updateCompanySettings({
        accentColor: companySettings?.accentColor ?? "#dbe2ff",
        address: companySettings?.address ?? null,
        currencySymbol: currencySymbol.trim(),
        displayName: displayName.trim(),
        email: companySettings?.email ?? null,
        legalName: companySettings?.legalName ?? null,
        logoFileName: companySettings?.logoFileName ?? null,
        phone: companySettings?.phone ?? null,
        primaryColor: companySettings?.primaryColor ?? "#1B2D5A",
        proformPrefix: proformPrefix.trim(),
        secondaryColor: companySettings?.secondaryColor ?? "#e6c7f0",
        taxLabel: taxLabel.trim() || t("common.defaults.taxLabel"),
        taxPercentage: parsedTaxPercentage,
        termsAndConditions: companySettings?.termsAndConditions ?? null,
        website: companySettings?.website ?? null,
      });

      if (logoFile) {
        await replaceCompanyLogo(logoFile);
      }

      await refreshCompanySettings();

      setFeedback(createSuccessFeedback(t("pages.onboardingCompany.feedback.success")));
      navigate("/app/proforms/new", { replace: true });
    } catch {
      setFeedback(createErrorFeedback(t("pages.onboardingCompany.feedback.failed")));
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    currencySymbol,
    displayName,
    feedback,
    handleLogoChange,
    handleSubmit,
    isSubmitting,
    logoFile,
    preview,
    proformPrefix,
    setCurrencySymbol,
    setDisplayName,
    setProformPrefix,
    setTaxLabel,
    setTaxPercentage,
    shouldRedirect: !isLoading && isCompanySetupComplete(companySettings),
    taxLabel,
    taxPercentage,
  };
}
