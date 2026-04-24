import { useEffect, useMemo, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useAuth } from "@/app/providers/useAuth";
import {
  getQueuedRequestCount,
  processQueue,
  REQUEST_QUEUE_UPDATED_EVENT,
  syncQueueSessionContext,
} from "@/lib/offline/requestQueue";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export function PwaManager() {
  const { user } = useAuth();
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [queuedCount, setQueuedCount] = useState(0);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) {
        return;
      }

      window.setInterval(() => {
        void registration.update();
      }, 60 * 60_000);
    },
  });

  async function refreshQueuedCount() {
    if (!user) {
      setQueuedCount(0);
      return;
    }

    const count = await getQueuedRequestCount({
      companyId: user.companyId,
      kind: "create-proform",
    });

    setQueuedCount(count);
  }

  async function handleQueueProcessing() {
    if (!user) {
      return;
    }

    try {
      setIsProcessingQueue(true);
      await processQueue({ force: true });
      await refreshQueuedCount();
    } finally {
      setIsProcessingQueue(false);
    }
  }

  async function handleInstall() {
    if (!deferredInstallPrompt) {
      return;
    }

    try {
      setIsInstalling(true);
      await deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
    } finally {
      setDeferredInstallPrompt(null);
      setIsInstalling(false);
    }
  }

  useEffect(() => {
    async function syncSessionContext() {
      if (!user) {
        await syncQueueSessionContext(null);
        setQueuedCount(0);
        return;
      }

      await syncQueueSessionContext({
        companyId: user.companyId,
        userId: user.userId,
        syncedAt: Date.now(),
      });

      await refreshQueuedCount();

      if (navigator.onLine) {
        await processQueue();
        await refreshQueuedCount();
      }
    }

    void syncSessionContext();
  }, [user]);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setDeferredInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    function handleOnline() {
      void handleQueueProcessing();
    }

    function handleQueueUpdated() {
      void refreshQueuedCount();
    }

    function handleServiceWorkerMessage(event: MessageEvent<{ type?: string }>) {
      if (event.data?.type !== "REQUEST_QUEUE_UPDATED") {
        return;
      }

      void refreshQueuedCount();
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener(REQUEST_QUEUE_UPDATED_EVENT, handleQueueUpdated);
    navigator.serviceWorker?.addEventListener("message", handleServiceWorkerMessage);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener(REQUEST_QUEUE_UPDATED_EVENT, handleQueueUpdated);
      navigator.serviceWorker?.removeEventListener("message", handleServiceWorkerMessage);
    };
  }, [user]);

  const hasVisibleState = useMemo(
    () => needRefresh || offlineReady || deferredInstallPrompt !== null || queuedCount > 0,
    [deferredInstallPrompt, needRefresh, offlineReady, queuedCount],
  );

  if (!hasVisibleState) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-end">
      <div className="pointer-events-auto w-full max-w-sm rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-3 text-sm text-slate-700">
          {needRefresh ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
              <div className="font-semibold text-sky-900">Update available</div>
              <p className="mt-1 text-sky-800">
                A newer version of InstantProforms is ready. Refresh to apply it safely.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => void updateServiceWorker(true)}
                  className="rounded-2xl bg-sky-600 px-3 py-2 font-medium text-white transition hover:bg-sky-700"
                >
                  Refresh App
                </button>
                <button
                  type="button"
                  onClick={() => setNeedRefresh(false)}
                  className="rounded-2xl border border-sky-200 bg-white px-3 py-2 font-medium text-sky-800 transition hover:bg-sky-100"
                >
                  Later
                </button>
              </div>
            </div>
          ) : null}

          {offlineReady ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="font-semibold text-emerald-900">Offline shell ready</div>
              <p className="mt-1 text-emerald-800">
                The UI can open offline now. Live API data will resume when your connection returns.
              </p>
              <button
                type="button"
                onClick={() => setOfflineReady(false)}
                className="mt-3 rounded-2xl border border-emerald-200 bg-white px-3 py-2 font-medium text-emerald-800 transition hover:bg-emerald-100"
              >
                Dismiss
              </button>
            </div>
          ) : null}

          {deferredInstallPrompt ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="font-semibold text-slate-900">Install InstantProforms</div>
              <p className="mt-1 text-slate-600">
                Add the app to your device for faster launch and standalone mode.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleInstall()}
                  disabled={isInstalling}
                  className="rounded-2xl bg-slate-900 px-3 py-2 font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {isInstalling ? "Preparing..." : "Install App"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeferredInstallPrompt(null)}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Not now
                </button>
              </div>
            </div>
          ) : null}

          {queuedCount > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="font-semibold text-amber-900">
                {queuedCount} queued {queuedCount === 1 ? "request" : "requests"}
              </div>
              <p className="mt-1 text-amber-800">
                Pending proform creations will retry automatically with exponential backoff.
              </p>
              <button
                type="button"
                onClick={() => void handleQueueProcessing()}
                disabled={isProcessingQueue}
                className="mt-3 rounded-2xl border border-amber-200 bg-white px-3 py-2 font-medium text-amber-900 transition hover:bg-amber-100 disabled:opacity-60"
              >
                {isProcessingQueue ? "Retrying..." : "Retry now"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
