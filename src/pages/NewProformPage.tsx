import { useMemo, useState } from "react";
import { createProform } from "@/lib/api/proformApi";
import {
  calculateLineTotal,
  calculateSubtotal,
  calculateTaxAmount,
  calculateTotal,
} from "@/lib/utils/proformCalculations";
import { useAuth } from "@/app/providers/useAuth";
import type { ProformItemDraft } from "@/types/proform";
import { downloadProformPdf, createProformShareLink, sendProformByEmail } from "@/lib/api/proformActionsApi";
import { downloadBlobFile } from "@/lib/utils/fileDownload";
import { shareUrl } from "@/lib/utils/share";
import type { CreatedProformSummary } from "@/types/proformActions";
import { copyTextToClipboard } from "@/lib/utils/clipboard";
import { createErrorFeedback, createSuccessFeedback } from "@/lib/utils/feedback";
import { getProformStatusBadgeClassName } from "@/lib/utils/proformStatus";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";

function createEmptyItem(): ProformItemDraft {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: "1",
    unitPrice: "",
  };
}

export function NewProformPage() {
  const { companySettings } = useAuth();

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ProformItemDraft[]>([createEmptyItem()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const taxPercentage = companySettings?.taxPercentage ?? 0;

  const subtotal = useMemo(() => calculateSubtotal(items), [items]);
  const taxAmount = useMemo(
    () => calculateTaxAmount(subtotal, taxPercentage),
    [subtotal, taxPercentage],
  );
  const total = useMemo(() => calculateTotal(subtotal, taxAmount), [subtotal, taxAmount]);

  const [createdProform, setCreatedProform] = useState<CreatedProformSummary | null>(null);
  const [shareUrlValue, setShareUrlValue] = useState<string | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isCreatingShareLink, setIsCreatingShareLink] = useState(false);
  const [isCopyingShareLink, setIsCopyingShareLink] = useState(false);

  const inputClassName =
  "w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200";

const textareaClassName =
  "min-h-28 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200";

  function updateItem(
  itemId: string,
  field: keyof Omit<ProformItemDraft, "id">,
  value: string,
) {
  setItems((current) =>
    current.map((item) =>
      item.id === itemId
        ? {
            ...item,
            [field]: value,
          }
        : item,
    ),
  );
}

  function addItem() {
    setItems((current) => [...current, createEmptyItem()]);
  }

  function removeItem(itemId: string) {
    setItems((current) => (current.length === 1 ? current : current.filter((item) => item.id !== itemId)));
  }

  function clearFeedback() {
    setFeedback(null);
  }

  async function handleCopyShareLink() {
    clearFeedback();
    if (!shareUrlValue) {
    setFeedback(createErrorFeedback("There is no share link to copy yet."));
    return;
  }

  try {
    setIsCopyingShareLink(true);

    const copied = await copyTextToClipboard(shareUrlValue);

    if (!copied) {
      setFeedback(createErrorFeedback("Failed to copy the share link."));
      return;
    }

    setFeedback(createSuccessFeedback("Share link copied to clipboard."));
  } catch {
    setFeedback(createErrorFeedback("Failed to copy the share link."));
  } finally {
    setIsCopyingShareLink(false);
  }
  }

  async function handleDownloadPdf() {
    clearFeedback();
    if (!createdProform?.id) {
      setFeedback(createErrorFeedback("The created proform identifier was not found."));
      return;
    }

    setIsDownloading(true);

    try {
      const blob = await downloadProformPdf(createdProform.id);
      downloadBlobFile(blob, `${createdProform.number}.pdf`);
      setFeedback(createSuccessFeedback("PDF downloaded successfully."));
    } catch {
      setFeedback(createErrorFeedback("Failed to download the PDF."));
    } finally {
      setIsDownloading(false);
    }
  }

async function handleCreateShareLink() {
  clearFeedback();
  if (!createdProform?.id) {
  setFeedback(createErrorFeedback("The created proform identifier was not found."));
  return;
  }

  setIsCreatingShareLink(true);

  try {
    const response = await createProformShareLink(createdProform.id);
    setShareUrlValue(response.shareUrl);
    setFeedback(createSuccessFeedback("Share link created successfully."));
  } catch {
    setFeedback(createErrorFeedback("Failed to create the share link."));
  } finally {
    setIsCreatingShareLink(false);
  }
}

async function handleNativeShare() {
  clearFeedback();
  if (!createdProform?.id) {
  setFeedback(createErrorFeedback("The created proform identifier was not found."));
  return;
  }

  try {
    setIsSharing(true);

    let finalUrl = shareUrlValue;

    if (!finalUrl) {
      const response = await createProformShareLink(createdProform.id);
      finalUrl = response.shareUrl;
      setShareUrlValue(finalUrl);
    }

    const shared = await shareUrl(`Proform ${createdProform.number}`, finalUrl);
    setFeedback(createSuccessFeedback("Share sheet opened successfully."));

    if (!shared) {
      setFeedback(createErrorFeedback("Native share is not available on this device."));
      return;
    }
  } catch {
  setFeedback(createErrorFeedback("Failed to share the proform."));
} finally {
    setIsSharing(false);
  }
}

async function handleSendByEmail() {
  clearFeedback();
  if (!createdProform?.id) {
  setFeedback(createErrorFeedback("The created proform identifier was not found."));
  return;
}

  if (!emailTo.trim()) {
    setFeedback(createErrorFeedback("Recipient email is required."));
    return;
  }

  setIsSendingEmail(true);

  try {
    const response = await sendProformByEmail(
      {
        proformId: createdProform.id,
        toEmail: emailTo.trim(),
        subject: emailSubject.trim() || null,
        message: emailMessage.trim() || null,
      },
    );

    setCreatedProform((current) =>
      current
        ? {
            ...current,
            status: response.status,
          }
        : current,
    );
    setFeedback(createSuccessFeedback(`Proform ${createdProform.number} was sent successfully.`));
  } catch {
    setFeedback(createErrorFeedback("Failed to send the proform by email."));
  } finally {
    setIsSendingEmail(false);
  }
}

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    clearFeedback();

    const normalizedItems = items
                              .map((item) => ({
                                description: item.description.trim(),
                                quantity: Number(item.quantity.trim()),
                                unitPrice: Number(item.unitPrice.trim()),
                              }))
                              .filter(
                                (item) =>
                                  item.description.length > 0 &&
                                  Number.isFinite(item.quantity) &&
                                  Number.isFinite(item.unitPrice),
                              );

    if (clientName.trim().length === 0) {
      setFeedback(createErrorFeedback("Client name is required."));
      return;
    }

    if (normalizedItems.length === 0) {
      setFeedback(createErrorFeedback("At least one item is required."));
      return;
    }

    const hasInvalidNumbers = normalizedItems.some(
                                              (item) => item.quantity <= 0 || item.unitPrice < 0,
                                            );

    if (hasInvalidNumbers) {
      setFeedback(createErrorFeedback("Quantity must be greater than 0 and unit price cannot be negative."));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createProform(
        {
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim() || null,
          clientPhone: clientPhone.trim() || null,
          notes: notes.trim() || null,
          items: normalizedItems,
        },
      );

      console.log("Create proform response:", response);

      setFeedback(createSuccessFeedback(`Proform ${response.number} created successfully.`));
      setCreatedProform({
        id: response.proformId,
        number: response.number,
        status: response.status,
        subtotal: response.subtotal,
        taxPercentage: response.taxPercentage,
        taxAmount: response.taxAmount,
        total: response.total,
      });
      setShareUrlValue(null);
      setEmailTo(clientEmail.trim());
      setEmailSubject(`Proform ${response.number}`);
      setEmailMessage("");
      setClientName("");
      setClientEmail("");
      setClientPhone("");
      setNotes("");
      setItems([createEmptyItem()]);
    } catch {
      setFeedback(createErrorFeedback("Failed to create the proform."));
    } finally {
      setIsSubmitting(false);
    }
  }

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
                onClick={() => {
                  setCreatedProform(null);
                  setShareUrlValue(null);
                  clearFeedback();
                }}
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
