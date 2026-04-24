import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/PageLoader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/app/providers/useAuth";
import {
  createProformShareLink,
  downloadProformPdf,
  sendProformByEmail,
  updateProformStatus,
} from "@/lib/api/proformActionsApi";
import { getProformById } from "@/lib/api/proformHistoryApi";
import { downloadBlobFile } from "@/lib/utils/fileDownload";
import { createErrorFeedback, createSuccessFeedback } from "@/lib/utils/feedback";
import { getProformStatusBadgeClassName } from "@/lib/utils/proformStatus";
import { shareUrl } from "@/lib/utils/share";
import type { ProformDetails } from "@/types/proformHistory";

const editableStatuses = ["Draft", "Sent", "Accepted", "Rejected", "Cancelled"] as const;

function formatDate(value: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function ProformDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { companySettings } = useAuth();

  const [proform, setProform] = useState<ProformDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSendingToMyEmail, setIsSendingToMyEmail] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Draft");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const currencySymbol = companySettings?.currencySymbol ?? "₡";

  useEffect(() => {
    async function loadDetails() {
      if (!id) {
        setFeedback(createErrorFeedback("Proform identifier was not provided."));
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getProformById(id);
        setProform(data);
        setSelectedStatus(data.status);
      } catch {
        setFeedback(createErrorFeedback("Failed to load proform details."));
      } finally {
        setIsLoading(false);
      }
    }

    void loadDetails();
  }, [id]);

  async function handleDownloadPdf() {
    if (!proform?.id) {
      setFeedback(createErrorFeedback("Proform identifier was not found."));
      return;
    }

    try {
      setIsDownloading(true);
      const blob = await downloadProformPdf(proform.id);
      downloadBlobFile(blob, `${proform.number}.pdf`);
      setFeedback(createSuccessFeedback("PDF downloaded successfully."));
    } catch {
      setFeedback(createErrorFeedback("Failed to download the PDF."));
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleShare() {
    if (!proform?.id) {
      setFeedback(createErrorFeedback("Proform identifier was not found."));
      return;
    }

    try {
      setIsSharing(true);
      const response = await createProformShareLink(proform.id);
      const shared = await shareUrl(`Proform ${proform.number}`, response.shareUrl);

      if (!shared) {
        setFeedback(createErrorFeedback("Native share is not available on this device."));
        return;
      }

      setFeedback(createSuccessFeedback("Share sheet opened successfully."));
    } catch {
      setFeedback(createErrorFeedback("Failed to share the proform."));
    } finally {
      setIsSharing(false);
    }
  }

  async function handleSendToMyEmail() {
    if (!proform?.id) {
      setFeedback(createErrorFeedback("Proform identifier was not found."));
      return;
    }

    if (!proform.clientEmail) {
      setFeedback(createErrorFeedback("This proform does not have a client email address."));
      return;
    }

    try {
      setIsSendingToMyEmail(true);
      const response = await sendProformByEmail({
        proformId: proform.id,
        toEmail: proform.clientEmail,
        subject: `Proform ${proform.number}`,
        message: null,
      });

      setProform((current) =>
        current
          ? {
              ...current,
              status: response.status,
            }
          : current,
      );
      setSelectedStatus(response.status);
      setFeedback(createSuccessFeedback(`Proform ${proform.number} was sent to ${proform.clientEmail}.`));
    } catch {
      setFeedback(createErrorFeedback("Failed to send the proform to the client email."));
    } finally {
      setIsSendingToMyEmail(false);
    }
  }

  async function handleUpdateStatus() {
    if (!proform?.id) {
      setFeedback(createErrorFeedback("Proform identifier was not found."));
      return;
    }

    if (selectedStatus === proform.status) {
      setFeedback(createErrorFeedback("Select a different status before saving."));
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const response = await updateProformStatus({
        proformId: proform.id,
        status: selectedStatus,
      });

      setProform((current) =>
        current
          ? {
              ...current,
              status: response.status,
            }
          : current,
      );
      setSelectedStatus(response.status);
      setFeedback(createSuccessFeedback(response.message));
    } catch {
      setFeedback(createErrorFeedback("Failed to update the proform status."));
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  if (isLoading) {
    return <PageLoader message="Loading proform details..." />;
  }

  if (!proform) {
    return (
      <EmptyState
        title="Proform not found"
        description="The requested proform could not be loaded or does not exist."
        action={
          <Link
            to="/app/proforms"
            className="inline-flex rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Back to Proforms
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
          description={`Created on ${formatDate(proform.issuedAtUtc)} for ${proform.clientName}.`}
        />

        <div className="flex flex-wrap gap-3">
          <Link
            to="/app/proforms"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Back
          </Link>

          <button
            type="button"
            onClick={() => void handleDownloadPdf()}
            disabled={isDownloading}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isDownloading ? "Downloading..." : "Download PDF"}
          </button>

          <button
            type="button"
            onClick={() => void handleShare()}
            disabled={isSharing}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSharing ? "Sharing..." : "Share"}
          </button>

          <button
            type="button"
            onClick={() => void handleSendToMyEmail()}
            disabled={isSendingToMyEmail || !proform.clientEmail}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSendingToMyEmail ? "Sending..." : "Send to Client Email"}
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
              Client Information
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Client</div>
                <div className="mt-1 font-semibold text-slate-900">{proform.clientName}</div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Status</div>
                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getProformStatusBadgeClassName(proform.status)}`}
                  >
                    {proform.status}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Email</div>
                <div className="mt-1 font-semibold text-slate-900">
                  {proform.clientEmail || "Not provided"}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Phone</div>
                <div className="mt-1 font-semibold text-slate-900">
                  {proform.clientPhone || "Not provided"}
                </div>
              </div>
            </div>

            {proform.notes ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Notes</div>
                <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {proform.notes}
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-900">
              Update Status
            </h2>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div>
                <label className="mb-1 block text-sm font-medium">Status</label>
                <select
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  disabled={isUpdatingStatus}
                >
                  {editableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
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
                {isUpdatingStatus ? "Saving..." : "Save Status"}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-900">
              Items
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
                          Description
                        </div>
                        <div className="mt-1 font-medium text-slate-900">
                          {item.description}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          Quantity
                        </div>
                        <div className="mt-1 font-medium text-slate-900">{item.quantity}</div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          Unit Price
                        </div>
                        <div className="mt-1 font-medium text-slate-900">
                          {currencySymbol}
                          {item.unitPrice.toFixed(2)}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          Total
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
              Financial Summary
            </h2>

            <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-900">
                  {currencySymbol}
                  {proform.subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  {companySettings?.taxLabel ?? "Tax"} ({proform.taxPercentage}%)
                </span>
                <span className="font-medium text-slate-900">
                  {currencySymbol}
                  {proform.taxAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-300 pt-4 text-lg font-semibold text-slate-900">
                <span>Total</span>
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
