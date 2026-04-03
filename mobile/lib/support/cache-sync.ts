import { BookingsService } from "@/lib/api/services/bookings";
import { DocumentsService } from "@/lib/api/services/documents";
import { SupportService } from "@/lib/api/services/support";
import { TripsService } from "@/lib/api/services/trips";
import {
  readCollection,
  readSingleton,
  saveSingleton,
  syncCollection,
  syncSingleton,
  type CachedResult,
} from "@/lib/storage";

function requireData<T>(response: { success: boolean; data?: T; error?: string }) {
  if (!response.success || response.data === undefined) {
    throw new Error(response.error || "Request failed");
  }
  return response.data;
}

export async function syncBookings(token: string) {
  return syncCollection("bookings", async () => requireData(await BookingsService.getMyBookings(token)));
}

export async function readCachedBookings() {
  return readCollection<Awaited<ReturnType<typeof syncBookings>>["data"][number]>("bookings");
}

export async function syncTrips(token: string) {
  const result = await syncCollection("trips", async () => requireData(await TripsService.getMyTrips(token)));
  if (result.data.length) {
    await saveSingleton("home_next_trip", result.data[0]);
  }
  return result;
}

export async function readCachedTrips() {
  return readCollection<Awaited<ReturnType<typeof syncTrips>>["data"][number]>("trips");
}

export async function readCachedNextTrip() {
  return readSingleton<Awaited<ReturnType<typeof syncTrips>>["data"][number]>("home_next_trip");
}

export async function syncTripDetail(tripId: string, token: string) {
  return syncSingleton("trip_detail", async () => requireData(await TripsService.getMyTripDetail(tripId, token)), tripId);
}

export async function readCachedTripDetail(tripId: string) {
  return readSingleton<Awaited<ReturnType<typeof syncTripDetail>>["data"]>("trip_detail", tripId);
}

export async function syncTripMilestones(tripId: string, token: string) {
  return syncSingleton("trip_milestones", async () => requireData(await TripsService.getTripMilestones(tripId, token)), tripId);
}

export async function readCachedTripMilestones(tripId: string) {
  return readSingleton<Awaited<ReturnType<typeof syncTripMilestones>>["data"]>("trip_milestones", tripId);
}

export async function syncTripResources(tripId: string, token: string) {
  return syncSingleton("trip_resources", async () => requireData(await TripsService.getTripResources(tripId, token)), tripId);
}

export async function readCachedTripResources(tripId: string) {
  return readSingleton<Awaited<ReturnType<typeof syncTripResources>>["data"]>("trip_resources", tripId);
}

export async function syncTripReadiness(tripId: string, token: string) {
  return syncSingleton("trip_readiness", async () => requireData(await TripsService.getTripReadiness(tripId, token)), tripId);
}

export async function readCachedTripReadiness(tripId: string) {
  return readSingleton<Awaited<ReturnType<typeof syncTripReadiness>>["data"]>("trip_readiness", tripId);
}

export async function syncTripUpdates(tripId: string, token: string) {
  return syncSingleton("trip_updates", async () => requireData(await SupportService.getTripUpdates(tripId, token)), tripId);
}

export async function readCachedTripUpdates(tripId: string) {
  return readSingleton<Awaited<ReturnType<typeof syncTripUpdates>>["data"]>("trip_updates", tripId);
}

export async function syncDailyProgram(tripId: string, token: string) {
  return syncSingleton("trip_daily_program", async () => requireData(await SupportService.getDailyProgram(tripId, token)), tripId);
}

export async function readCachedDailyProgram(tripId: string) {
  return readSingleton<Awaited<ReturnType<typeof syncDailyProgram>>["data"]>("trip_daily_program", tripId);
}

export async function syncDocuments(token: string) {
  return syncCollection("documents", async () => requireData(await DocumentsService.getMyDocuments(token)));
}

export async function readCachedDocuments() {
  return readCollection<Awaited<ReturnType<typeof syncDocuments>>["data"][number]>("documents");
}

export async function syncNotificationPreferences(token: string) {
  return syncSingleton(
    "notification_preferences",
    async () => requireData(await SupportService.getNotificationPreferences(token))
  );
}

export async function readCachedNotificationPreferences() {
  return readSingleton<Awaited<ReturnType<typeof syncNotificationPreferences>>["data"]>("notification_preferences");
}

export async function syncDevices(token: string) {
  return syncCollection("devices", async () => requireData(await SupportService.listDevices(token)));
}

export async function readCachedDevices() {
  return readCollection<Awaited<ReturnType<typeof syncDevices>>["data"][number]>("devices");
}

export async function syncTripFeedback(tripId: string, token: string) {
  return syncSingleton("feedback", async () => requireData(await SupportService.getTripFeedback(tripId, token)), tripId);
}

export async function readCachedTripFeedback(tripId: string) {
  return readSingleton<Awaited<ReturnType<typeof syncTripFeedback>>["data"]>("feedback", tripId);
}

export async function syncHomeSupport(
  token: string
): Promise<{
  trips: CachedResult<Awaited<ReturnType<typeof syncTrips>>["data"]>;
  nextTripId: string | null;
}> {
  const trips = await syncTrips(token);
  const nextTrip = trips.data[0] || null;

  if (nextTrip?.id) {
    await Promise.all([
      syncTripReadiness(nextTrip.id, token),
      syncDailyProgram(nextTrip.id, token),
      syncTripMilestones(nextTrip.id, token),
      syncTripResources(nextTrip.id, token),
      syncTripUpdates(nextTrip.id, token),
    ]);
  }

  return {
    trips,
    nextTripId: nextTrip?.id || null,
  };
}
