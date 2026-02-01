import { NextResponse } from "next/server";

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

// POST /api/summarize
// Body: { text: string; sourceText?: string; targetLang?: string }
export async function POST(req: Request) {
  try {
    const { text, sourceText, targetLang } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing or empty 'text'." },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.OPENAI_API_KEY ||
      process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
      undefined;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY server env var." },
        { status: 500 }
      );
    }

    const langCode = targetLang || "en";
    const langName = LANG_NAMES[langCode] || "English";

    const systemPrompt = [
      `You are an expert summarizer of Islamic lectures, khutbahs, and Quran recitations.`,
      `Your task is to create a clear, meaningful summary in ${langName}.`,
      "",
      "GUIDELINES:",
      "1. Capture the main themes and key messages",
      "2. Highlight any Quranic verses mentioned and their significance",
      "3. Note important lessons or moral teachings",
      "4. Keep the summary concise but comprehensive (3-5 paragraphs)",
      "5. Use respectful Islamic terminology where appropriate",
      "6. Structure the summary with clear sections if multiple topics were covered",
      "",
      "FORMAT:",
      "- Start with a brief overview of what was discussed",
      "- List key points or themes",
      "- End with the main takeaway or message",
    ].join("\n");

    const parts: string[] = [];
    parts.push(
      `Please summarize the following Islamic content in ${langName}.`
    );
    parts.push("");
    if (sourceText && sourceText.trim().length > 0) {
      parts.push("Original Arabic/Source text (for reference):");
      parts.push(sourceText.trim().slice(0, 2000)); // Limit source text
      parts.push("");
    }
    parts.push(`Translated content to summarize:`);
    parts.push(text.slice(0, 8000)); // Limit to avoid token overflow
    parts.push("");
    parts.push(
      `Provide a well-structured summary in ${langName}. Use markdown formatting for readability.`
    );

    const userPrompt = parts.join("\n");

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 1000,
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
        { status: 502 }
      );
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ summary: content });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Unexpected error", detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
