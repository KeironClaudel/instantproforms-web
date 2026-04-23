import { useMemo, useState } from "react";
import { createProform } from "@/lib/api/proformApi";
import { getCookieValue } from "@/lib/utils/cookies";
import {
  calculateLineTotal,
  calculateSubtotal,
  calculateTaxAmount,
  calculateTotal,
} from "@/lib/utils/proformCalculations";
import { useAuth } from "@/app/providers/AuthProvider";
import type { ProformItemDraft } from "@/types/proform";
import { downloadProformPdf, createProformShareLink, sendProformByEmail } from "@/lib/api/proformActionsApi";
import { downloadBlobFile } from "@/lib/utils/fileDownload";
import { shareUrl } from "@/lib/utils/share";
import type { CreatedProformSummary } from "@/types/proformActions";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  async function handleDownloadPdf() {
  if (!createdProform?.id) {
    setErrorMessage("The created proform identifier was not found.");
    return;
  }

  setIsDownloading(true);

  try {
    const blob = await downloadProformPdf(createdProform.id);
    downloadBlobFile(blob, `${createdProform.number}.pdf`);
  } catch {
    setErrorMessage("Failed to download the PDF.");
  } finally {
    setIsDownloading(false);
  }
}

async function handleCreateShareLink() {
  if (!createdProform?.id) {
    setErrorMessage("The created proform identifier was not found.");
    return;
  }

  const csrfToken = getCookieValue("XSRF-TOKEN");

  if (!csrfToken) {
    setErrorMessage("CSRF token was not found. Please log in again.");
    return;
  }

  setIsCreatingShareLink(true);

  try {
    const response = await createProformShareLink(createdProform.id, csrfToken);
    setShareUrlValue(response.shareUrl);
  } catch {
    setErrorMessage("Failed to create the share link.");
  } finally {
    setIsCreatingShareLink(false);
  }
}

async function handleNativeShare() {
  if (!createdProform?.id) {
    setErrorMessage("The created proform identifier was not found.");
    return;
  }

  try {
    setIsSharing(true);

    let finalUrl = shareUrlValue;

    if (!finalUrl) {
      const csrfToken = getCookieValue("XSRF-TOKEN");

      if (!csrfToken) {
        setErrorMessage("CSRF token was not found. Please log in again.");
        return;
      }

      const response = await createProformShareLink(createdProform.id, csrfToken);
      finalUrl = response.shareUrl;
      setShareUrlValue(finalUrl);
    }

    const shared = await shareUrl(`Proform ${createdProform.number}`, finalUrl);

    if (!shared) {
      setErrorMessage("Native share is not available on this device.");
    }
  } catch {
    setErrorMessage("Failed to share the proform.");
  } finally {
    setIsSharing(false);
  }
}

async function handleSendByEmail() {
  if (!createdProform?.id) {
    setErrorMessage("The created proform identifier was not found.");
    return;
  }

  const csrfToken = getCookieValue("XSRF-TOKEN");

  if (!csrfToken) {
    setErrorMessage("CSRF token was not found. Please log in again.");
    return;
  }

  if (!emailTo.trim()) {
    setErrorMessage("Recipient email is required.");
    return;
  }

  setIsSendingEmail(true);

  try {
    await sendProformByEmail(
      {
        proformId: createdProform.id,
        toEmail: emailTo.trim(),
        subject: emailSubject.trim() || null,
        message: emailMessage.trim() || null,
      },
      csrfToken,
    );

    setSuccessMessage(`Proform ${createdProform.number} was sent successfully.`);
  } catch {
    setErrorMessage("Failed to send the proform by email.");
  } finally {
    setIsSendingEmail(false);
  }
}

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);

    const csrfToken = getCookieValue("XSRF-TOKEN");

    if (!csrfToken) {
      setErrorMessage("CSRF token was not found. Please log in again.");
      return;
    }

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
      setErrorMessage("Client name is required.");
      return;
    }

    if (normalizedItems.length === 0) {
      setErrorMessage("At least one item is required.");
      return;
    }

    const hasInvalidNumbers = normalizedItems.some(
                                              (item) => item.quantity <= 0 || item.unitPrice < 0,
                                            );

    if (hasInvalidNumbers) {
      setErrorMessage("Quantity must be greater than 0 and unit price cannot be negative.");
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
        csrfToken,
      );

      console.log("Create proform response:", response);

      setSuccessMessage(`Proform ${response.number} created successfully.`);
      setCreatedProform({
        id: response.proformId,
        number: response.number,
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
      setErrorMessage("Failed to create the proform.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">New Proform</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create a professional proform with live totals and company tax settings.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Client Information</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Client Name</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Client Email</label>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                value={clientEmail}
                onChange={(event) => setClientEmail(event.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Client Phone</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                value={clientPhone}
                onChange={(event) => setClientPhone(event.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Notes / Location</label>
              <textarea
                className="min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Items</h2>

            <button
              type="button"
              onClick={addItem}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-700">Item {index + 1}</div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-sm text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-12">
                  <div className="md:col-span-6">
                    <label className="mb-1 block text-sm font-medium">Description</label>
                    <input
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                      value={item.description}
                      onChange={(event) => updateItem(item.id, "description", event.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium">Quantity</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                      value={item.quantity}
                      onChange={(event) => updateItem(item.id, "quantity", event.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium">Unit Price</label>
                    <input
                      inputMode="decimal"
                      type="text"
                      min="0"
                      step="0.01"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                      value={item.unitPrice}
                      onChange={(event) => updateItem(item.id, "unitPrice", event.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium">Line Total</label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                      {companySettings?.currencySymbol ?? "₡"}
                      {calculateLineTotal(item.quantity, item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Summary</h2>

          <div className="space-y-3 text-sm">
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

            <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
              <span>Total</span>
              <span>
                {companySettings?.currencySymbol ?? "₡"}
                {total.toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating proform..." : "Create Proform"}
        </button>

        {createdProform ? (
          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Proform Actions</h2>
              <p className="mt-1 text-sm text-slate-600">
                {createdProform.number} · {companySettings?.currencySymbol ?? "₡"}
                {createdProform.total.toFixed(2)}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => void handleDownloadPdf()}
                disabled={isDownloading}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium"
              >
                {isDownloading ? "Downloading..." : "Download PDF"}
              </button>

              <button
                type="button"
                onClick={() => void handleCreateShareLink()}
                disabled={isCreatingShareLink}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium"
              >
                {isCreatingShareLink ? "Creating link..." : "Create Share Link"}
              </button>

              <button
                type="button"
                onClick={() => void handleNativeShare()}
                disabled={isSharing}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium"
              >
                {isSharing ? "Sharing..." : "Share"}
              </button>
            </div>

            {shareUrlValue ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 text-sm font-medium">Share URL</div>
                <div className="break-all text-sm text-slate-700">{shareUrlValue}</div>
              </div>
            ) : null}

            <div className="mt-6 border-t pt-4">
              <h3 className="mb-3 text-base font-semibold">Send by Email</h3>

              <div className="grid gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Recipient Email</label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                    value={emailTo}
                    onChange={(event) => setEmailTo(event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Subject</label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                    value={emailSubject}
                    onChange={(event) => setEmailSubject(event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Message</label>
                  <textarea
                    className="min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2"
                    value={emailMessage}
                    onChange={(event) => setEmailMessage(event.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void handleSendByEmail()}
                  disabled={isSendingEmail}
                  className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
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