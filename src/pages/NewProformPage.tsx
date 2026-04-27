import { calculateLineTotal } from "@/lib/utils/proformCalculations";
import { useTranslation } from "react-i18next";
import { getProformStatusBadgeClassName, getProformStatusLabel } from "@/lib/utils/proformStatus";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useNewProformPage } from "@/hooks/pages/proforms/useNewProformPage";

export function NewProformPage() {
  const { t } = useTranslation();
  const {
    addItem,
    clientEmail,
    clientName,
    clientPhone,
    companySettings,
    createdProform,
    emailMessage,
    emailSubject,
    emailTo,
    feedback,
    handleCopyShareLink,
    handleCreateShareLink,
    handleDownloadPdf,
    handleNativeShare,
    handleSendByEmail,
    handleSubmit,
    isCopyingShareLink,
    isCreatingShareLink,
    isDownloading,
    isSendingEmail,
    isSharing,
    isSubmitting,
    items,
    notes,
    queuedNotice,
    removeItem,
    resetCreatedProform,
    setClientEmail,
    setClientName,
    setClientPhone,
    setEmailMessage,
    setEmailSubject,
    setEmailTo,
    setNotes,
    shareUrlValue,
    subtotal,
    taxAmount,
    taxPercentage,
    total,
    updateItem,
  } = useNewProformPage();

  const inputClassName =
  "w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200";

const textareaClassName =
  "min-h-28 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200";

  return (
    <div className="mx-auto max-w-5xl px-1 sm:px-0">
      <div className="mb-8">
        <div className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
          {t("pages.newProform.badge")}
        </div>

        <div className="mt-3">
          <SectionHeader
            title={t("pages.newProform.title")}
            description={t("pages.newProform.description")}
          />
        </div>
      </div>

      <form className="space-y-6 sm:space-y-7" onSubmit={handleSubmit}>
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-900">
            {t("pages.newProform.clientInformation")}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">{t("pages.newProform.clientName")}</label>
              <input
                className={inputClassName}
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">{t("pages.newProform.clientEmail")}</label>
              <input
                type="email"
                className={inputClassName}
                value={clientEmail}
                onChange={(event) => setClientEmail(event.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">{t("pages.newProform.clientPhone")}</label>
              <input
                className={inputClassName}
                value={clientPhone}
                onChange={(event) => setClientPhone(event.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">{t("pages.newProform.notesLocation")}</label>
              <textarea
                className={textareaClassName}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{t("pages.newProform.items")}</h2>

            <button
              type="button"
              onClick={addItem}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {t("pages.newProform.addItem")}
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-800">
                    {t("pages.newProform.itemNumber", { index: index + 1 })}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-sm font-medium text-red-600 transition hover:text-red-700"
                  >
                    {t("pages.newProform.remove")}
                  </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-6">
                    <label className="mb-1 block text-sm font-medium">{t("common.labels.description")}</label>
                    <input
                      className={inputClassName}
                      value={item.description}
                      onChange={(event) => updateItem(item.id, "description", event.target.value)}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-1 block text-sm font-medium">{t("common.labels.quantity")}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={inputClassName}
                      value={item.quantity}
                      onChange={(event) => updateItem(item.id, "quantity", event.target.value)}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-1 block text-sm font-medium">{t("common.finance.unitPrice")}</label>
                    <input
                      inputMode="decimal"
                      type="text"
                      className={inputClassName}
                      value={item.unitPrice}
                      onChange={(event) => updateItem(item.id, "unitPrice", event.target.value)}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-1 block text-sm font-medium">{t("pages.newProform.lineTotal")}</label>
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700">
                      {companySettings?.currencySymbol ?? "₡"}
                      {calculateLineTotal(item.quantity, item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-900">
            {t("pages.newProform.summary")}
          </h2>

          <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span>{t("common.finance.subtotal")}</span>
              <span>
                {companySettings?.currencySymbol ?? "₡"}
                {subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>
                {companySettings?.taxLabel ?? t("common.defaults.taxLabel")} ({taxPercentage}%)
              </span>
              <span>
                {companySettings?.currencySymbol ?? "₡"}
                {taxAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-300 pt-4 text-lg font-semibold text-slate-900">
              <span>{t("common.finance.total")}</span>
              <span>
                {companySettings?.currencySymbol ?? "₡"}
                {total.toFixed(2)}
              </span>
            </div>
          </div>
        </section>

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
          {isSubmitting ? t("pages.newProform.creatingProform") : t("pages.newProform.createProform")}
        </button>

        {queuedNotice ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-800 shadow-sm">
            {t("pages.newProform.queuedNotice", {
              clientName: queuedNotice.clientName,
              queueId: queuedNotice.queueId,
            })}
          </div>
        ) : null}

        {!createdProform ? (
          <EmptyState
            title={t("pages.newProform.noProformYetTitle")}
            description={t("pages.newProform.noProformYetDescription")}
          />
        ) : null}

        {createdProform ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-medium uppercase tracking-wide text-emerald-700">
                    {t("pages.newProform.proformCreated")}
                  </div>

                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                    {createdProform.number}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span
                      className={`rounded-full px-3 py-1 font-medium ${getProformStatusBadgeClassName(createdProform.status)}`}
                    >
                      {t("pages.newProform.statusPrefix", {
                        status: getProformStatusLabel(createdProform.status, t),
                      })}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-700">
                      {t("pages.newProform.prefixLabel", {
                        prefix: companySettings?.proformPrefix ?? "-",
                      })}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-700">
                      {t("pages.newProform.taxLabel", { tax: createdProform.taxPercentage })}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                  <div className="text-xs uppercase tracking-wide text-slate-500">{t("common.finance.total")}</div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">
                    {companySettings?.currencySymbol ?? "₡"}
                    {createdProform.total.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                <div className="rounded-xl bg-white px-3 py-3">
                  <div className="text-slate-500">{t("common.finance.subtotal")}</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {companySettings?.currencySymbol ?? "₡"}
                    {createdProform.subtotal.toFixed(2)}
                  </div>
                </div>

                <div className="rounded-xl bg-white px-3 py-3">
                  <div className="text-slate-500">
                    {companySettings?.taxLabel ?? t("common.defaults.taxLabel")} ({createdProform.taxPercentage}%)
                  </div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {companySettings?.currencySymbol ?? "₡"}
                    {createdProform.taxAmount.toFixed(2)}
                  </div>
                </div>

                <div className="rounded-xl bg-white px-3 py-3">
                  <div className="text-slate-500">{t("common.finance.finalTotal")}</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {companySettings?.currencySymbol ?? "₡"}
                    {createdProform.total.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                {t("pages.newProform.proformActions")}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {t("pages.newProform.proformActionsDescription")}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => void handleDownloadPdf()}
                disabled={isDownloading}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {isDownloading ? t("pages.newProform.downloading") : t("pages.newProform.downloadPdf")}
              </button>

              <button
                type="button"
                onClick={() => void handleCreateShareLink()}
                disabled={isCreatingShareLink}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {isCreatingShareLink ? t("pages.newProform.creatingLink") : t("pages.newProform.createShareLink")}
              </button>

              <button
                type="button"
                onClick={() => void handleNativeShare()}
                disabled={isSharing}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {isSharing ? t("pages.newProform.sharing") : t("pages.newProform.share")}
              </button>

              <button
                type="button"
                onClick={resetCreatedProform}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {t("pages.newProform.createAnother")}
              </button>
            </div>

            {shareUrlValue ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">{t("pages.newProform.shareUrl")}</div>

                  <button
                    type="button"
                    onClick={() => void handleCopyShareLink()}
                    disabled={isCopyingShareLink}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    {isCopyingShareLink ? t("pages.newProform.copying") : t("common.actions.copyLink")}
                  </button>
                </div>

                <div className="break-all text-sm text-slate-700">{shareUrlValue}</div>
              </div>
            ) : null}

            <div className="mt-6 border-t border-slate-200 pt-5">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">{t("pages.newProform.sendByEmail")}</h3>

              <div className="grid gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">{t("common.labels.recipientEmail")}</label>
                  <input
                    type="email"
                    className={inputClassName}
                    value={emailTo}
                    onChange={(event) => setEmailTo(event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">{t("common.labels.subject")}</label>
                  <input
                    className={inputClassName}
                    value={emailSubject}
                    onChange={(event) => setEmailSubject(event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">{t("pages.newProform.message")}</label>
                  <textarea
                    className={textareaClassName}
                    value={emailMessage}
                    onChange={(event) => setEmailMessage(event.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void handleSendByEmail()}
                  disabled={isSendingEmail}
                  className="rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {isSendingEmail ? t("pages.newProform.sending") : t("pages.newProform.sendByEmail")}
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </form>
    </div>
  );
}
