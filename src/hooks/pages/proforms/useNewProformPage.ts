import { useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/app/providers/useAuth";
import { createProform } from "@/lib/api/proformApi";
import { createProformShareLink, downloadProformPdf, sendProformByEmail } from "@/lib/api/proformActionsApi";
import { copyTextToClipboard } from "@/lib/utils/clipboard";
import { downloadBlobFile } from "@/lib/utils/fileDownload";
import { createErrorFeedback, createSuccessFeedback } from "@/lib/utils/feedback";
import {
  calculateSubtotal,
  calculateTaxAmount,
  calculateTotal,
} from "@/lib/utils/proformCalculations";
import { shareFile, shareUrl } from "@/lib/utils/share";
import type { CreatedProformSummary } from "@/types/proformActions";
import type { ProformItemDraft } from "@/types/proform";

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

type QueueNotice = {
  queueId: string;
  clientName: string;
} | null;

function createEmptyItem(): ProformItemDraft {
  return {
    description: "",
    id: crypto.randomUUID(),
    quantity: "1",
    unitPrice: "",
  };
}

export function useNewProformPage() {
  const { companySettings, user } = useAuth();

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ProformItemDraft[]>([createEmptyItem()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
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
  const [queuedNotice, setQueuedNotice] = useState<QueueNotice>(null);

  const taxPercentage = companySettings?.taxPercentage ?? 0;
  const subtotal = useMemo(() => calculateSubtotal(items), [items]);
  const taxAmount = useMemo(() => calculateTaxAmount(subtotal, taxPercentage), [subtotal, taxPercentage]);
  const total = useMemo(() => calculateTotal(subtotal, taxAmount), [subtotal, taxAmount]);

  function clearFeedback() {
    setFeedback(null);
  }

  function updateItem(itemId: string, field: keyof Omit<ProformItemDraft, "id">, value: string) {
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

  function resetDraftForm() {
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setNotes("");
    setItems([createEmptyItem()]);
  }

  function resetCreatedProform() {
    setCreatedProform(null);
    setShareUrlValue(null);
    clearFeedback();
  }

  async function handleCopyShareLink() {
    clearFeedback();
    setQueuedNotice(null);

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

      const pdfBlob = await downloadProformPdf(createdProform.id);
      const pdfFile = new File([pdfBlob], `${createdProform.number}.pdf`, {
        type: pdfBlob.type || "application/pdf",
      });
      const sharedAsFile = await shareFile(pdfFile, {
        text: `Proform ${createdProform.number}`,
        title: `Proform ${createdProform.number}`,
      });

      if (sharedAsFile) {
        setFeedback(createSuccessFeedback("PDF share sheet opened successfully."));
        return;
      }

      let finalUrl = shareUrlValue;

      if (!finalUrl) {
        const response = await createProformShareLink(createdProform.id);
        finalUrl = response.shareUrl;
        setShareUrlValue(finalUrl);
      }

      const shared = await shareUrl(`Proform ${createdProform.number}`, finalUrl);

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
      const response = await sendProformByEmail({
        message: emailMessage.trim() || null,
        proformId: createdProform.id,
        subject: emailSubject.trim() || null,
        toEmail: emailTo.trim(),
      });

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    const hasInvalidNumbers = normalizedItems.some((item) => item.quantity <= 0 || item.unitPrice < 0);

    if (hasInvalidNumbers) {
      setFeedback(createErrorFeedback("Quantity must be greater than 0 and unit price cannot be negative."));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createProform(
        {
          clientEmail: clientEmail.trim() || null,
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim() || null,
          items: normalizedItems,
          notes: notes.trim() || null,
        },
        user
          ? {
              queueContext: {
                companyId: user.companyId,
                userId: user.userId,
              },
            }
          : undefined,
      );

      if (result.type === "queued") {
        setCreatedProform(null);
        setShareUrlValue(null);
        setQueuedNotice({
          clientName: clientName.trim(),
          queueId: result.queueId,
        });
        setFeedback(
          createSuccessFeedback(
            "No connection was available. The proform was queued and will retry automatically when the network returns.",
          ),
        );
        resetDraftForm();
        return;
      }

      const response = result.response;

      setFeedback(createSuccessFeedback(`Proform ${response.number} created successfully.`));
      setQueuedNotice(null);
      setCreatedProform({
        id: response.proformId,
        number: response.number,
        status: response.status,
        subtotal: response.subtotal,
        taxAmount: response.taxAmount,
        taxPercentage: response.taxPercentage,
        total: response.total,
      });
      setShareUrlValue(null);
      setEmailTo(clientEmail.trim());
      setEmailSubject(`Proform ${response.number}`);
      setEmailMessage("");
      resetDraftForm();
    } catch {
      setFeedback(createErrorFeedback("Failed to create the proform."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
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
  };
}
