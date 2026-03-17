import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory cache to avoid Aladhan API rate limits (Too Many Requests).
// Prayer times for (lat, lng, date, method, school) are deterministic.
// TTL: 1 hour - same location/date won't re-fetch within the hour.
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const cache = new Map<
  string,
  { data: unknown; expiresAt: number }
>();

function cacheKey(
  lat: string,
  lng: string,
  date: string,
  method: string,
  school: string,
  tune: string
): string {
  return `${lat},${lng},${date},${method},${school},${tune}`;
}

/**
 * Proxy for Aladhan API to avoid CORS and "Failed to fetch" in browser.
 * https://aladhan.com/prayer-times-api
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");
    const date = searchParams.get("date");
    const method = searchParams.get("method") ?? "3";
    const school = searchParams.get("school") ?? "0";
    const tune = searchParams.get("tune") ?? "0,0,0,0,0,0,0,0,0,0,0,0";

    if (!latitude || !longitude || !date) {
      return NextResponse.json(
        { error: "latitude, longitude, and date are required" },
        { status: 400 }
      );
    }

    const key = cacheKey(latitude, longitude, date, method, school, tune);
    const cached = cache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json(cached.data);
    }

    const aladhanUrl = new URL("https://api.aladhan.com/v1/timings");
    aladhanUrl.searchParams.set("latitude", latitude);
    aladhanUrl.searchParams.set("longitude", longitude);
    aladhanUrl.searchParams.set("method", method);
    aladhanUrl.searchParams.set("school", school);
    aladhanUrl.searchParams.set("tune", tune);
    aladhanUrl.searchParams.set("date", date);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(aladhanUrl.toString(), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      // On 429 (Too Many Requests), return cached value for same lat/lng/date if available
      if (response.status === 429) {
        const prefix = `${latitude},${longitude},${date},`;
        for (const [k, v] of cache) {
          if (k.startsWith(prefix) && Date.now() < v.expiresAt) {
            return NextResponse.json(v.data);
          }
        }
      }
      const errBody = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errBody?.error || `Aladhan API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    cache.set(key, {
      data,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timeout" },
          { status: 504 }
        );
      }
      console.error("Prayer times API error:", error.message);
    }
    return NextResponse.json(
      { error: "Failed to fetch prayer times" },
      { status: 500 }
    );
  }
}
