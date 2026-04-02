/**
 * Structured Firebase Analytics events (snake_case) — website (aqala.org).
 *
 * Event names use a `web_` prefix so they don’t collide with the same conceptual events from
 * native apps (iOS/Android) in shared GA4 property reports.
 *
 * Notes:
 * - Web GA4 accepts string/number values; booleans are coerced to 0/1 in the firebase wrapper.
 * - All logging is gated by PrivacyConsentContext via logWebAnalyticsEvent + localStorage consent.
 */
import {
  logWebAnalyticsEvent,
} from "@/lib/firebase/analytics";

async function safeLog(
  name: string,
  params?: Record<string, string | number | boolean>
): Promise<void> {
  try {
    await logWebAnalyticsEvent(name, params);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[analytics:web]", name, e);
    }
  }
}

export type AuthMethod = "email" | "apple" | "google";

export async function trackLogin(method: AuthMethod, success: boolean): Promise<void> {
  await safeLog("web_login", { method, success });
}

export async function trackSignUp(method: AuthMethod, success: boolean): Promise<void> {
  await safeLog("web_sign_up", { method, success });
}

export async function trackPageView(params: {
  path: string;
  title?: string;
  referrer?: string;
}): Promise<void> {
  await safeLog("web_page_view", {
    path: params.path,
    ...(params.title ? { title: params.title } : {}),
    ...(params.referrer ? { referrer: params.referrer } : {}),
  });
}

export async function trackButtonClick(params: {
  element_name: string;
  screen_name: string;
  target_id?: string;
}): Promise<void> {
  await safeLog("web_button_click", {
    element_name: params.element_name,
    screen_name: params.screen_name,
    ...(params.target_id ? { target_id: params.target_id } : {}),
  });
}

export async function trackCardClick(params: {
  element_name: string;
  screen_name: string;
  target_id?: string;
}): Promise<void> {
  await safeLog("web_card_click", {
    element_name: params.element_name,
    screen_name: params.screen_name,
    ...(params.target_id ? { target_id: params.target_id } : {}),
  });
}

export async function trackDonate(params: {
  amount: number;
  currency: string;
  product_id: string;
  payment_method: string;
  action?: string;
}): Promise<void> {
  await safeLog("web_donate", {
    amount: params.amount,
    currency: params.currency,
    product_id: params.product_id,
    payment_method: params.payment_method,
    ...(params.action ? { action: params.action } : {}),
  });
}

export async function trackSubscribePremium(params: {
  amount: number;
  currency: string;
  product_id: string;
  payment_method: string;
  screen_name?: string;
}): Promise<void> {
  await safeLog("web_subscribe_premium", {
    amount: params.amount,
    currency: params.currency,
    product_id: params.product_id,
    payment_method: params.payment_method,
    ...(params.screen_name ? { screen_name: params.screen_name } : {}),
  });
}

export async function trackPurchaseSuccess(params: {
  amount: number;
  currency: string;
  product_id: string;
  payment_method: string;
}): Promise<void> {
  await safeLog("web_purchase_success", {
    amount: params.amount,
    currency: params.currency,
    product_id: params.product_id,
    payment_method: params.payment_method,
  });
}

/** Prayer times (web) — time on `/app/prayer-times` (and subpaths). */
export async function trackWebPrayerTimesStart(params: { source: string }): Promise<void> {
  await safeLog("web_prayer_times_start", { source: params.source });
}

export async function trackWebPrayerTimesEnd(params: {
  source: string;
  duration_sec: number;
}): Promise<void> {
  await safeLog("web_prayer_times_end", {
    source: params.source,
    duration_sec: params.duration_sec,
  });
}

/** Qibla finder (web) — time on `/qibla` (and subpaths). */
export async function trackWebQiblaStart(params: { source: string }): Promise<void> {
  await safeLog("web_qibla_start", { source: params.source });
}

export async function trackWebQiblaEnd(params: {
  source: string;
  duration_sec: number;
}): Promise<void> {
  await safeLog("web_qibla_end", {
    source: params.source,
    duration_sec: params.duration_sec,
  });
}

/** Listen / translate (web) — time on `/listen` and subpaths (e.g. `/listen/past`). */
export async function trackWebListeningStart(params: {
  room_id: string;
  content_id: string;
  source: string;
}): Promise<void> {
  await safeLog("web_listening_start", {
    room_id: params.room_id,
    content_id: params.content_id,
    source: params.source,
  });
}

export async function trackWebListeningEnd(params: {
  room_id: string;
  content_id: string;
  source: string;
  duration_sec: number;
}): Promise<void> {
  await safeLog("web_listening_end", {
    room_id: params.room_id,
    content_id: params.content_id,
    source: params.source,
    duration_sec: params.duration_sec,
  });
}

