import { calculateLineTotal } from "@/lib/utils/proformCalculations";
import { getProformStatusBadgeClassName } from "@/lib/utils/proformStatus";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useNewProformPage } from "@/hooks/pages/proforms/useNewProformPage";

export function NewProformPage() {
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
          Proform Workflow
        </div>

        <div className="mt-3">
          <SectionHeader
            title="New Proform"
            description="Create a professional proform with live totals, tenant tax settings, and quick delivery actions for mobile and desktop workflows."
          />
        </div>
      </div>

      <form className="space-y-6 sm:space-y-7" onSubmit={handleSubmit}>
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-900">
            Client Information
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Client Name</label>
              <input
                className={inputClassName}
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Client Email</label>
              <input
                type="email"
                className={inputClassName}
                value={clientEmail}
                onChange={(event) => setClientEmail(event.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Client Phone</label>
              <input
                className={inputClassName}
                value={clientPhone}
                onChange={(event) => setClientPhone(event.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Notes / Location</label>
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
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Items</h2>

            <button
              type="button"
              onClick={addItem}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-800">Item {index + 1}</div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-sm font-medium text-red-600 transition hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-6">
                    <label className="mb-1 block text-sm font-medium">Description</label>
                    <input
                      className={inputClassName}
                      value={item.description}
                      onChange={(event) => updateItem(item.id, "description", event.target.value)}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-1 block text-sm font-medium">Quantity</label>
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
                    <label className="mb-1 block text-sm font-medium">Unit Price</label>
                    <input
                      inputMode="decimal"
                      type="text"
                      className={inputClassName}
                      value={item.unitPrice}
                      onChange={(event) => updateItem(item.id, "unitPrice", event.target.value)}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-1 block text-sm font-medium">Line Total</label>
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
            Summary
          </h2>

          <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>
                {companySettings?.currencySymbol ?? "₡"}
                {subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>
                {companySettings?.taxLabel ?? "Tax"} ({taxPercentage}%)
              </span>
              <span>
                {companySettings?.currencySymbol ?? "₡"}
                {taxAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-300 pt-4 text-lg font-semibold text-slate-900">
              <span>Total</span>
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
          {isSubmitting ? "Creating proform..." : "Create Proform"}
        </button>

        {queuedNotice ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-800 shadow-sm">
            Proform for <span className="font-semibold">{queuedNotice.clientName}</span> is queued for
            sync. Queue ID: <span className="font-mono">{queuedNotice.queueId}</span>
          </div>
        ) : null}

        {!createdProform ? (
          <EmptyState
            title="No proform created yet"
            description="Complete the form above to generate a proform and unlock PDF download, share link, and email delivery actions."
          />
        ) : null}

        {createdProform ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-medium uppercase tracking-wide text-emerald-700">
                    Proform Created
                  </div>

                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                    {createdProform.number}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span
                      className={`rounded-full px-3 py-1 font-medium ${getProformStatusBadgeClassName(createdProform.status)}`}
                    >
                      Status: {createdProform.status}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-700">
                      Prefix: {companySettings?.proformPrefix ?? "-"}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-700">
                      Tax: {createdProform.taxPercentage}%
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Total</div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">
                    {companySettings?.currencySymbol ?? "₡"}
                    {createdProform.total.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                <div className="rounded-xl bg-white px-3 py-3">
                  <div className="text-slate-500">Subtotal</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {companySettings?.currencySymbol ?? "₡"}
                    {createdProform.subtotal.toFixed(2)}
                  </div>
                </div>

                <div className="rounded-xl bg-white px-3 py-3">
                  <div className="text-slate-500">
                    {companySettings?.taxLabel ?? "Tax"} ({createdProform.taxPercentage}%)
                  </div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {companySettings?.currencySymbol ?? "₡"}
                    {createdProform.taxAmount.toFixed(2)}
                  </div>
                </div>

                <div className="rounded-xl bg-white px-3 py-3">
                  <div className="text-slate-500">Final Total</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {companySettings?.currencySymbol ?? "₡"}
                    {createdProform.total.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                Proform Actions
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Download, share, or send the generated proform.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => void handleDownloadPdf()}
                disabled={isDownloading}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {isDownloading ? "Downloading..." : "Download PDF"}
              </button>

              <button
                type="button"
                onClick={() => void handleCreateShareLink()}
                disabled={isCreatingShareLink}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {isCreatingShareLink ? "Creating link..." : "Create Share Link"}
              </button>

              <button
                type="button"
                onClick={() => void handleNativeShare()}
                disabled={isSharing}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {isSharing ? "Sharing..." : "Share"}
              </button>

              <button
                type="button"
                onClick={resetCreatedProform}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Create Another Proform
              </button>
            </div>

            {shareUrlValue ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">Share URL</div>

                  <button
                    type="button"
                    onClick={() => void handleCopyShareLink()}
                    disabled={isCopyingShareLink}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    {isCopyingShareLink ? "Copying..." : "Copy Link"}
                  </button>
                </div>

                <div className="break-all text-sm text-slate-700">{shareUrlValue}</div>
              </div>
            ) : null}

            <div className="mt-6 border-t border-slate-200 pt-5">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Send by Email</h3>

              <div className="grid gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Recipient Email</label>
                  <input
                    type="email"
                    className={inputClassName}
                    value={emailTo}
                    onChange={(event) => setEmailTo(event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Subject</label>
                  <input
                    className={inputClassName}
                    value={emailSubject}
                    onChange={(event) => setEmailSubject(event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Message</label>
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
                  {isSendingEmail ? "Sending..." : "Send by Email"}
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </form>
    </div>
  );
}
