export type EntitySet =
  | "home_next_trip"
  | "bookings"
  | "trips"
  | "trip_detail"
  | "trip_milestones"
  | "trip_resources"
  | "trip_readiness"
  | "trip_updates"
  | "trip_daily_program"
  | "documents"
  | "notification_preferences"
  | "devices"
  | "feedback"
  | "feedback_draft";

export interface SyncMetadata {
  entitySet: EntitySet;
  lastSuccessfulSync: string | null;
  stale: boolean;
  hardFailure: boolean;
  lastError: string | null;
  lastKnownGoodPayload: string | null;
  updatedAt: string | null;
}

export interface CachedResult<T> {
  data: T;
  source: "network" | "cache" | "empty";
  syncMetadata: SyncMetadata;
  error: string | null;
}

interface CachedRecord {
  payload: string;
  updatedAt: string | null;
}

interface FileCacheRecord {
  resource_id: string;
  remote_url: string;
  local_uri: string;
  downloaded_at: string;
  updated_at: string | null;
}

interface ReadModelState {
  cachedRecords: Partial<Record<EntitySet, Record<string, CachedRecord>>>;
  syncState: Partial<Record<EntitySet, SyncMetadata>>;
  fileCache: Record<string, FileCacheRecord>;
}

const STORAGE_KEY = "alhilal-support-web-cache:v1";

let memoryState: ReadModelState = {
  cachedRecords: {},
  syncState: {},
  fileCache: {},
};

function nowIso() {
  return new Date().toISOString();
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown sync error";
}

function hasWindowStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function loadState(): ReadModelState {
  if (!hasWindowStorage()) {
    return memoryState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return memoryState;
    }

    const parsed = JSON.parse(raw) as ReadModelState;
    memoryState = {
      cachedRecords: parsed.cachedRecords ?? {},
      syncState: parsed.syncState ?? {},
      fileCache: parsed.fileCache ?? {},
    };
    return memoryState;
  } catch {
    return memoryState;
  }
}

function persistState(state: ReadModelState) {
  memoryState = state;

  if (!hasWindowStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateState(updater: (current: ReadModelState) => ReadModelState) {
  const next = updater(loadState());
  persistState(next);
  return next;
}

function toSyncMetadata(entitySet: EntitySet, row?: Partial<SyncMetadata> | null): SyncMetadata {
  return {
    entitySet,
    lastSuccessfulSync: row?.lastSuccessfulSync ?? null,
    stale: Boolean(row?.stale),
    hardFailure: Boolean(row?.hardFailure),
    lastError: row?.lastError ?? null,
    lastKnownGoodPayload: row?.lastKnownGoodPayload ?? null,
    updatedAt: row?.updatedAt ?? null,
  };
}

async function getSyncMetadata(entitySet: EntitySet): Promise<SyncMetadata> {
  const state = loadState();
  return toSyncMetadata(entitySet, state.syncState[entitySet]);
}

async function upsertSyncState(entitySet: EntitySet, updates: Partial<SyncMetadata>) {
  updateState((current) => {
    const existing = toSyncMetadata(entitySet, current.syncState[entitySet]);
    return {
      ...current,
      syncState: {
        ...current.syncState,
        [entitySet]: {
          ...existing,
          ...updates,
          entitySet,
          updatedAt: updates.updatedAt ?? nowIso(),
        },
      },
    };
  });
}

export async function readCollection<T>(entitySet: EntitySet): Promise<T[]> {
  const records = loadState().cachedRecords[entitySet] ?? {};
  return Object.entries(records)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, record]) => JSON.parse(record.payload) as T);
}

export async function readSingleton<T>(entitySet: EntitySet, cacheKey = "default"): Promise<T | null> {
  const record = loadState().cachedRecords[entitySet]?.[cacheKey];
  return record ? (JSON.parse(record.payload) as T) : null;
}

export async function replaceCollection<T extends { id?: string }>(entitySet: EntitySet, items: T[]) {
  const syncedAt = nowIso();
  const nextRecords: Record<string, CachedRecord> = {};

  items.forEach((item, index) => {
    const cacheKey = item.id || `${entitySet}-${index}`;
    const updatedAt = (item as { updated_at?: string; updatedAt?: string }).updated_at
      || (item as { updated_at?: string; updatedAt?: string }).updatedAt
      || syncedAt;

    nextRecords[cacheKey] = {
      payload: JSON.stringify(item),
      updatedAt,
    };
  });

  updateState((current) => ({
    ...current,
    cachedRecords: {
      ...current.cachedRecords,
      [entitySet]: nextRecords,
    },
  }));

  await upsertSyncState(entitySet, {
    lastSuccessfulSync: syncedAt,
    stale: false,
    hardFailure: false,
    lastError: null,
    lastKnownGoodPayload: JSON.stringify(items),
    updatedAt: syncedAt,
  });
}

