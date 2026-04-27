import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useOnboardingCompanyPage } from "@/hooks/pages/company/useOnboardingCompanyPage";

export function OnboardingCompanyPage() {
  const { t } = useTranslation();
  const {
    currencySymbol,
    displayName,
    feedback,
    handleLogoChange,
    handleSubmit,
    isSubmitting,
    preview,
    proformPrefix,
    setCurrencySymbol,
    setDisplayName,
    setProformPrefix,
    setTaxLabel,
    setTaxPercentage,
    shouldRedirect,
    taxLabel,
    taxPercentage,
  } = useOnboardingCompanyPage();

  const inputClassName =
    "w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200";

  if (shouldRedirect) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <div className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
          {t("pages.onboardingCompany.badge")}
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          {t("pages.onboardingCompany.title")}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {t("pages.onboardingCompany.description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          onSubmit={handleSubmit}
        >
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              {t("pages.onboardingCompany.businessEssentials")}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {t("pages.onboardingCompany.businessEssentialsDescription")}
            </p>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t("common.labels.displayName")}</label>
              <input
                className={inputClassName}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Ecotech CR"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">{t("pages.onboardingCompany.proformPrefix")}</label>
              <input
                className={inputClassName}
                value={proformPrefix}
                onChange={(event) => setProformPrefix(event.target.value)}
                placeholder="PRO"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">{t("pages.onboardingCompany.taxPercentage")}</label>
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
              <label className="mb-1 block text-sm font-medium">{t("pages.onboardingCompany.currencySymbol")}</label>
              <input
                className={inputClassName}
                value={currencySymbol}
                onChange={(event) => setCurrencySymbol(event.target.value)}
                placeholder="₡"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">{t("pages.onboardingCompany.taxLabel")}</label>
              <input
                className={inputClassName}
                value={taxLabel}
                onChange={(event) => setTaxLabel(event.target.value)}
                placeholder={t("common.defaults.taxLabel")}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">{t("pages.onboardingCompany.logoOptional")}</label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                className={inputClassName}
                onChange={handleLogoChange}
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
            {isSubmitting ? t("pages.onboardingCompany.savingSetup") : t("pages.onboardingCompany.continueToProforms")}
          </button>
        </form>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            {t("pages.onboardingCompany.livePreview")}
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            {t("pages.onboardingCompany.livePreviewDescription")}
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
                    {t("common.finance.tax")}
                  </div>
                  <div className="mt-1 font-medium">
                    {preview.taxLabel} ({preview.tax}%)
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-white/70">
                    {t("common.finance.currency")}
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
