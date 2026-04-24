import axios from "axios";
import { apiClient } from "@/lib/api/apiClient";
import { getCookieValue } from "@/lib/utils/cookies";
import { enqueueRequest } from "@/lib/offline/requestQueue";
import type { CreateProformRequest, CreateProformResult } from "@/types/proform";

type CreateProformQueueContext = {
  companyId: string;
  userId: string;
};

type CreateProformOptions = {
  queueContext?: CreateProformQueueContext;
};

function shouldQueueRequest(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return typeof navigator !== "undefined" && !navigator.onLine;
  }

  if (error.response) {
    return false;
  }

  return error.code === "ERR_NETWORK" || (typeof navigator !== "undefined" && !navigator.onLine);
}

function buildCreateProformUrl(): string {
  const baseUrl = apiClient.defaults.baseURL;

  if (!baseUrl) {
    throw new Error("API base URL is not configured for queued proform creation.");
  }

  if (baseUrl.startsWith("/")) {
    if (typeof window === "undefined") {
      throw new Error("Window origin is not available for queued proform creation.");
    }

    return new URL("/api/proforms", window.location.origin).toString();
  }

  return new URL("/api/proforms", baseUrl).toString();
}

export async function createProform(
  request: CreateProformRequest,
  options?: CreateProformOptions,
): Promise<CreateProformResult> {
  try {
    const { data } = await apiClient.post("/api/proforms", request);

    return {
      type: "created",
      response: data,
    };
  } catch (error) {
    if (!options?.queueContext || !shouldQueueRequest(error)) {
      throw error;
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const csrfToken = getCookieValue("XSRF-TOKEN");

    if (csrfToken) {
      headers["X-CSRF-TOKEN"] = csrfToken;
    }

    const queuedRequest = await enqueueRequest({
      kind: "create-proform",
      url: buildCreateProformUrl(),
      method: "POST",
      headers,
      body: JSON.stringify(request),
      companyId: options.queueContext.companyId,
      userId: options.queueContext.userId,
    });

    return {
      type: "queued",
      queueId: queuedRequest.id,
    };
  }
}