export async function saveSingleton<T>(entitySet: EntitySet, payload: T, cacheKey = "default") {
  const syncedAt = nowIso();
  const updatedAt = (payload as { updated_at?: string; updatedAt?: string }).updated_at
    || (payload as { updated_at?: string; updatedAt?: string }).updatedAt
    || syncedAt;

  updateState((current) => ({
    ...current,
    cachedRecords: {
      ...current.cachedRecords,
      [entitySet]: {
        ...(current.cachedRecords[entitySet] ?? {}),
        [cacheKey]: {
          payload: JSON.stringify(payload),
          updatedAt,
        },
      },
    },
  }));

  await upsertSyncState(entitySet, {
    lastSuccessfulSync: syncedAt,
    stale: false,
    hardFailure: false,
    lastError: null,
    lastKnownGoodPayload: JSON.stringify(payload),
    updatedAt: syncedAt,
  });
}

export async function markSyncFailure(entitySet: EntitySet, error: unknown) {
  const current = await getSyncMetadata(entitySet);
  const nextUpdatedAt = nowIso();

  await upsertSyncState(entitySet, {
    stale: current.lastSuccessfulSync !== null,
    hardFailure: current.lastSuccessfulSync === null,
    lastError: getErrorMessage(error),
    updatedAt: nextUpdatedAt,
  });
}

export async function syncCollection<T extends { id?: string }>(
  entitySet: EntitySet,
  fetcher: () => Promise<T[]>
): Promise<CachedResult<T[]>> {
  try {
    const data = await fetcher();
    await replaceCollection(entitySet, data);
    return {
      data,
      source: "network",
      syncMetadata: await getSyncMetadata(entitySet),
      error: null,
    };
  } catch (error) {
    await markSyncFailure(entitySet, error);
    const cached = await readCollection<T>(entitySet);
    return {
      data: cached,
      source: cached.length ? "cache" : "empty",
      syncMetadata: await getSyncMetadata(entitySet),
      error: getErrorMessage(error),
    };
  }
}

export async function syncSingleton<T>(
  entitySet: EntitySet,
  fetcher: () => Promise<T>,
  cacheKey = "default"
): Promise<CachedResult<T | null>> {
  try {
    const data = await fetcher();
    await saveSingleton(entitySet, data, cacheKey);
    return {
      data,
      source: "network",
      syncMetadata: await getSyncMetadata(entitySet),
      error: null,
    };
  } catch (error) {
    await markSyncFailure(entitySet, error);
    const cached = await readSingleton<T>(entitySet, cacheKey);
    return {
      data: cached,
      source: cached ? "cache" : "empty",
      syncMetadata: await getSyncMetadata(entitySet),
      error: getErrorMessage(error),
    };
  }
}

export async function cacheDraft<T>(entitySet: Extract<EntitySet, "feedback_draft">, key: string, payload: T) {
  await saveSingleton(entitySet, payload, key);
}

export async function readDraft<T>(entitySet: Extract<EntitySet, "feedback_draft">, key: string) {
  return readSingleton<T>(entitySet, key);
}

export async function clearDraft(entitySet: Extract<EntitySet, "feedback_draft">, key: string) {
  updateState((current) => {
    const nextEntityRecords = { ...(current.cachedRecords[entitySet] ?? {}) };
    delete nextEntityRecords[key];

    return {
      ...current,
      cachedRecords: {
        ...current.cachedRecords,
        [entitySet]: nextEntityRecords,
      },
    };
  });
}

export async function rememberFileCache(
  resourceId: string,
  remoteUrl: string,
  localUri: string,
  updatedAt: string | null
) {
  updateState((current) => ({
    ...current,
    fileCache: {
      ...current.fileCache,
      [resourceId]: {
        resource_id: resourceId,
        remote_url: remoteUrl,
        local_uri: localUri,
        downloaded_at: nowIso(),
        updated_at: updatedAt,
      },
    },
  }));
}

export async function getRememberedFile(resourceId: string) {
  return loadState().fileCache[resourceId] ?? null;
}

export async function removeRememberedFile(resourceId: string) {
  updateState((current) => {
    const nextFileCache = { ...current.fileCache };
    delete nextFileCache[resourceId];
    return {
      ...current,
      fileCache: nextFileCache,
    };
  });
}
