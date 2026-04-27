import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/PageLoader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getProformStatusBadgeClassName, getProformStatusLabel } from "@/lib/utils/proformStatus";
import { useProformDetailsPage } from "@/hooks/pages/proforms/useProformDetailsPage";

export function ProformDetailsPage() {
  const { t } = useTranslation();
  const {
    companySettings,
    currencySymbol,
    editableStatuses,
    feedback,
    handleDownloadPdf,
    handleSendToClientEmail,
    handleShare,
    handleUpdateStatus,
    isDownloading,
    isLoading,
    isSendingToClientEmail,
    isSharing,
    isUpdatingStatus,
    issuedAtLabel,
    proform,
    selectedStatus,
    setSelectedStatus,
  } = useProformDetailsPage();

  if (isLoading) {
    return <PageLoader message={t("pages.proformDetails.loading")} />;
  }

  if (!proform) {
    return (
      <EmptyState
        title={t("pages.proformDetails.proformNotFoundTitle")}
        description={t("pages.proformDetails.proformNotFoundDescription")}
        action={
          <Link
            to="/app/proforms"
            className="inline-flex rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            {t("pages.proformDetails.backToProforms")}
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-1 sm:px-0">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          title={proform.number}
          description={t("pages.proformDetails.createdOn", {
            clientName: proform.clientName,
            date: issuedAtLabel,
          })}
        />

        <div className="flex flex-wrap gap-3">
          <Link
            to="/app/proforms"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {t("common.actions.back")}
          </Link>

          <button
            type="button"
            onClick={() => void handleDownloadPdf()}
            disabled={isDownloading}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isDownloading ? t("pages.proformDetails.downloading") : t("pages.proformDetails.downloadPdf")}
          </button>

          <button
            type="button"
            onClick={() => void handleShare()}
            disabled={isSharing}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSharing ? t("pages.proformDetails.sharing") : t("pages.proformDetails.share")}
          </button>

          <button
            type="button"
            onClick={() => void handleSendToClientEmail()}
            disabled={isSendingToClientEmail || !proform.clientEmail}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSendingToClientEmail ? t("pages.proformDetails.sending") : t("pages.proformDetails.sendToClientEmail")}
          </button>
        </div>
      </div>

      {feedback ? (
        <div
          className={`mb-6 rounded-2xl px-4 py-3.5 text-sm shadow-sm ${
            feedback.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-900">
              {t("pages.proformDetails.clientInformation")}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">{t("common.labels.client")}</div>
                <div className="mt-1 font-semibold text-slate-900">{proform.clientName}</div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">{t("common.labels.status")}</div>
                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getProformStatusBadgeClassName(proform.status)}`}
                  >
                    {getProformStatusLabel(proform.status, t)}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">{t("common.labels.email")}</div>
                <div className="mt-1 font-semibold text-slate-900">
                  {proform.clientEmail || t("common.defaults.notProvided")}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">{t("common.labels.phone")}</div>
                <div className="mt-1 font-semibold text-slate-900">
                  {proform.clientPhone || t("common.defaults.notProvided")}
                </div>
              </div>
            </div>

            {proform.notes ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">{t("common.labels.notes")}</div>
                <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {proform.notes}
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-900">
              {t("pages.proformDetails.updateStatus")}
            </h2>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div>
                <label className="mb-1 block text-sm font-medium">{t("common.labels.status")}</label>
                <select
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  disabled={isUpdatingStatus}
                >
                  {editableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {getProformStatusLabel(status, t)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => void handleUpdateStatus()}
                disabled={isUpdatingStatus || selectedStatus === proform.status}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdatingStatus ? t("pages.proformDetails.saving") : t("pages.proformDetails.saveStatus")}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-900">
              {t("pages.proformDetails.items")}
            </h2>

            <div className="space-y-3">
              {proform.items
                .slice()
                .sort((left, right) => left.sortOrder - right.sortOrder)
                .map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="grid gap-3 lg:grid-cols-[1.8fr_0.6fr_0.8fr_0.8fr]">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          {t("common.labels.description")}
                        </div>
                        <div className="mt-1 font-medium text-slate-900">
                          {item.description}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          {t("common.labels.quantity")}
                        </div>
                        <div className="mt-1 font-medium text-slate-900">{item.quantity}</div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          {t("common.finance.unitPrice")}
                        </div>
                        <div className="mt-1 font-medium text-slate-900">
                          {currencySymbol}
                          {item.unitPrice.toFixed(2)}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          {t("common.finance.total")}
                        </div>
                        <div className="mt-1 font-semibold text-slate-900">
                          {currencySymbol}
                          {item.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-900">
              {t("pages.proformDetails.financialSummary")}
            </h2>

            <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">{t("common.finance.subtotal")}</span>
                <span className="font-medium text-slate-900">
                  {currencySymbol}
                  {proform.subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  {companySettings?.taxLabel ?? t("common.defaults.taxLabel")} ({proform.taxPercentage}%)
                </span>
                <span className="font-medium text-slate-900">
                  {currencySymbol}
                  {proform.taxAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-300 pt-4 text-lg font-semibold text-slate-900">
                <span>{t("common.finance.total")}</span>
                <span>
                  {currencySymbol}
                  {proform.total.toFixed(2)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
