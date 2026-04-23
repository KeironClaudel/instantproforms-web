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

      setSuccessMessage(`Proform ${response.number} created successfully.`);

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
      </form>
    </div>
  );
}