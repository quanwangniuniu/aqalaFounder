import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/soniox-key
 * Mints a short-lived Soniox temporary API key for client-side STT.
 * The master key never leaves the server.
 */
export async function POST() {
  const apiKey = process.env.SONIOX_API_KEY || process.env.NEXT_PUBLIC_SONIOX_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing SONIOX_API_KEY server env var." },
      { status: 500 },
    );
  }

  try {
    const resp = await fetch(
      "https://api.soniox.com/v1/auth/temporary-api-key",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          usage_type: "transcribe_websocket",
          expires_in_seconds: 3600,
        }),
      },
    );

    if (!resp.ok) {
      const detail = await resp.text();
      return NextResponse.json(
        { error: "Soniox API error", detail },
        { status: resp.status },
      );
    }

    const data = await resp.json();
    return NextResponse.json({
      api_key: data.api_key,
      expires_at: data.expires_at,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Unexpected error", detail: message },
      { status: 500 },
    );
  }
}
