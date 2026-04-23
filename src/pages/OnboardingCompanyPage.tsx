import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/useAuth";
import {
  replaceCompanyLogo,
  updateCompanySettings,
} from "@/lib/api/companySettingsApi";
import { isCompanySetupComplete } from "@/lib/utils/companySetup";
import { createErrorFeedback, createSuccessFeedback } from "@/lib/utils/feedback";

export function OnboardingCompanyPage() {
  const navigate = useNavigate();
  const { companySettings, refreshCompanySettings, isLoading } = useAuth();

  const [displayName, setDisplayName] = useState(companySettings?.displayName ?? "");
  const [proformPrefix, setProformPrefix] = useState(companySettings?.proformPrefix ?? "PRO");
  const [taxPercentage, setTaxPercentage] = useState(
    String(companySettings?.taxPercentage ?? 13),
  );
  const [currencySymbol, setCurrencySymbol] = useState(
    companySettings?.currencySymbol ?? "₡",
  );
  const [taxLabel, setTaxLabel] = useState(companySettings?.taxLabel ?? "Tax");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const hasHydratedFormRef = useRef(false);

  useEffect(() => {
    if (!companySettings || hasHydratedFormRef.current) {
      return;
    }

    setDisplayName(companySettings.displayName ?? "");
    setProformPrefix(companySettings.proformPrefix ?? "PRO");
    setTaxPercentage(String(companySettings.taxPercentage ?? 13));
    setCurrencySymbol(companySettings.currencySymbol ?? "₡");
    setTaxLabel(companySettings.taxLabel ?? "Tax");
    hasHydratedFormRef.current = true;
  }, [companySettings]);

  const inputClassName =
    "w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200";

  const preview = useMemo(
    () => ({
      displayName: displayName.trim() || "Your Company",
      prefix: proformPrefix.trim() || "PRO",
      tax: taxPercentage.trim() || "0",
      currency: currencySymbol.trim() || "₡",
      taxLabel: taxLabel.trim() || "Tax",
    }),
    [currencySymbol, displayName, proformPrefix, taxLabel, taxPercentage],
  );

  if (!isLoading && isCompanySetupComplete(companySettings)) {
    return <Navigate to="/app" replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const parsedTaxPercentage = Number(taxPercentage);

    if (!displayName.trim()) {
      setFeedback(createErrorFeedback("Display name is required."));
      return;
    }

    if (!proformPrefix.trim()) {
      setFeedback(createErrorFeedback("Proform prefix is required."));
      return;
    }

    if (!currencySymbol.trim()) {
      setFeedback(createErrorFeedback("Currency symbol is required."));
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

    setIsSubmitting(true);

    try {
      await updateCompanySettings(
        {
          displayName: displayName.trim(),
          legalName: companySettings?.legalName ?? null,
          website: companySettings?.website ?? null,
          phone: companySettings?.phone ?? null,
          email: companySettings?.email ?? null,
          address: companySettings?.address ?? null,
          termsAndConditions: companySettings?.termsAndConditions ?? null,
          logoFileName: companySettings?.logoFileName ?? null,
          primaryColor: companySettings?.primaryColor ?? "#1B2D5A",
          secondaryColor: companySettings?.secondaryColor ?? "#e6c7f0",
          accentColor: companySettings?.accentColor ?? "#dbe2ff",
          proformPrefix: proformPrefix.trim(),
          taxPercentage: parsedTaxPercentage,
          currencySymbol: currencySymbol.trim(),
          taxLabel: taxLabel.trim() || "Tax",
        },
      );

      if (logoFile) {
        await replaceCompanyLogo(logoFile);
      }

      await refreshCompanySettings();

      setFeedback(createSuccessFeedback("Company setup completed successfully."));
      navigate("/app/proforms/new", { replace: true });
    } catch {
      setFeedback(createErrorFeedback("Failed to complete company setup."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <div className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
          Welcome Setup
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Set up your company
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Complete the essentials so you can start creating branded proforms right away.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          onSubmit={handleSubmit}
        >
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Business Essentials
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              These values will appear in your proforms and calculations.
            </p>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Display Name</label>
              <input
                className={inputClassName}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Ecotech CR"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Proform Prefix</label>
              <input
                className={inputClassName}
                value={proformPrefix}
                onChange={(event) => setProformPrefix(event.target.value)}
                placeholder="PRO"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Tax Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                className={inputClassName}
                value={taxPercentage}
                onChange={(event) => setTaxPercentage(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Currency Symbol</label>
              <input
                className={inputClassName}
                value={currencySymbol}
                onChange={(event) => setCurrencySymbol(event.target.value)}
                placeholder="₡"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Tax Label</label>
              <input
                className={inputClassName}
                value={taxLabel}
                onChange={(event) => setTaxLabel(event.target.value)}
                placeholder="Tax"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Logo (optional)</label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                className={inputClassName}
                onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          {feedback ? (
            <div
              className={`rounded-2xl px-4 py-3.5 text-sm shadow-sm ${
                feedback.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {feedback.message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving setup..." : "Continue to Proforms"}
          </button>
        </form>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Live Preview
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            This gives you a quick idea of how your company identity will look.
          </p>

          <div className="mt-5 rounded-3xl bg-slate-100 p-4">
            <div className="rounded-3xl bg-slate-900 p-5 text-white">
              <div className="text-xs uppercase tracking-wide text-white/70">
                {preview.prefix}-000001
              </div>

              <div className="mt-2 text-2xl font-semibold">{preview.displayName}</div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-white/70">
                    Tax
                  </div>
                  <div className="mt-1 font-medium">
                    {preview.taxLabel} ({preview.tax}%)
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-white/70">
                    Currency
                  </div>
                  <div className="mt-1 font-medium">{preview.currency}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
