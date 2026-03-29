import analytics from "@react-native-firebase/analytics";

/**
 * Log a custom event to Firebase Analytics (native iOS / Android only).
 * Use snake_case names per product analytics conventions.
 */
export async function logNativeAnalyticsEvent(
  name: string,
  params?: Record<string, string | number | boolean>
): Promise<void> {
  await analytics().logEvent(name, params);
}

export async function setNativeAnalyticsUserId(userId: string | null): Promise<void> {
  await analytics().setUserId(userId ?? null);
}

export async function setNativeAnalyticsUserProperties(
  properties: Record<string, string | null>
): Promise<void> {
  await analytics().setUserProperties(properties);
}

export async function setNativeAnalyticsCollectionEnabled(enabled: boolean): Promise<void> {
  await analytics().setAnalyticsCollectionEnabled(enabled);
}
