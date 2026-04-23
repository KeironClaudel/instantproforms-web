import { apiClient } from "@/lib/api/apiClient";
import type { CreateShareLinkResponse, SendProformByEmailRequest } from "@/types/proformActions";

export async function downloadProformPdf(proformId: string): Promise<Blob> {
  const { data } = await apiClient.get(`/api/proforms/${proformId}/pdf`, {
    responseType: "blob",
  });

  return data;
}

export async function sendProformByEmail(
  request: SendProformByEmailRequest,
  csrfToken: string,
): Promise<void> {
  await apiClient.post("/api/proforms/send-email", request, {
    headers: {
      "X-CSRF-TOKEN": csrfToken,
    },
  });
}

export async function createProformShareLink(
  proformId: string,
  csrfToken: string,
): Promise<CreateShareLinkResponse> {
  const { data } = await apiClient.post<CreateShareLinkResponse>(
    "/api/proforms/share-links",
    { proformId },
    {
      headers: {
        "X-CSRF-TOKEN": csrfToken,
      },
    },
  );

  return data;
}