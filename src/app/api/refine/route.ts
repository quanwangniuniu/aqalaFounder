import { NextResponse } from "next/server";
import { findVerseReference } from "@/lib/quran/api";

export const runtime = "nodejs";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  ar: "Arabic",
  ur: "Urdu",
  hi: "Hindi",
  bn: "Bengali",
  pa: "Punjabi",
  tr: "Turkish",
  id: "Indonesian",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  vi: "Vietnamese",
  th: "Thai",
};

// POST /api/refine
// Body: { text: string; arabicText?: string; context?: string; fast?: boolean; targetLang?: string }
export async function POST(req: Request) {
  try {
    const { text, arabicText, context, fast, targetLang } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing 'text'." }, { status: 400 });
    }
    // Prefer server-side key; allow fallback to NEXT_PUBLIC for local dev only.
    const apiKey =
      process.env.OPENAI_API_KEY ||
      process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
      undefined;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY server env var." },
        { status: 500 },
      );
    }

    // Resolve target language name (default to English for backwards compatibility)
    const langCode = targetLang || "en";
    const langName = LANG_NAMES[langCode] || "English";

    const systemPrompt = [
      `You are a precise editor fixing grammar and flow in ${langName} translations of Islamic content.`,
      "",
      "CRITICAL RULES - NEVER VIOLATE:",
      "",
      `1. Output ONLY in ${langName}. The input is already in ${langName} - keep it that way.`,
      "2. Output ONLY what is in the input. NEVER add new sentences, ideas, stories, or content.",
      "3. If input has 2 sentences, output has 2 sentences. If input has 10 words, output has roughly 10 words.",
      "4. Do NOT expand, elaborate, or infer beyond what is explicitly stated.",
      "5. Do NOT add greetings, blessings, advice, or commentary not in the original.",
      "6. Do NOT generate typical khutbah content unless it is LITERALLY in the input.",
      `7. NEVER translate to a different language - input and output must both be in ${langName}.`,
      "",
      "Your ONLY job is to:",
      "- Fix grammar and sentence structure",
      "- Correct obvious typos or transcription errors",
      "- Make the existing text flow naturally",
      "- Add appropriate Islamic honorifics ONLY where contextually required",
      "",
      "Be MINIMAL. Preserve the LENGTH of the input. Fix grammar ONLY.",
    ].join("\n");

    const parts: string[] = [];
    parts.push(`Fix the grammar in this ${langName} text. Output ONLY the corrected version in ${langName}.`);
    parts.push("Do NOT add any new content, sentences, or ideas.");
    parts.push("Keep the same length - if input is short, output is short.");
    parts.push(`IMPORTANT: Keep the output in ${langName}. Do NOT translate to any other language.`);
    if (arabicText) {
      parts.push(`If the ${langName} is unclear, prioritize the intended Arabic meaning.`);
    }
    parts.push("");
    if (typeof arabicText === "string" && arabicText.trim().length > 0) {
      parts.push("Arabic reference (for word choice only, do not translate or expand):");
      parts.push(arabicText.trim());
      parts.push("");
    }
    parts.push(`${langName} text to fix:`);
    parts.push(text);
    parts.push("");
    parts.push(`Output ONLY the corrected ${langName} text. No instructions, no explanations, no prefixes, no meta-text.`);
    const userPrompt = parts.join("\n");

    // Default to gpt-4o-mini (cheaper) - override with OPENAI_MODEL env var if needed
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!resp.ok) {
      let detail: any = null;
      try {
        detail = await resp.json();
      } catch {
        detail = await resp.text();
      }
      return NextResponse.json(
        { error: "OpenAI error", detail },
        { status: 502 },
      );
    }
    const data = await resp.json();
    const content =
      data?.choices?.[0]?.message?.content ??
      "";

    // Search for Quran verse reference if Arabic text is provided
    // CONSERVATIVE: Only show when we're VERY confident it's an actual Quranic verse
    // Most Arabic in khutbahs is regular speech, not Quran recitation
    let verseReference: string | null = null;
    if (typeof arabicText === "string" && arabicText.trim().length >= 10) {
      try {
        const verseResult = await findVerseReference(arabicText.trim());
        // The findVerseReference function already has strict thresholds built in
        // It only returns results when confidence is high
        if (verseResult) {
          verseReference = verseResult.reference;
          console.log(`[Quran] Matched: "${verseResult.reference}" (confidence: ${verseResult.confidence.toFixed(2)}, consecutive: ${verseResult.longestConsecutive})`);
        }
      } catch (err) {
        // Silently fail - verse reference is optional enhancement
        console.error("Verse reference lookup failed:", err);
      }
    }

    return NextResponse.json({ result: content, verseReference });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Unexpected error", detail: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}


