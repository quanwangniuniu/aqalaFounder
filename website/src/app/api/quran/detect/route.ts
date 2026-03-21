import { NextResponse } from "next/server";

export const runtime = "nodejs";

type QuranSearchResult = {
  verse_key?: string;
  text?: string;
  highlights?: string[];
};

type QuranSearchResponse = {
  search?: {
    results?: QuranSearchResult[];
  };
};

/**
 * GET /api/quran/detect?q=<text>
 *
 * Uses Quran.com public search to find likely verse matches for a snippet.
 * This is a lightweight "detection" that works well for pasted text/transcript fragments.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q) {
    return NextResponse.json({ error: "Missing query 'q'." }, { status: 400 });
  }

  try {
    const url = new URL("https://api.quran.com/api/v4/search");
    url.searchParams.set("q", q);
    url.searchParams.set("size", "5");
    url.searchParams.set("page", "1");

    const resp = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      // Avoid caching stale results in dev
      cache: "no-store",
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => "");
      return NextResponse.json(
        { error: "Quran.com search failed.", detail },
        { status: 502 }
      );
    }

    const data = (await resp.json()) as QuranSearchResponse;
    const results = (data?.search?.results || []).map((r) => ({
      verseKey: r?.verse_key || "",
      text: r?.text || "",
      highlights: r?.highlights || [],
    }));

    return NextResponse.json({
      query: q,
      results,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Unexpected error", detail: message },
      { status: 500 }
    );
  }
}

