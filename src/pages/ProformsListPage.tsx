import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/PageLoader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/app/providers/useAuth";
import { getProforms } from "@/lib/api/proformHistoryApi";
import { createErrorFeedback } from "@/lib/utils/feedback";
import type { ProformListItem } from "@/types/proformHistory";
import type { FeedbackState } from "@/lib/utils/feedback";

function formatDate(value: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function ProformsListPage() {
  const { companySettings } = useAuth();
  const [proforms, setProforms] = useState<ProformListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const currencySymbol = companySettings?.currencySymbol ?? "₡";

  useEffect(() => {
    async function loadProforms() {
      try {
        setIsLoading(true);
        const data = await getProforms();
        setProforms(data);
      } catch {
        setFeedback(createErrorFeedback("Failed to load proforms. Please try again later."));
      } finally {
        setIsLoading(false);
      }
    }

    void loadProforms();
  }, []);

  const sortedProforms = useMemo(
    () =>
      [...proforms].sort(
        (left, right) =>
          new Date(right.issuedAtUtc).getTime() - new Date(left.issuedAtUtc).getTime(),
      ),
    [proforms],
  );

  if (isLoading) {
    return <PageLoader message="Loading proforms..." />;
  }

  return (
    <div className="mx-auto max-w-6xl px-1 sm:px-0">
      <SectionHeader
        title="Proforms"
        description="Review previously created proforms, inspect details, and reopen delivery actions."
      />

      {feedback ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 shadow-sm">
          {feedback.message}
        </div>
      ) : null}

      {sortedProforms.length === 0 ? (
        <EmptyState
          title="No proforms yet"
          description="You have not created any proforms yet. Start your first one to see it listed here."
          action={
            <Link
              to="/app/proforms/new"
              className="inline-flex rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Create First Proform
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {sortedProforms.map((proform) => (
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

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {proform.status}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-slate-600">
                    Client: <span className="font-medium text-slate-800">{proform.clientName}</span>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span>{proform.clientEmail || "No email"}</span>
                    <span>{proform.clientPhone || "No phone"}</span>
                    <span>{formatDate(proform.issuedAtUtc)}</span>
                  </div>
                </div>

                <div className="grid min-w-[220px] gap-2 rounded-2xl bg-slate-50 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-800">
                      {currencySymbol}
                      {proform.subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      {companySettings?.taxLabel ?? "Tax"} ({proform.taxPercentage}%)
                    </span>
                    <span className="font-medium text-slate-800">
                      {currencySymbol}
                      {proform.taxAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-300 pt-2 text-base font-semibold text-slate-900">
                    <span>Total</span>
                    <span>
                      {currencySymbol}
                      {proform.total.toFixed(2)}
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