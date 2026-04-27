import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/PageLoader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getProformStatusBadgeClassName, getProformStatusLabel } from "@/lib/utils/proformStatus";
import { useProformsListPage } from "@/hooks/pages/proforms/useProformsListPage";

function formatDate(value: string, locale: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(value: number | null | undefined): string {
  return (value ?? 0).toFixed(2);
}

function formatPercent(value: number | null | undefined): string {
  return `${value ?? 0}%`;
}

export function ProformsListPage() {
  const { i18n, t } = useTranslation();
  const {
    clearFilters,
    clientFilter,
    companySettings,
    currencySymbol,
    feedback,
    filteredProforms,
    fromDateFilter,
    hasActiveFilters,
    isLoading,
    proforms,
    setClientFilter,
    setFromDateFilter,
    setStatusFilter,
    setToDateFilter,
    statusFilter,
    statusOptions,
    toDateFilter,
    todayDateValue,
  } = useProformsListPage();

  if (isLoading) {
    return <PageLoader message={t("pages.proformsList.loading")} />;
  }

  return (
    <div className="mx-auto max-w-6xl px-1 sm:px-0">
      <SectionHeader
        title={t("pages.proformsList.title")}
        description={t("pages.proformsList.description")}
      />

      {feedback ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 shadow-sm">
          {feedback.message}
        </div>
      ) : null}

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">{t("pages.proformsList.filterTitle")}</h2>
              <p className="text-sm text-slate-500">
                {t("pages.proformsList.filterDescription")}
              </p>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("common.actions.clearFilters")}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="xl:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">{t("pages.proformsList.clientName")}</label>
              <input
                type="text"
                value={clientFilter}
                onChange={(event) => setClientFilter(event.target.value)}
                placeholder={t("pages.proformsList.searchByClient")}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t("common.labels.status")}</label>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as (typeof statusOptions)[number])
                }
                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {getProformStatusLabel(status, t)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2 xl:col-span-1">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t("pages.proformsList.from")}</label>
                <input
                  type="date"
                  value={fromDateFilter}
                  max={toDateFilter || undefined}
                  onChange={(event) => setFromDateFilter(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t("pages.proformsList.to")}</label>
                <input
                  type="date"
                  value={toDateFilter}
                  min={fromDateFilter || undefined}
                  max={todayDateValue}
                  onChange={(event) => setToDateFilter(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {proforms.length === 0 ? (
        <EmptyState
          title={t("pages.proformsList.noProformsTitle")}
          description={t("pages.proformsList.noProformsDescription")}
          action={
            <Link
              to="/app/proforms/new"
              className="inline-flex rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              {t("common.actions.createFirst")}
            </Link>
          }
        />
      ) : filteredProforms.length === 0 ? (
        <EmptyState
          title={t("pages.proformsList.noMatchesTitle")}
          description={t("pages.proformsList.noMatchesDescription")}
          action={
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              {t("common.actions.resetFilters")}
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredProforms.map((proform) => (
            <Link
              key={proform.id}
              to={`/app/proforms/${proform.id}`}
              className="block rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:bg-slate-50"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                      {proform.number}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getProformStatusBadgeClassName(proform.status)}`}
                    >
                      {getProformStatusLabel(proform.status, t)}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-slate-600">
                    {t("pages.proformsList.clientPrefix")} <span className="font-medium text-slate-800">{proform.clientName}</span>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span>{proform.clientEmail || t("common.defaults.noEmail")}</span>
                    <span>{proform.clientPhone || t("common.defaults.noPhone")}</span>
                    <span>{formatDate(proform.issuedAtUtc, i18n.resolvedLanguage?.startsWith("es") ? "es-CR" : "en-US")}</span>
                  </div>
                </div>

                <div className="grid min-w-[220px] gap-2 rounded-2xl bg-slate-50 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t("common.finance.subtotal")}</span>
                    <span className="font-medium text-slate-800">
                      {currencySymbol}
                      {formatMoney(proform.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      {companySettings?.taxLabel ?? t("common.defaults.taxLabel")} ({formatPercent(proform.taxPercentage)})
                    </span>
                    <span className="font-medium text-slate-800">
                      {currencySymbol}
                      {formatMoney(proform.taxAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-300 pt-2 text-base font-semibold text-slate-900">
                    <span>{t("common.finance.total")}</span>
                    <span>
                      {currencySymbol}
                      {formatMoney(proform.total)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
