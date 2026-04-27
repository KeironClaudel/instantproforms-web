import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDashboardPage } from "@/hooks/pages/dashboard/useDashboardPage";

function InfoCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {title}
      </div>
      <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
      {helper ? <div className="mt-1 text-sm text-slate-500">{helper}</div> : null}
    </div>
  );
}

function QuickAction({
  to,
  title,
  description,
  variant = "default",
}: {
  to: string;
  title: string;
  description: string;
  variant?: "default" | "highlight";
}) {
  const className =
    variant === "highlight"
      ? "rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:bg-amber-100"
      : "rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50";

  return (
    <Link to={to} className={className}>
      <div className="text-base font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm leading-6 text-slate-600">{description}</div>
    </Link>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();
  const {
    companySettings,
    companyName,
    currencySymbol,
    isSetupComplete,
    logoUrl,
    phone,
    prefix,
    primaryColor,
    taxLabel,
    taxPercentage,
    userFirstName,
    website,
  } = useDashboardPage();

  return (
    <div className="space-y-7">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
              {t("pages.dashboard.badge")}
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              {t("pages.dashboard.welcome", { name: userFirstName })}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {t("pages.dashboard.description")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t("components.appShell.workspace")}
            </div>
            <div className="mt-1 text-lg font-semibold text-slate-900">
              {companyName}
            </div>
            <div className="mt-2 text-sm text-slate-600">
              {t("components.appShell.setupStatus")}:{" "}
              <span
                className={
                  isSetupComplete ? "font-medium text-emerald-700" : "font-medium text-amber-700"
                }
              >
                {isSetupComplete
                  ? t("components.appShell.setupComplete")
                  : t("components.appShell.setupNeedsAttention")}
              </span>
            </div>
          </div>
        </div>

        {!isSetupComplete ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-sm font-semibold text-amber-900">
              {t("pages.dashboard.finishSetupTitle")}
            </div>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              {t("pages.dashboard.finishSetupBody")}
            </p>

            <div className="mt-4">
              <Link
                to="/app/onboarding/company"
                className="inline-flex rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600"
              >
                {t("common.actions.completeSetup")}
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                {t("pages.dashboard.quickActions")}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {t("pages.dashboard.quickActionsDescription")}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <QuickAction
                to="/app/proforms/new"
                title={t("pages.dashboard.createNewProform")}
                description={t("pages.dashboard.createNewProformDescription")}
                variant="highlight"
              />

              <QuickAction
                to="/app/settings"
                title={t("pages.dashboard.openCompanySettings")}
                description={t("pages.dashboard.openCompanySettingsDescription")}
              />

              {!isSetupComplete ? (
                <QuickAction
                  to="/app/onboarding/company"
                  title={t("common.actions.completeSetup")}
                  description={t("pages.dashboard.completeSetupDescription")}
                  variant="highlight"
                />
              ) : null}

              <QuickAction
                to="/app/settings"
                title={t("pages.dashboard.reviewBranding")}
                description={t("pages.dashboard.reviewBrandingDescription")}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                {t("pages.dashboard.latestSettingsSnapshot")}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {t("pages.dashboard.latestSettingsSnapshotDescription")}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard title={t("components.appShell.prefix")} value={prefix} helper={t("pages.dashboard.prefixHelper")} />
              <InfoCard title={t("common.finance.tax")} value={taxPercentage} helper={t("pages.dashboard.taxHelper", { label: taxLabel })} />
              <InfoCard title={t("common.finance.currency")} value={currencySymbol} helper={t("pages.dashboard.currencyHelper")} />
              <InfoCard title={t("common.labels.website")} value={website} />
              <InfoCard title={t("common.labels.phone")} value={phone} />
              <InfoCard
                title={t("pages.settings.logo")}
                value={companySettings?.logoUrl ? t("pages.dashboard.logoUploaded") : t("pages.dashboard.logoNotUploaded")}
                helper={
                  companySettings?.logoUrl
                    ? t("pages.dashboard.logoUploadedHelper")
                    : t("pages.dashboard.logoNotUploadedHelper")
                }
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                {t("pages.dashboard.companyIdentity")}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {t("pages.dashboard.companyIdentityDescription")}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-100 p-4">
              <div
                  className="rounded-3xl p-5 text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
                      <img
                        src={logoUrl}
                        alt={companyName}
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-900">
                      IP
                    </div>
                  )}

                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/70">
                      {prefix}-000001
                    </div>
                    <div className="mt-1 text-xl font-semibold">{companyName}</div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl bg-white/10 px-4 py-3">
                      <div className="text-xs uppercase tracking-wide text-white/70">
                        {t("pages.dashboard.taxConfiguration")}
                      </div>
                    <div className="mt-1 font-medium">
                      {taxLabel} · {taxPercentage}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-white/70">
                      {t("common.finance.currency")}
                    </div>
                    <div className="mt-1 font-medium">{currencySymbol}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                {t("pages.dashboard.nextBestAction")}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {t("pages.dashboard.nextBestActionDescription")}
              </p>
            </div>

            {isSetupComplete ? (
              <Link
                to="/app/proforms/new"
                className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100"
              >
                <div className="text-base font-semibold text-slate-900">
                  {t("pages.dashboard.createNextProform")}
                </div>
                <div className="mt-1 text-sm leading-6 text-slate-600">
                  {t("pages.dashboard.createNextProformDescription")}
                </div>
              </Link>
            ) : (
              <Link
                to="/app/onboarding/company"
                className="block rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:bg-amber-100"
              >
                <div className="text-base font-semibold text-amber-900">
                  {t("pages.dashboard.finishSetupCta")}
                </div>
                <div className="mt-1 text-sm leading-6 text-amber-800">
                  {t("pages.dashboard.finishSetupCtaDescription")}
                </div>
              </Link>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
