/**
 * Widget Sync Layer
 *
 * Bridges prayer data from the React Native app to the native iOS widgets
 * via the WidgetData Expo module (App Groups shared container).
 *
 * Call `syncWidgetData()` whenever prayer times, location, or settings change.
 */
import { Platform } from "react-native";
import { syncPrayerData, reloadWidgets, type WidgetSyncData } from "@/modules/widget-data/src/index";
import type { PrayerTimes, PrayerSettings } from "@/lib/prayer/calculations";

interface SyncParams {
  prayerTimes: PrayerTimes;
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  settings: PrayerSettings;
  hijriDate?: string;
  hijriMonth?: string;
  isRamadan?: boolean;
  ramadanDay?: number;
  ramadanTotal?: number;
  dailyVerse?: {
    arabic: string;
    translation: string;
    reference: string;
  };
}

/**
 * Sync all prayer-related data to the widget shared container.
 * Safe to call on any platform — no-ops on Android.
 */
export async function syncWidgetData(params: SyncParams): Promise<void> {
  if (Platform.OS !== "ios") return;

  const {
    prayerTimes,
    location,
    settings,
    hijriDate = "",
    hijriMonth = "",
    isRamadan = false,
    ramadanDay = 0,
    ramadanTotal = 30,
    dailyVerse,
  } = params;

  const payload: WidgetSyncData = {
    prayerTimes: {
      fajr: prayerTimes.fajr.toISOString(),
      sunrise: prayerTimes.sunrise.toISOString(),
      dhuhr: prayerTimes.dhuhr.toISOString(),
      asr: prayerTimes.asr.toISOString(),
      maghrib: prayerTimes.maghrib.toISOString(),
      isha: prayerTimes.isha.toISOString(),
    },
    location: {
      city: location.city ?? null,
      country: location.country ?? null,
      latitude: location.latitude,
      longitude: location.longitude,
    },
    hijriDate,
    hijriMonth,
    isRamadan,
    ramadanDay,
    ramadanTotal,
    dailyVerse: dailyVerse ?? undefined,
    settings: {
      method: settings.method,
      school: settings.school,
    },
    lastUpdated: new Date().toISOString(),
  };

  try {
    await syncPrayerData(payload);
  } catch (err) {
    console.warn("[WidgetSync] Failed to sync widget data:", err);
  }
}

/**
 * Force-reload all widget timelines.
 */
export function refreshWidgets(): void {
  if (Platform.OS !== "ios") return;
  try {
    reloadWidgets();
  } catch (err) {
    console.warn("[WidgetSync] Failed to reload widgets:", err);
  }
}

/**
 * Fetch Hijri date info from Aladhan API.
 * Returns { hijriDate, hijriMonth, isRamadan, ramadanDay, ramadanTotal }.
 */
export async function fetchHijriInfo(
  latitude: number,
  longitude: number
): Promise<{
  hijriDate: string;
  hijriMonth: string;
  isRamadan: boolean;
  ramadanDay: number;
  ramadanTotal: number;
}> {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  try {
    const url = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=3&date=${day}-${month}-${year}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.code === 200 && json.data?.date?.hijri) {
      const hijri = json.data.date.hijri;
      const hijriDay = hijri.day || "";
      const hijriMonthName = hijri.month?.en || "";
      const hijriMonthNumber = hijri.month?.number || 0;
      const hijriYear = hijri.year || "";
      const isRamadan = hijriMonthNumber === 9;

      return {
        hijriDate: `${hijriDay} ${hijriMonthName} ${hijriYear}`,
        hijriMonth: hijriMonthName,
        isRamadan,
        ramadanDay: isRamadan ? parseInt(hijriDay, 10) || 0 : 0,
        ramadanTotal: 30,
      };
    }
  } catch (err) {
    console.warn("[WidgetSync] Failed to fetch hijri info:", err);
  }

  return {
    hijriDate: "",
    hijriMonth: "",
    isRamadan: false,
    ramadanDay: 0,
    ramadanTotal: 30,
  };
}
