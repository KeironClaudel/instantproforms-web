import { useEffect, useState } from "react";
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

function formatDate(value: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function useProformDetailsPage() {
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

      const pdfBlob = await downloadProformPdf(proform.id);
      const pdfFile = new File([pdfBlob], `${proform.number}.pdf`, {
        type: pdfBlob.type || "application/pdf",
      });
      const sharedAsFile = await shareFile(pdfFile, {
        text: `Proform ${proform.number}`,
        title: `Proform ${proform.number}`,
      });

      if (sharedAsFile) {
        setFeedback(createSuccessFeedback("PDF share sheet opened successfully."));
        return;
      }

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

  async function handleSendToClientEmail() {
    if (!proform?.id) {
      setFeedback(createErrorFeedback("Proform identifier was not found."));
      return;
    }

    if (!proform.clientEmail) {
      setFeedback(createErrorFeedback("This proform does not have a client email address."));
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
      setFeedback(createSuccessFeedback(`Proform ${proform.number} was sent to ${proform.clientEmail}.`));
    } catch {
      setFeedback(createErrorFeedback("Failed to send the proform to the client email."));
    } finally {
      setIsSendingToClientEmail(false);
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
    issuedAtLabel: proform ? formatDate(proform.issuedAtUtc) : "",
    proform,
    selectedStatus,
    setSelectedStatus,
  };
}
