import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/PageLoader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/app/providers/useAuth";
import { getProforms } from "@/lib/api/proformHistoryApi";
import { createErrorFeedback } from "@/lib/utils/feedback";
import { getProformStatusBadgeClassName } from "@/lib/utils/proformStatus";
import type { ProformListItem } from "@/types/proformHistory";
import type { FeedbackState } from "@/lib/utils/feedback";

const statusOptions = ["All", "Draft", "Sent", "Accepted", "Rejected", "Cancelled"] as const;

function formatDate(value: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat("es-CR", {
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

function toDateInputValue(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function ProformsListPage() {
  const { companySettings } = useAuth();
  const [proforms, setProforms] = useState<ProformListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [clientFilter, setClientFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("All");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");
  const deferredClientFilter = useDeferredValue(clientFilter);
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

  const filteredProforms = useMemo(() => {
    const normalizedClientFilter = deferredClientFilter.trim().toLowerCase();

    return [...proforms]
      .sort(
        (left, right) =>
          new Date(right.issuedAtUtc).getTime() - new Date(left.issuedAtUtc).getTime(),
      )
      .filter((proform) => {
        if (
          normalizedClientFilter.length > 0 &&
          !proform.clientName.toLowerCase().includes(normalizedClientFilter)
        ) {
          return false;
        }

        if (statusFilter !== "All" && (proform.status ?? "").toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }

        const issuedAt = new Date(proform.issuedAtUtc);

        if (fromDateFilter) {
          const fromDate = new Date(`${fromDateFilter}T00:00:00`);
          if (issuedAt < fromDate) {
            return false;
          }
        }

        if (toDateFilter) {
          const toDate = new Date(`${toDateFilter}T23:59:59.999`);
          if (issuedAt > toDate) {
            return false;
          }
        }

        return true;
      });
  }, [deferredClientFilter, fromDateFilter, proforms, statusFilter, toDateFilter]);

  const hasActiveFilters =
    clientFilter.trim().length > 0 ||
    statusFilter !== "All" ||
    fromDateFilter.length > 0 ||
    toDateFilter.length > 0;

  function clearFilters() {
    setClientFilter("");
    setStatusFilter("All");
    setFromDateFilter("");
    setToDateFilter("");
  }

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

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Filter Proforms</h2>
              <p className="text-sm text-slate-500">
                Narrow the list by client, status, or issue date.
              </p>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear Filters
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="xl:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Client Name</label>
              <input
                type="text"
                value={clientFilter}
                onChange={(event) => setClientFilter(event.target.value)}
                placeholder="Search by client name..."
                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as (typeof statusOptions)[number])
                }
                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2 xl:col-span-1">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">From</label>
                <input
                  type="date"
                  value={fromDateFilter}
                  max={toDateFilter || undefined}
                  onChange={(event) => setFromDateFilter(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">To</label>
                <input
                  type="date"
                  value={toDateFilter}
                  min={fromDateFilter || undefined}
                  max={toDateInputValue(new Date())}
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
      ) : filteredProforms.length === 0 ? (
        <EmptyState
          title="No matches found"
          description="Try adjusting the client, status, or date filters to broaden the results."
          action={
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Reset Filters
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
                      {formatMoney(proform.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      {companySettings?.taxLabel ?? "Tax"} ({formatPercent(proform.taxPercentage)})
                    </span>
                    <span className="font-medium text-slate-800">
                      {currencySymbol}
                      {formatMoney(proform.taxAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-300 pt-2 text-base font-semibold text-slate-900">
                    <span>Total</span>
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
