import { apiClient } from "@/lib/api/apiClient";
import type { ProformDetails, ProformListItem } from "@/types/proformHistory";

export async function getProforms(): Promise<ProformListItem[]> {
  const { data } = await apiClient.get<ProformListItem[]>("/api/Proforms");
  return data;
}

export async function getProformById(proformId: string): Promise<ProformDetails> {
  const { data } = await apiClient.get<ProformDetails>(`/api/Proforms/${proformId}`);
  return data;
}