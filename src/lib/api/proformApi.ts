import { apiClient } from "@/lib/api/apiClient";
import type { CreateProformRequest, CreateProformResponse } from "@/types/proform";

export async function createProform(
  request: CreateProformRequest,
  csrfToken: string,
): Promise<CreateProformResponse> {
  const { data } = await apiClient.post<CreateProformResponse>("/api/proforms", request, {
    headers: {
      "X-CSRF-TOKEN": csrfToken,
    },
  });

  return data;
}