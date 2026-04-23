import axios, { AxiosError } from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

declare module "axios" {
  interface AxiosRequestConfig {
    _retry?: boolean;
    skipAuthRefresh?: boolean;
  }
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-CSRF-TOKEN",
});

let refreshRequest: Promise<void> | null = null;

function shouldSkipRefresh(url?: string) {
  return url === "/api/auth/login" || url === "/api/auth/logout" || url === "/api/auth/refresh";
}

function notifySessionExpired() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("auth:session-expired"));
}

async function refreshSession() {
  if (!refreshRequest) {
    refreshRequest = apiClient
      .post("/api/auth/refresh", undefined, { skipAuthRefresh: true })
      .then(() => undefined)
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config;

    if (
      !config ||
      config._retry ||
      config.skipAuthRefresh ||
      shouldSkipRefresh(config.url) ||
      error.response?.status !== 401
    ) {
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      await refreshSession();
      return apiClient(config);
    } catch {
      notifySessionExpired();
      return Promise.reject(error);
    }
  },
);
