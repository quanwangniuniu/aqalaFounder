import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { PrayerTimes } from "@/lib/prayer/calculations";

/** iOS: filename as copied into the app bundle by expo-notifications. */
export const ADHAAN_SOUND_IOS = "adhaan_short.wav";
/** Android: res/raw name (no extension). */
export const ADHAAN_SOUND_ANDROID_RAW = "adhaan_short";

const CHANNEL_ADHAN = "prayer_adhan";
const CHANNEL_DEFAULT = "prayer_default";

export const PRAYER_NOTIF_ID_PREFIX = "aqala-prayer";

export type PrayerNotifKey =
  | "fajr"
  | "sunrise"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha";

/** Prayer list row `name` → prefs key. */
export const PRAYER_DISPLAY_NAME_TO_NOTIF_KEY: Record<string, PrayerNotifKey> =
  {
    Fajr: "fajr",
    Sunrise: "sunrise",
    Dhuhr: "dhuhr",
    Asr: "asr",
    Maghrib: "maghrib",
    Isha: "isha",
  };

export interface PrayerNotificationPrefs {
  enabled: boolean;
  /** Per-prayer: use bundled adhan vs default notification sound. */
  prayerAdhan: Record<PrayerNotifKey, boolean>;
  prayers: Record<PrayerNotifKey, boolean>;
}

export const DEFAULT_PRAYER_NOTIFICATION_PREFS: PrayerNotificationPrefs = {
  enabled: false,
  prayerAdhan: {
    fajr: true,
    sunrise: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  prayers: {
    fajr: true,
    sunrise: false,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
};

/** Order of per-prayer toggles (settings + storage migration). */
export const PRAYER_NOTIF_TOGGLE_ORDER: PrayerNotifKey[] = [
  "fajr",
  "sunrise",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

/** Merge AsyncStorage JSON; migrates legacy `useAdhanSound` to `prayerAdhan`. */
export function mergeStoredPrayerNotificationPrefs(
  raw: unknown,
): PrayerNotificationPrefs {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_PRAYER_NOTIFICATION_PREFS };
  }
  const o = raw as Record<string, unknown>;
  const prevPrayers =
    o.prayers && typeof o.prayers === "object"
      ? (o.prayers as Partial<Record<PrayerNotifKey, boolean>>)
      : {};

  let prayerAdhan: PrayerNotificationPrefs["prayerAdhan"] = {
    ...DEFAULT_PRAYER_NOTIFICATION_PREFS.prayerAdhan,
  };
  if (o.prayerAdhan && typeof o.prayerAdhan === "object") {
    prayerAdhan = {
      ...prayerAdhan,
      ...(o.prayerAdhan as Partial<Record<PrayerNotifKey, boolean>>),
    };
  } else if (typeof o.useAdhanSound === "boolean") {
    for (const k of PRAYER_NOTIF_TOGGLE_ORDER) {
      prayerAdhan[k] = o.useAdhanSound;
    }
  }

  return {
    enabled:
      typeof o.enabled === "boolean"
        ? o.enabled
        : DEFAULT_PRAYER_NOTIFICATION_PREFS.enabled,
    prayers: {
      ...DEFAULT_PRAYER_NOTIFICATION_PREFS.prayers,
      ...prevPrayers,
    },
    prayerAdhan,
  };
}

const PRAYER_META: {
  key: PrayerNotifKey;
  label: string;
  getTime: (t: PrayerTimes) => Date;
}[] = [
  { key: "fajr", label: "Fajr", getTime: (t) => t.fajr },
  { key: "sunrise", label: "Sunrise", getTime: (t) => t.sunrise },
  { key: "dhuhr", label: "Dhuhr", getTime: (t) => t.dhuhr },
  { key: "asr", label: "Asr", getTime: (t) => t.asr },
  { key: "maghrib", label: "Maghrib", getTime: (t) => t.maghrib },
  { key: "isha", label: "Isha", getTime: (t) => t.isha },
];

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function notifIdentifier(
  prayerKey: PrayerNotifKey,
  day: Date,
): string {
  return `${PRAYER_NOTIF_ID_PREFIX}-${prayerKey}-${dayKey(day)}`;
}

export async function ensurePrayerNotificationChannels(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ADHAN, {
    name: "Prayer times (Adhan)",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 280, 200, 280],
    sound: ADHAAN_SOUND_ANDROID_RAW,
    enableVibrate: true,
  });

  await Notifications.setNotificationChannelAsync(CHANNEL_DEFAULT, {
    name: "Prayer times",
    importance: Notifications.AndroidImportance.HIGH,
    enableVibrate: true,
  });
}

export async function cancelAllPrayerNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      all
        .filter((n) => n.identifier.startsWith(PRAYER_NOTIF_ID_PREFIX))
        .map((n) =>
          Notifications.cancelScheduledNotificationAsync(n.identifier),
        ),
    );
  } catch (e) {
    console.warn("[prayer-notifs] cancel failed", e);
  }
}

export async function requestPrayerNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function syncPrayerNotifications(params: {
  prefs: PrayerNotificationPrefs;
  todayTimes: PrayerTimes;
  tomorrowTimes: PrayerTimes;
}): Promise<void> {
  if (Platform.OS === "web") return;

  const { prefs, todayTimes, tomorrowTimes } = params;

  await cancelAllPrayerNotifications();

  if (!prefs.enabled) return;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return;

  await ensurePrayerNotificationChannels();

  const now = Date.now();
  const marginMs = 15_000;

  const scheduleForDay = async (
    times: PrayerTimes,
    anchorDate: Date,
  ): Promise<void> => {
    const jobs: Promise<string>[] = [];

    for (const { key, label, getTime } of PRAYER_META) {
      if (!prefs.prayers[key]) continue;
      const when = getTime(times);
      if (when.getTime() <= now + marginMs) continue;

      const useAdhan = prefs.prayerAdhan[key];
      const soundIos: boolean | string = useAdhan ? ADHAAN_SOUND_IOS : true;
      const soundAndroidLegacy = useAdhan
        ? `${ADHAAN_SOUND_ANDROID_RAW}.wav`
        : "default";

      const androidChannel =
        Platform.OS === "android"
          ? useAdhan
            ? CHANNEL_ADHAN
            : CHANNEL_DEFAULT
          : undefined;

      const trigger: Notifications.DateTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
        ...(androidChannel ? { channelId: androidChannel } : {}),
      };

      jobs.push(
        Notifications.scheduleNotificationAsync({
          identifier: notifIdentifier(key, anchorDate),
          content: {
            title: `Prayer time: ${label}`,
            body: useAdhan ? `Adhan — ${label}` : `It's time for ${label}.`,
            sound: Platform.OS === "ios" ? soundIos : soundAndroidLegacy,
          },
          trigger,
        }),
      );
    }

    await Promise.all(jobs);
  };

  const today = new Date();
  await scheduleForDay(todayTimes, today);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  await scheduleForDay(tomorrowTimes, tomorrow);
}

export function prayerTimesFingerprint(times: PrayerTimes | null): string {
  if (!times) return "";
  return [
    times.fajr.getTime(),
    times.sunrise.getTime(),
    times.dhuhr.getTime(),
    times.asr.getTime(),
    times.maghrib.getTime(),
    times.isha.getTime(),
  ].join("|");
}
