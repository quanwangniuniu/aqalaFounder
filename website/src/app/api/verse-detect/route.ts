import { NextResponse } from "next/server";
import { findVerseReference } from "@/lib/quran/api";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { arabicText } = await req.json();

    if (!arabicText || typeof arabicText !== "string" || arabicText.trim().length < 8) {
      return NextResponse.json({ verseReference: null, verseKey: null });
    }

    const result = await findVerseReference(arabicText.trim());

    if (!result) {
      return NextResponse.json({ verseReference: null, verseKey: null });
    }

    return NextResponse.json({
      verseReference: result.reference,
      verseKey: result.verseKey,
    });
  } catch (e: any) {
    console.error("verse-detect error:", e?.message ?? String(e));
    return NextResponse.json({ verseReference: null, verseKey: null });
  }
}
