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

interface Message {
  role: "user" | "assistant";
  content: string;
}

// POST /api/ask
// Body: { question: string; summary: string; originalText?: string; conversationHistory?: Message[]; targetLang?: string }
export async function POST(req: Request) {
  try {
    const { question, summary, originalText, conversationHistory, targetLang } =
      await req.json();

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing or empty 'question'." },
        { status: 400 }
      );
    }

    if (!summary || typeof summary !== "string" || summary.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing or empty 'summary'. A summary context is required." },
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
      `You are a knowledgeable Islamic scholar assistant helping users understand and learn from khutbahs, Islamic lectures, and Quran recitations.`,
      `You have been provided with a summary of an Islamic lecture/khutbah and optionally the original transcript.`,
      `Answer the user's questions thoughtfully and accurately based on the content provided.`,
      "",
      "GUIDELINES:",
      "1. Always base your answers on the provided summary and original text when available",
      "2. If the question cannot be answered from the provided context, politely indicate that",
      "3. Provide references to specific points from the lecture when relevant",
      "4. Use respectful Islamic terminology and maintain scholarly tone",
      "5. If asked about Quranic verses mentioned, explain their significance",
      "6. Keep answers concise but thorough",
      `7. Always respond in ${langName}`,
      "",
      "VERSE REFERENCES:",
      "When mentioning Quranic verses, use this format: [Surah Name chapter:verse]",
      "Examples: [Al-Imran 3:18], [Al-Baqarah 2:255], [Al-Kahf 18:1-10]",
      "This allows users to click and read the full context.",
      "",
      "CONTEXT PROVIDED:",
      "---",
      "SUMMARY OF THE LECTURE:",
      summary.slice(0, 4000),
      "---",
      originalText && originalText.trim().length > 0
        ? `ORIGINAL TRANSCRIPT (for reference):\n${originalText.slice(0, 4000)}\n---`
        : "",
    ].filter(Boolean).join("\n");

    // Build messages array with conversation history
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history if provided (last 10 exchanges to stay within token limits)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-20);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add the current question
    messages.push({ role: "user", content: question });

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.5,
        max_tokens: 800,
        messages,
      }),
    });

    if (!resp.ok) {
      let detail: unknown = null;
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

    return NextResponse.json({ answer: content });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Unexpected error", detail: message },
      { status: 500 }
    );
  }
}
