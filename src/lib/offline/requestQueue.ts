import {
  clearQueueSessionContext,
  deleteQueueRecord,
  getAllQueueRecords,
  getQueueRecordByDedupeKey,
  getQueueSessionContext,
  putQueueRecord,
  setQueueSessionContext,
  type QueueSessionContext,
} from "@/lib/offline/requestQueueDb";

const BASE_RETRY_DELAY_MS = 30_000;
const MAX_RETRY_DELAY_MS = 15 * 60_000;
const MAX_RETRY_ATTEMPTS = 8;
const MAX_QUEUE_AGE_MS = 24 * 60 * 60_000;

export const REQUEST_QUEUE_UPDATED_EVENT = "request-queue:updated";
export const PROFORM_QUEUE_SYNC_TAG = "instantproforms:proform-create-sync";

export type QueuedRequestKind = "create-proform";

export type QueueRequestConfig = {
  kind: QueuedRequestKind;
  url: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: string | null;
  companyId: string;
  userId: string;
  dedupeKey?: string;
};

export type QueuedRequestRecord = {
  id: string;
  kind: QueuedRequestKind;
  url: string;
  method: QueueRequestConfig["method"];
  headers: Record<string, string>;
  body: string | null;
  companyId: string;
  userId: string;
  dedupeKey: string;
  attempts: number;
  createdAt: number;
  lastAttemptAt: number | null;
  nextAttemptAt: number;
  lastError: string | null;
};

export type ProcessQueueResult = {
  processed: number;
  succeeded: number;
  remaining: number;
};

type ProcessQueueOptions = {
  force?: boolean;
};

function notifyQueueUpdated() {
  if (!("window" in globalThis)) {
    return;
  }

  window.dispatchEvent(new Event(REQUEST_QUEUE_UPDATED_EVENT));
}

async function createDedupeKey(config: QueueRequestConfig): Promise<string> {
  const encoder = new TextEncoder();
  const payload = encoder.encode(
    [config.kind, config.companyId, config.userId, config.method, config.url, config.body ?? ""].join("::"),
  );
  const hashBuffer = await crypto.subtle.digest("SHA-256", payload);
  const bytes = new Uint8Array(hashBuffer);

  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

function buildRetryTimestamp(attempts: number, now: number): number {
  const delay = Math.min(BASE_RETRY_DELAY_MS * 2 ** Math.max(0, attempts - 1), MAX_RETRY_DELAY_MS);
  return now + delay;
}

function shouldDiscardRecord(record: QueuedRequestRecord, now: number): boolean {
  return record.attempts >= MAX_RETRY_ATTEMPTS || now - record.createdAt >= MAX_QUEUE_AGE_MS;
}

function shouldRetryStatus(status: number): boolean {
  return status === 401 || status === 403 || status === 408 || status === 429 || status >= 500;
}

async function registerBackgroundSync() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const registration = await Promise.race<
    ServiceWorkerRegistration | null
  >([
    navigator.serviceWorker.ready.catch(() => null),
    new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), 1_500);
    }),
  ]);

  if (!registration) {
    if (navigator.onLine) {
      await processQueue();
    }

    return;
  }

  const syncManager = (
    registration as ServiceWorkerRegistration & {
      sync?: {
        register: (tag: string) => Promise<void>;
      };
    }
  ).sync;

  if (syncManager) {
    await syncManager.register(PROFORM_QUEUE_SYNC_TAG);
    return;
  }

  if (navigator.onLine) {
    await processQueue();
  }
}

export async function enqueueRequest(
  requestConfig: QueueRequestConfig,
): Promise<QueuedRequestRecord> {
  const dedupeKey = requestConfig.dedupeKey ?? (await createDedupeKey(requestConfig));
  const existingRecord = await getQueueRecordByDedupeKey<QueuedRequestRecord>(dedupeKey);

  if (existingRecord) {
    return existingRecord;
  }

  const now = Date.now();
  const record: QueuedRequestRecord = {
    id: crypto.randomUUID(),
    kind: requestConfig.kind,
    url: requestConfig.url,
    method: requestConfig.method,
    headers: requestConfig.headers ?? {},
    body: requestConfig.body ?? null,
    companyId: requestConfig.companyId,
    userId: requestConfig.userId,
    dedupeKey,
    attempts: 0,
    createdAt: now,
    lastAttemptAt: null,
    nextAttemptAt: now,
    lastError: null,
  };

  await putQueueRecord(record);
  notifyQueueUpdated();

  if ("window" in globalThis) {
    await registerBackgroundSync();
  }

  return record;
}

export async function getQueuedRequestCount(filters?: {
  companyId?: string;
  kind?: QueuedRequestKind;
}): Promise<number> {
  const records = await getAllQueueRecords<QueuedRequestRecord>();

  return records.filter((record) => {
    if (filters?.companyId && record.companyId !== filters.companyId) {
      return false;
    }

    if (filters?.kind && record.kind !== filters.kind) {
      return false;
    }

    return true;
  }).length;
}

export async function processQueue(options?: ProcessQueueOptions): Promise<ProcessQueueResult> {
  const sessionContext = await getQueueSessionContext();
  const records = await getAllQueueRecords<QueuedRequestRecord>();
  const now = Date.now();

  if (!sessionContext) {
    return {
      processed: 0,
      succeeded: 0,
      remaining: records.length,
    };
  }

  const sortedRecords = [...records].sort((left, right) => left.createdAt - right.createdAt);
  let processed = 0;
  let succeeded = 0;

  for (const record of sortedRecords) {
    if (!options?.force && record.nextAttemptAt > now) {
      continue;
    }

    if (
      sessionContext &&
      (record.companyId !== sessionContext.companyId || record.userId !== sessionContext.userId)
    ) {
      continue;
    }

    processed += 1;

    try {
      const response = await fetch(record.url, {
        method: record.method,
        headers: record.headers,
        body: record.body,
        credentials: "include",
        mode: "cors",
        cache: "no-store",
      });

      if (response.ok) {
        succeeded += 1;
        await deleteQueueRecord(record.id);
        continue;
      }

      if (!shouldRetryStatus(response.status)) {
        await deleteQueueRecord(record.id);
        continue;
      }

      const attempts = record.attempts + 1;

      if (shouldDiscardRecord({ ...record, attempts }, now)) {
        await deleteQueueRecord(record.id);
        continue;
      }

      await putQueueRecord({
        ...record,
        attempts,
        lastAttemptAt: now,
        nextAttemptAt: buildRetryTimestamp(attempts, now),
        lastError: `HTTP ${response.status}`,
      });
    } catch (error) {
      const attempts = record.attempts + 1;

      if (shouldDiscardRecord({ ...record, attempts }, now)) {
        await deleteQueueRecord(record.id);
        continue;
      }

      await putQueueRecord({
        ...record,
        attempts,
        lastAttemptAt: now,
        nextAttemptAt: buildRetryTimestamp(attempts, now),
        lastError: error instanceof Error ? error.message : "Network request failed.",
      });
    }
  }

  notifyQueueUpdated();

  return {
    processed,
    succeeded,
    remaining: await getQueuedRequestCount(),
  };
}

export async function syncQueueSessionContext(
  sessionContext: QueueSessionContext | null,
): Promise<void> {
  if (!sessionContext) {
    await clearQueueSessionContext();
    return;
  }

  await setQueueSessionContext(sessionContext);
}
