const REQUEST_QUEUE_DB_NAME = "instantproforms-request-queue";
const REQUEST_QUEUE_DB_VERSION = 1;
const REQUEST_STORE_NAME = "requests";
const META_STORE_NAME = "meta";

type QueueMetaRecord<TValue> = {
  key: string;
  value: TValue;
};

export type QueueSessionContext = {
  companyId: string;
  userId: string;
  syncedAt: number;
};

type QueueDatabase = IDBDatabase;

function openDatabase(): Promise<QueueDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(REQUEST_QUEUE_DB_NAME, REQUEST_QUEUE_DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(REQUEST_STORE_NAME)) {
        const requestStore = database.createObjectStore(REQUEST_STORE_NAME, { keyPath: "id" });
        requestStore.createIndex("byDedupeKey", "dedupeKey", { unique: true });
        requestStore.createIndex("byCompanyId", "companyId", { unique: false });
        requestStore.createIndex("byKind", "kind", { unique: false });
      }

      if (!database.objectStoreNames.contains(META_STORE_NAME)) {
        database.createObjectStore(META_STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open request queue database."));
  });
}

function toPromise<TValue>(request: IDBRequest<TValue>): Promise<TValue> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

async function withStore<TValue>(
  storeName: typeof REQUEST_STORE_NAME | typeof META_STORE_NAME,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<TValue>,
): Promise<TValue> {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const result = await callback(store);

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed."));
      transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction aborted."));
    });

    return result;
  } finally {
    database.close();
  }
}

export async function getAllQueueRecords<TRecord>(): Promise<TRecord[]> {
  return withStore(REQUEST_STORE_NAME, "readonly", async (store) => {
    const records = await toPromise(store.getAll() as IDBRequest<TRecord[]>);
    return records;
  });
}

export async function getQueueRecordByDedupeKey<TRecord>(dedupeKey: string): Promise<TRecord | null> {
  return withStore(REQUEST_STORE_NAME, "readonly", async (store) => {
    const record = await toPromise(
      store.index("byDedupeKey").get(dedupeKey) as IDBRequest<TRecord | undefined>,
    );

    return record ?? null;
  });
}

export async function putQueueRecord<TRecord>(record: TRecord): Promise<void> {
  await withStore(REQUEST_STORE_NAME, "readwrite", async (store) => {
    await toPromise(store.put(record));
  });
}

export async function deleteQueueRecord(id: string): Promise<void> {
  await withStore(REQUEST_STORE_NAME, "readwrite", async (store) => {
    await toPromise(store.delete(id));
  });
}

export async function getQueueSessionContext(): Promise<QueueSessionContext | null> {
  return withStore(META_STORE_NAME, "readonly", async (store) => {
    const record = await toPromise(
      store.get("session-context") as IDBRequest<QueueMetaRecord<QueueSessionContext> | undefined>,
    );

    return record?.value ?? null;
  });
}

export async function setQueueSessionContext(context: QueueSessionContext): Promise<void> {
  await withStore(META_STORE_NAME, "readwrite", async (store) => {
    await toPromise(
      store.put({
        key: "session-context",
        value: context,
      } satisfies QueueMetaRecord<QueueSessionContext>),
    );
  });
}

export async function clearQueueSessionContext(): Promise<void> {
  await withStore(META_STORE_NAME, "readwrite", async (store) => {
    await toPromise(store.delete("session-context"));
  });
}
