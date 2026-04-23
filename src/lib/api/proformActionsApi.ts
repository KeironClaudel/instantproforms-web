import { apiClient } from "@/lib/api/apiClient";
import type { CreateShareLinkResponse, SendProformByEmailRequest } from "@/types/proformActions";

export async function downloadProformPdf(proformId: string): Promise<Blob> {
  const { data } = await apiClient.get(`/api/Proforms/${proformId}/pdf`, {
    responseType: "blob",
  });

  return data;
}

export async function sendProformByEmail(
  request: SendProformByEmailRequest,
  csrfToken: string,
): Promise<void> {
  await apiClient.post(
    `/api/Proforms/${request.proformId}/send-email`,
    {
      toEmail: request.toEmail,
      subject: request.subject,
      message: request.message,
    },
    {
      headers: {
        "X-CSRF-TOKEN": csrfToken,
      },
    },
  );
}

export async function createProformShareLink(
  proformId: string,
  csrfToken: string,
): Promise<CreateShareLinkResponse> {
  const { data } = await apiClient.post<CreateShareLinkResponse>(
    `/api/Proforms/${proformId}/share-link`,
    {},
    {
      headers: {
        "X-CSRF-TOKEN": csrfToken,
      },
    },
  );

  return data;
}