import * as SQLite from "expo-sqlite";

export type EntitySet =
  | "home_next_trip"
  | "public_trips"
  | "public_trip_detail"
  | "public_guidance_articles"
  | "public_guidance_detail"
  | "public_videos"
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

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function nowIso() {
  return new Date().toISOString();
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown sync error";
}

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = (async () => {
      const db = await SQLite.openDatabaseAsync("alhilal-support.db");
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS cached_records (
          entity_set TEXT NOT NULL,
          cache_key TEXT NOT NULL,
          payload TEXT NOT NULL,
          updated_at TEXT,
          PRIMARY KEY (entity_set, cache_key)
        );
        CREATE TABLE IF NOT EXISTS sync_state (
          entity_set TEXT PRIMARY KEY NOT NULL,
          last_successful_sync TEXT,
          stale INTEGER NOT NULL DEFAULT 0,
          hard_failure INTEGER NOT NULL DEFAULT 0,
          last_error TEXT,
          last_known_good_payload TEXT,
          updated_at TEXT
        );
        CREATE TABLE IF NOT EXISTS file_cache (
          resource_id TEXT PRIMARY KEY NOT NULL,
          remote_url TEXT NOT NULL,
          local_uri TEXT NOT NULL,
          downloaded_at TEXT NOT NULL,
          updated_at TEXT
        );
      `);
      return db;
    })();
  }

  return databasePromise;
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
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    last_successful_sync: string | null;
    stale: number;
    hard_failure: number;
    last_error: string | null;
    last_known_good_payload: string | null;
    updated_at: string | null;
  }>("SELECT * FROM sync_state WHERE entity_set = ?", entitySet);

  if (!row) {
    return toSyncMetadata(entitySet);
  }

  return {
    entitySet,
    lastSuccessfulSync: row.last_successful_sync,
    stale: Boolean(row.stale),
    hardFailure: Boolean(row.hard_failure),
    lastError: row.last_error,
    lastKnownGoodPayload: row.last_known_good_payload,
    updatedAt: row.updated_at,
  };
}

async function upsertSyncState(
  db: SQLite.SQLiteDatabase,
  entitySet: EntitySet,
  updates: Partial<SyncMetadata>
) {
  const current = await getSyncMetadata(entitySet);
  const next = {
    ...current,
    ...updates,
    entitySet,
    updatedAt: updates.updatedAt ?? nowIso(),
  };

  await db.runAsync(
    `
      INSERT INTO sync_state (
        entity_set,
        last_successful_sync,
        stale,
        hard_failure,
        last_error,
        last_known_good_payload,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(entity_set) DO UPDATE SET
        last_successful_sync = excluded.last_successful_sync,
        stale = excluded.stale,
        hard_failure = excluded.hard_failure,
        last_error = excluded.last_error,
        last_known_good_payload = excluded.last_known_good_payload,
        updated_at = excluded.updated_at
    `,
    entitySet,
    next.lastSuccessfulSync,
    next.stale ? 1 : 0,
    next.hardFailure ? 1 : 0,
    next.lastError,
    next.lastKnownGoodPayload,
    next.updatedAt
  );
}

export async function readCollection<T>(entitySet: EntitySet): Promise<T[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ payload: string }>(
    "SELECT payload FROM cached_records WHERE entity_set = ? ORDER BY cache_key",
    entitySet
  );

  return rows.map((row) => JSON.parse(row.payload) as T);
}

export async function readSingleton<T>(entitySet: EntitySet, cacheKey = "default"): Promise<T | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ payload: string }>(
    "SELECT payload FROM cached_records WHERE entity_set = ? AND cache_key = ?",
    entitySet,
    cacheKey
  );

  return row ? (JSON.parse(row.payload) as T) : null;
}

export async function replaceCollection<T extends { id?: string }>(entitySet: EntitySet, items: T[]) {
  const db = await getDatabase();
  const syncedAt = nowIso();
  await db.runAsync("DELETE FROM cached_records WHERE entity_set = ?", entitySet);

  for (const [index, item] of items.entries()) {
    const cacheKey = item.id || `${entitySet}-${index}`;
    const updatedAt = (item as { updated_at?: string; updatedAt?: string }).updated_at
      || (item as { updated_at?: string; updatedAt?: string }).updatedAt
      || syncedAt;
    await db.runAsync(
      `
        INSERT INTO cached_records (entity_set, cache_key, payload, updated_at)
        VALUES (?, ?, ?, ?)
      `,
      entitySet,
      cacheKey,
      JSON.stringify(item),
      updatedAt
    );
  }

  await upsertSyncState(db, entitySet, {
    lastSuccessfulSync: syncedAt,
    stale: false,
    hardFailure: false,
    lastError: null,
    lastKnownGoodPayload: JSON.stringify(items),
    updatedAt: syncedAt,
  });
}

export async function saveSingleton<T>(entitySet: EntitySet, payload: T, cacheKey = "default") {
  const db = await getDatabase();
  const syncedAt = nowIso();
  const updatedAt = (payload as { updated_at?: string; updatedAt?: string }).updated_at
    || (payload as { updated_at?: string; updatedAt?: string }).updatedAt
    || syncedAt;

  await db.runAsync(
    `
      INSERT INTO cached_records (entity_set, cache_key, payload, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(entity_set, cache_key) DO UPDATE SET
        payload = excluded.payload,
        updated_at = excluded.updated_at
    `,
    entitySet,
    cacheKey,
    JSON.stringify(payload),
    updatedAt
  );

  await upsertSyncState(db, entitySet, {
    lastSuccessfulSync: syncedAt,
    stale: false,
    hardFailure: false,
    lastError: null,
    lastKnownGoodPayload: JSON.stringify(payload),
    updatedAt: syncedAt,
  });
}

export async function markSyncFailure(entitySet: EntitySet, error: unknown) {
  const db = await getDatabase();
  const current = await getSyncMetadata(entitySet);
  const nextUpdatedAt = nowIso();

  await upsertSyncState(db, entitySet, {
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
  const db = await getDatabase();
  await db.runAsync("DELETE FROM cached_records WHERE entity_set = ? AND cache_key = ?", entitySet, key);
}

export async function rememberFileCache(resourceId: string, remoteUrl: string, localUri: string, updatedAt: string | null) {
  const db = await getDatabase();
  await db.runAsync(
    `
      INSERT INTO file_cache (resource_id, remote_url, local_uri, downloaded_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(resource_id) DO UPDATE SET
        remote_url = excluded.remote_url,
        local_uri = excluded.local_uri,
        downloaded_at = excluded.downloaded_at,
        updated_at = excluded.updated_at
    `,
    resourceId,
    remoteUrl,
    localUri,
    nowIso(),
    updatedAt
  );
}

export async function getRememberedFile(resourceId: string) {
  const db = await getDatabase();
  return db.getFirstAsync<{
    resource_id: string;
    remote_url: string;
    local_uri: string;
    downloaded_at: string;
    updated_at: string | null;
  }>("SELECT * FROM file_cache WHERE resource_id = ?", resourceId);
}

export async function removeRememberedFile(resourceId: string) {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM file_cache WHERE resource_id = ?", resourceId);
}
