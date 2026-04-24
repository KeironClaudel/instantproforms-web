import { apiClient } from "@/lib/api/apiClient";
import type { ProformDetails, ProformListItem } from "@/types/proformHistory";

type PagedResult<T> = {
  items: T[];
  page?: number;
  pageSize?: number;
  totalCount?: number;
};

export async function getProforms(): Promise<ProformListItem[]> {
  const { data } = await apiClient.get<ProformListItem[] | PagedResult<ProformListItem>>(
    "/api/Proforms",
  );

  if (Array.isArray(data)) {
    return data;
  }

  return data.items;
}

export async function getProformById(proformId: string): Promise<ProformDetails> {
  const { data } = await apiClient.get<ProformDetails>(`/api/Proforms/${proformId}`);
  return data;
}