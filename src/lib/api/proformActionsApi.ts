import { apiClient } from "@/lib/api/apiClient";
import type {
  CreateShareLinkResponse,
  SendProformByEmailRequest,
  SendProformByEmailResponse,
  UpdateProformStatusRequest,
  UpdateProformStatusResponse,
} from "@/types/proformActions";

export async function downloadProformPdf(proformId: string): Promise<Blob> {
  const { data } = await apiClient.get(`/api/Proforms/${proformId}/pdf`, {
    responseType: "blob",
  });

  return data;
}

export async function sendProformByEmail(
  request: SendProformByEmailRequest,
): Promise<SendProformByEmailResponse> {
  const { data } = await apiClient.post<SendProformByEmailResponse>(`/api/Proforms/${request.proformId}/send-email`, {
    toEmail: request.toEmail,
    subject: request.subject,
    message: request.message,
  });

  return data;
}

export async function createProformShareLink(proformId: string): Promise<CreateShareLinkResponse> {
  const { data } = await apiClient.post<CreateShareLinkResponse>(`/api/Proforms/${proformId}/share-link`, {});

  return data;
}

export async function updateProformStatus(
  request: UpdateProformStatusRequest,
): Promise<UpdateProformStatusResponse> {
  const { data } = await apiClient.patch<UpdateProformStatusResponse>(
    `/api/Proforms/${request.proformId}/status`,
    {
      status: request.status,
    },
  );

  return data;
}
