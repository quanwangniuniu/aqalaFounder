import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
  setAnalyticsCollectionEnabled,
} from "@react-native-firebase/analytics";

/**
 * Native Firebase Analytics only accepts String / Int / Double parameter values.
 * Booleans and null cause "unsupported value" / silent drops — coerce or omit.
 */
function normalizeEventParams(
  params?: Record<string, string | number | boolean | null | undefined>
): Record<string, string | number> | undefined {
  if (!params) return undefined;
  const out: Record<string, string | number> = {};
  for (const [key, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "boolean") {
      out[key] = v ? 1 : 0;
    } else {
      out[key] = v;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Log a custom event to Firebase Analytics (native iOS / Android only).
 * Use snake_case names per product analytics conventions.
 */
export async function logNativeAnalyticsEvent(
  name: string,
  params?: Record<string, string | number | boolean>
): Promise<void> {
  const normalized = normalizeEventParams(params);
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[FA] logEvent "${name}"`, normalized ?? {});
  }
  await logEvent(getAnalytics(), name, normalized ?? {});
}

export async function setNativeAnalyticsUserId(userId: string | null): Promise<void> {
  if (__DEV__) {
    const short = userId ? `${userId.slice(0, 6)}…` : "null";
    // eslint-disable-next-line no-console
    console.log(`[FA] setUserId ${short}`);
  }
  await setUserId(getAnalytics(), userId ?? null);
}

export async function setNativeAnalyticsUserProperties(
  properties: Record<string, string | null>
): Promise<void> {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log("[FA] setUserProperties", properties);
  }
  await setUserProperties(getAnalytics(), properties);
}

export async function setNativeAnalyticsCollectionEnabled(enabled: boolean): Promise<void> {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[FA] setAnalyticsCollectionEnabled(${enabled})`);
  }
  await setAnalyticsCollectionEnabled(getAnalytics(), enabled);
}
