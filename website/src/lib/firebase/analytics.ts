import { isSupported, getAnalytics, logEvent, setUserId, setUserProperties, setAnalyticsCollectionEnabled } from "firebase/analytics";
import { firebaseApp } from "./config";

type EventParams = Record<string, string | number | boolean | null | undefined>;

function normalizeParams(params?: EventParams): Record<string, string | number> | undefined {
  if (!params) return undefined;
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "boolean") out[k] = v ? 1 : 0;
    else out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

let analyticsPromise: Promise<ReturnType<typeof getAnalytics> | null> | null = null;

async function getWebAnalytics() {
  if (typeof window === "undefined") return null;
  if (!firebaseApp) return null;
  if (!analyticsPromise) {
    analyticsPromise = (async () => {
      const supported = await isSupported().catch(() => false);
      if (!supported) return null;
      return getAnalytics(firebaseApp);
    })();
  }
  return analyticsPromise;
}

export async function logWebAnalyticsEvent(name: string, params?: EventParams): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("aqala_privacy_consent");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { consentGiven?: boolean; analytics?: boolean };
      if (!parsed?.consentGiven || !parsed?.analytics) return;
    } catch {
      return;
    }
  }

  const analytics = await getWebAnalytics();
  if (!analytics) return;
  const normalized = normalizeParams(params);
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(`[FA:web] logEvent "${name}"`, normalized ?? {});
  }
  await logEvent(analytics, name, normalized ?? {});
}

export async function setWebAnalyticsUserId(userId: string | null): Promise<void> {
  const analytics = await getWebAnalytics();
  if (!analytics) return;
  await setUserId(analytics, userId ?? null);
}

export async function setWebAnalyticsUserProperties(
  properties: Record<string, string | null>
): Promise<void> {
  const analytics = await getWebAnalytics();
  if (!analytics) return;
  await setUserProperties(analytics, properties);
}

export async function setWebAnalyticsCollectionEnabled(enabled: boolean): Promise<void> {
  const analytics = await getWebAnalytics();
  if (!analytics) return;
  await setAnalyticsCollectionEnabled(analytics, enabled);
}

