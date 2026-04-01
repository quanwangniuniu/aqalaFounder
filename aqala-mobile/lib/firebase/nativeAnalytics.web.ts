/**
 * Web / Expo Go: Firebase Analytics native SDK is unavailable — no-ops.
 */

export async function logNativeAnalyticsEvent(
  _name: string,
  _params?: Record<string, string | number | boolean>
): Promise<void> {}

export async function setNativeAnalyticsUserId(_userId: string | null): Promise<void> {}

export async function setNativeAnalyticsUserProperties(
  _properties: Record<string, string | null>
): Promise<void> {}

export async function setNativeAnalyticsCollectionEnabled(_enabled: boolean): Promise<void> {}
