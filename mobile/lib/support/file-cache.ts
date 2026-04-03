import * as FileSystem from "expo-file-system/legacy";
import * as WebBrowser from "expo-web-browser";
import { Linking } from "react-native";

import { getRememberedFile, rememberFileCache, removeRememberedFile } from "@/lib/storage";

const RESOURCE_CACHE_DIR = `${FileSystem.documentDirectory ?? ""}alhilal-support/`;

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, "_");
}

async function ensureResourceDirectory() {
  if (!FileSystem.documentDirectory) {
    throw new Error("Local document storage is unavailable on this device.");
  }

  const dirInfo = await FileSystem.getInfoAsync(RESOURCE_CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(RESOURCE_CACHE_DIR, { intermediates: true });
  }
}

function buildLocalUri(resourceId: string, fileFormat?: string | null) {
  const extension = sanitizeSegment(fileFormat || "bin");
  return `${RESOURCE_CACHE_DIR}${sanitizeSegment(resourceId)}.${extension}`;
}

export async function getCachedResource(resourceId: string) {
  const remembered = await getRememberedFile(resourceId);
  if (!remembered) {
    return null;
  }

  const info = await FileSystem.getInfoAsync(remembered.local_uri);
  if (!info.exists) {
    await removeRememberedFile(resourceId);
    return null;
  }

  return remembered;
}

export async function downloadResourceToCache(params: {
  resourceId: string;
  remoteUrl: string;
  fileFormat?: string | null;
  updatedAt?: string | null;
}) {
  await ensureResourceDirectory();
  const localUri = buildLocalUri(params.resourceId, params.fileFormat);
  const result = await FileSystem.downloadAsync(params.remoteUrl, localUri);
  await rememberFileCache(params.resourceId, params.remoteUrl, result.uri, params.updatedAt || null);
  return result.uri;
}

export async function openSupportResource(params: {
  resourceId: string;
  remoteUrl: string | null;
  fileFormat?: string | null;
  updatedAt?: string | null;
  preferCache?: boolean;
}) {
  const cached = await getCachedResource(params.resourceId);

  if (cached && params.preferCache !== false) {
    const canOpenCached = await Linking.canOpenURL(cached.local_uri);
    if (canOpenCached) {
      await Linking.openURL(cached.local_uri);
      return { source: "cache" as const };
    }
  }

  if (!params.remoteUrl) {
    throw new Error("This resource is not downloaded yet.");
  }

  const downloadedUri = await downloadResourceToCache({
    resourceId: params.resourceId,
    remoteUrl: params.remoteUrl,
    fileFormat: params.fileFormat,
    updatedAt: params.updatedAt,
  });

  const canOpenDownloaded = await Linking.canOpenURL(downloadedUri);
  if (canOpenDownloaded) {
    await Linking.openURL(downloadedUri);
    return { source: "downloaded" as const };
  }

  await WebBrowser.openBrowserAsync(params.remoteUrl);
  return { source: "remote" as const };
}
