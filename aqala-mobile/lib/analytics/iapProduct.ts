/** Best-effort numeric price from expo-iap product payloads (store-specific shapes). */
export function amountFromIapProduct(product: unknown): number {
  if (!product || typeof product !== "object") return 0;
  const p = product as Record<string, unknown>;
  if (typeof p.price === "number") return p.price;
  const micros = p.priceAmountMicros;
  if (typeof micros === "number") return micros / 1_000_000;
  const parsed = parseFloat(String(p.displayPrice ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function currencyFromIapProduct(product: unknown): string {
  if (!product || typeof product !== "object") return "USD";
  const c = (product as Record<string, unknown>).currency;
  return typeof c === "string" && c.length > 0 ? c : "USD";
}
