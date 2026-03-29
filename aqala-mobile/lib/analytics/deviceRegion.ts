/** Region from JS Intl (best effort on native). */
export function getDeviceRegionCode(): string | null {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || "";
    const match = locale.match(/-([A-Z]{2})$/i);
    if (match) return match[1].toUpperCase();
  } catch {
    /* ignore */
  }
  return null;
}
