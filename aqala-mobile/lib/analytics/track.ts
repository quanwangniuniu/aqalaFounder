/**
 * Structured Firebase Analytics events (snake_case). See lib/analytics/EVENTS.md.
 */
import {
  logNativeAnalyticsEvent,
  setNativeAnalyticsUserId,
  setNativeAnalyticsUserProperties,
} from "@/lib/firebase/nativeAnalytics";

async function safeLog(
  name: string,
  params?: Record<string, string | number | boolean>
): Promise<void> {
  try {
    await logNativeAnalyticsEvent(name, params);
  } catch (e) {
    if (__DEV__) {
      console.warn("[analytics]", name, e);
    }
  }
}

export type AuthMethod = "email" | "apple" | "google";

export async function trackLogin(method: AuthMethod, success: boolean): Promise<void> {
  await safeLog("login", { method, success });
}

export async function trackSignUp(method: AuthMethod, success: boolean): Promise<void> {
  await safeLog("sign_up", { method, success });
}

export type RoomEntrySource = string;

export async function trackRoomEnter(params: {
  room_id: string;
  entry_source: RoomEntrySource;
  room_type: string;
}): Promise<void> {
  await safeLog("room_enter", {
    room_id: params.room_id,
    entry_source: params.entry_source,
    room_type: params.room_type,
  });
}

export async function trackRoomExit(params: {
  room_id: string;
  entry_source: RoomEntrySource;
  room_type: string;
}): Promise<void> {
  await safeLog("room_exit", {
    room_id: params.room_id,
    entry_source: params.entry_source,
    room_type: params.room_type,
  });
}

export async function trackListeningStart(params: {
  room_id: string;
  content_id: string;
  source: string;
}): Promise<void> {
  await safeLog("listening_start", {
    room_id: params.room_id,
    content_id: params.content_id,
    source: params.source,
  });
}

export async function trackListeningEnd(params: {
  room_id: string;
  content_id: string;
  source: string;
  duration_sec: number;
}): Promise<void> {
  await safeLog("listening_end", {
    room_id: params.room_id,
    content_id: params.content_id,
    source: params.source,
    duration_sec: params.duration_sec,
  });
}

/** Prayer times tab / screen session (time on screen). */
export async function trackPrayerTimesStart(params: { source: string }): Promise<void> {
  await safeLog("prayer_times_start", { source: params.source });
}

export async function trackPrayerTimesEnd(params: {
  source: string;
  duration_sec: number;
}): Promise<void> {
  await safeLog("prayer_times_end", {
    source: params.source,
    duration_sec: params.duration_sec,
  });
}

/** Qibla finder screen session. */
export async function trackQiblaStart(params: { source: string }): Promise<void> {
  await safeLog("qibla_start", { source: params.source });
}

export async function trackQiblaEnd(params: {
  source: string;
  duration_sec: number;
}): Promise<void> {
  await safeLog("qibla_end", {
    source: params.source,
    duration_sec: params.duration_sec,
  });
}

export async function trackDonate(params: {
  amount: number;
  currency: string;
  product_id: string;
  payment_method: string;
  /** funnel step, e.g. view_screen | proceed_to_subscription */
  action?: string;
}): Promise<void> {
  await safeLog("donate", {
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
  await safeLog("subscribe_premium", {
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
  restored: boolean;
}): Promise<void> {
  await safeLog("purchase_success", {
    amount: params.amount,
    currency: params.currency,
    product_id: params.product_id,
    payment_method: params.payment_method,
    restored: params.restored,
  });
}

export async function trackButtonClick(params: {
  element_name: string;
  screen_name: string;
  target_id?: string;
}): Promise<void> {
  await safeLog("button_click", {
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
  await safeLog("card_click", {
    element_name: params.element_name,
    screen_name: params.screen_name,
    ...(params.target_id ? { target_id: params.target_id } : {}),
  });
}

export async function trackShareClick(params: {
  element_name: string;
  screen_name: string;
  target_id?: string;
}): Promise<void> {
  await safeLog("share_click", {
    element_name: params.element_name,
    screen_name: params.screen_name,
    ...(params.target_id ? { target_id: params.target_id } : {}),
  });
}

export async function trackFollowUser(params: {
  screen_name: string;
  target_id: string;
  /** follow | unfollow */
  action: string;
}): Promise<void> {
  await safeLog("follow_user", {
    element_name: "follow_button",
    screen_name: params.screen_name,
    target_id: params.target_id,
    action: params.action,
  });
}

export async function trackLikeContent(params: {
  element_name: string;
  screen_name: string;
  target_id?: string;
}): Promise<void> {
  await safeLog("like_content", {
    element_name: params.element_name,
    screen_name: params.screen_name,
    ...(params.target_id ? { target_id: params.target_id } : {}),
  });
}

export async function syncAnalyticsUser(params: {
  firebaseUid: string | null;
  isPremium: boolean;
  signupDateIso: string | null;
  country: string | null;
  appVersion: string | null;
}): Promise<void> {
  try {
    await setNativeAnalyticsUserId(params.firebaseUid);
    // setUserId is the supported way to set Analytics user id; `user_id` as a user property is reserved and ignored.
    if (!params.firebaseUid) {
      await setNativeAnalyticsUserProperties({
        is_premium: "",
        signup_date: "",
        country: "",
        app_version: "",
      });
      return;
    }
    await setNativeAnalyticsUserProperties({
      is_premium: String(params.isPremium),
      ...(params.signupDateIso ? { signup_date: params.signupDateIso } : {}),
      ...(params.country ? { country: params.country } : {}),
      ...(params.appVersion ? { app_version: params.appVersion } : {}),
    });
  } catch (e) {
    if (__DEV__) {
      console.warn("[analytics] sync user", e);
    }
  }
}
