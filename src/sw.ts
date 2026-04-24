/// <reference lib="WebWorker" />

import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst, NetworkOnly, StaleWhileRevalidate } from "workbox-strategies";
import { processQueue, PROFORM_QUEUE_SYNC_TAG } from "./lib/offline/requestQueue";

declare let self: ServiceWorkerGlobalScope;
type BackgroundSyncEvent = ExtendableEvent & { tag: string };

const apiOrigin = new URL(import.meta.env.VITE_API_BASE_URL).origin;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
clientsClaim();
self.skipWaiting();

registerRoute(
  ({ request, url }) =>
    request.method === "GET" &&
    url.origin === apiOrigin &&
    url.pathname === "/api/company-settings",
  new StaleWhileRevalidate({
    cacheName: "company-settings",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 1,
        maxAgeSeconds: 10 * 60,
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) => request.method === "GET" && url.origin === apiOrigin && url.pathname.startsWith("/api/"),
  new NetworkOnly(),
);

registerRoute(
  ({ request, url }) =>
    request.method === "POST" &&
    url.origin === apiOrigin &&
    url.pathname === "/api/proforms",
  new NetworkOnly(),
  "POST",
);

registerRoute(
  ({ request, url }) =>
    ["POST", "PUT", "PATCH", "DELETE"].includes(request.method) &&
    url.origin === apiOrigin &&
    url.pathname.startsWith("/api/"),
  new NetworkOnly(),
);

registerRoute(
  ({ request, url }) =>
    request.method === "GET" &&
    url.origin === self.location.origin &&
    (request.destination === "script" || request.destination === "style"),
  new StaleWhileRevalidate({
    cacheName: "static-shell-assets",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 48,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) =>
    request.method === "GET" &&
    url.origin === self.location.origin &&
    request.destination === "font",
  new CacheFirst({
    cacheName: "font-assets",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 12,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) =>
    request.method === "GET" &&
    request.destination === "image" &&
    (url.origin === self.location.origin || url.origin === apiOrigin),
  new CacheFirst({
    cacheName: "image-assets",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
);

const navigationHandler = createHandlerBoundToURL("index.html");

registerRoute(
  new NavigationRoute(navigationHandler, {
    denylist: [/^\/api\//],
  }),
);

async function notifyClientsQueueUpdated() {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of clients) {
    client.postMessage({ type: "REQUEST_QUEUE_UPDATED" });
  }
}

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await processQueue();
      await notifyClientsQueueUpdated();
    })(),
  );
});

self.addEventListener("sync", ((event: Event) => {
  const syncEvent = event as BackgroundSyncEvent;

  if (syncEvent.tag !== PROFORM_QUEUE_SYNC_TAG) {
    return;
  }

  syncEvent.waitUntil(
    (async () => {
      await processQueue();
      await notifyClientsQueueUpdated();
    })(),
  );
}) as EventListener);

self.addEventListener("message", (event) => {
  if ((event.data as { type?: string } | undefined)?.type !== "PROCESS_REQUEST_QUEUE") {
    return;
  }

  event.waitUntil(
    (async () => {
      await processQueue();
      await notifyClientsQueueUpdated();
    })(),
  );
});
