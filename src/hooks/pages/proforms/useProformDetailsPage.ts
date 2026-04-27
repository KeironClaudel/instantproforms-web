import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
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
import { shareFile, shareUrl } from "@/lib/utils/share";
import type { ProformDetails } from "@/types/proformHistory";

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

const editableStatuses = ["Draft", "Sent", "Accepted", "Rejected", "Cancelled"] as const;

function formatDate(value: string, locale: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function useProformDetailsPage() {
  const { i18n, t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { companySettings } = useAuth();

  const [proform, setProform] = useState<ProformDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSendingToClientEmail, setIsSendingToClientEmail] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("Draft");
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  useEffect(() => {
    async function loadDetails() {
      if (!id) {
        setFeedback(createErrorFeedback(t("pages.proformDetails.feedback.missingRouteId")));
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getProformById(id);
        setProform(data);
        setSelectedStatus(data.status);
      } catch {
        setFeedback(createErrorFeedback(t("pages.proformDetails.feedback.loadFailed")));
      } finally {
        setIsLoading(false);
      }
    }

    void loadDetails();
  }, [id, t]);

  async function handleDownloadPdf() {
    if (!proform?.id) {
      setFeedback(createErrorFeedback(t("pages.proformDetails.feedback.missingId")));
      return;
    }

    try {
      setIsDownloading(true);
      const blob = await downloadProformPdf(proform.id);
      downloadBlobFile(blob, `${proform.number}.pdf`);
      setFeedback(createSuccessFeedback(t("pages.proformDetails.feedback.downloadSuccess")));
    } catch {
      setFeedback(createErrorFeedback(t("pages.proformDetails.feedback.downloadFailed")));
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleShare() {
    if (!proform?.id) {
      setFeedback(createErrorFeedback(t("pages.proformDetails.feedback.missingId")));
      return;
    }

    try {
      setIsSharing(true);

      const pdfBlob = await downloadProformPdf(proform.id);
      const pdfFile = new File([pdfBlob], `${proform.number}.pdf`, {
        type: pdfBlob.type || "application/pdf",
      });
      const sharedAsFile = await shareFile(pdfFile, {
        text: `Proform ${proform.number}`,
        title: `Proform ${proform.number}`,
      });

      if (sharedAsFile) {
        setFeedback(createSuccessFeedback(t("pages.proformDetails.feedback.sharePdfSuccess")));
        return;
      }

      const response = await createProformShareLink(proform.id);
      const shared = await shareUrl(`Proform ${proform.number}`, response.shareUrl);

      if (!shared) {
        setFeedback(createErrorFeedback(t("pages.proformDetails.feedback.nativeShareUnavailable")));
        return;
      }

      setFeedback(createSuccessFeedback(t("pages.proformDetails.feedback.shareSuccess")));
    } catch {
      setFeedback(createErrorFeedback(t("pages.proformDetails.feedback.shareFailed")));
    } finally {
      setIsSharing(false);
    }
  }

  async function handleSendToClientEmail() {
    if (!proform?.id) {
      setFeedback(createErrorFeedback(t("pages.proformDetails.feedback.missingId")));
      return;
    }

    if (!proform.clientEmail) {
      setFeedback(createErrorFeedback(t("pages.proformDetails.feedback.missingClientEmail")));
      return;
    }

    try {
      setIsSendingToClientEmail(true);
      const response = await sendProformByEmail({
        message: null,
        proformId: proform.id,
        subject: `Proform ${proform.number}`,
        toEmail: proform.clientEmail,
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
      setFeedback(
        createSuccessFeedback(
          t("pages.proformDetails.feedback.sendSuccess", {
            email: proform.clientEmail,
            number: proform.number,
          }),
        ),
      );
    } catch {
      setFeedback(createErrorFeedback(t("pages.proformDetails.feedback.sendFailed")));
    } finally {
      setIsSendingToClientEmail(false);
    }
  }

  async function handleUpdateStatus() {
    if (!proform?.id) {
      setFeedback(createErrorFeedback(t("pages.proformDetails.feedback.missingId")));
      return;
    }

    if (selectedStatus === proform.status) {
      setFeedback(createErrorFeedback(t("pages.proformDetails.feedback.selectDifferentStatus")));
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
      setFeedback(createErrorFeedback(t("pages.proformDetails.feedback.updateStatusFailed")));
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return {
    companySettings,
    currencySymbol: companySettings?.currencySymbol ?? "₡",
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
    issuedAtLabel: proform
      ? formatDate(
          proform.issuedAtUtc,
          i18n.resolvedLanguage?.startsWith("es") ? "es-CR" : "en-US",
        )
      : "",
    proform,
    selectedStatus,
    setSelectedStatus,
  };
}
