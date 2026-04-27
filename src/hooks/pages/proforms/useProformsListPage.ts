import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/providers/useAuth";
import { getProforms } from "@/lib/api/proformHistoryApi";
import { createErrorFeedback, type FeedbackState } from "@/lib/utils/feedback";
import type { ProformListItem } from "@/types/proformHistory";

const statusOptions = ["All", "Draft", "Sent", "Accepted", "Rejected", "Cancelled"] as const;

function toDateInputValue(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function useProformsListPage() {
  const { t } = useTranslation();
  const { companySettings } = useAuth();
  const [proforms, setProforms] = useState<ProformListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [clientFilter, setClientFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("All");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");

  const deferredClientFilter = useDeferredValue(clientFilter);

  useEffect(() => {
    async function loadProforms() {
      try {
        setIsLoading(true);
        const data = await getProforms();
        setProforms(data);
      } catch {
        setFeedback(createErrorFeedback(t("pages.proformsList.issueLoadFailed")));
      } finally {
        setIsLoading(false);
      }
    }

    void loadProforms();
  }, [t]);

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

  return {
    clearFilters,
    clientFilter,
    companySettings,
    currencySymbol: companySettings?.currencySymbol ?? "₡",
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
    todayDateValue: toDateInputValue(new Date()),
  };
}
