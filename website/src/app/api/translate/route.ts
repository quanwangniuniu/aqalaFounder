import { NextResponse } from "next/server";

export const runtime = "nodejs";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  ar: "Arabic",
  ur: "Urdu",
  hi: "Hindi",
  bn: "Bengali",
  tr: "Turkish",
  id: "Indonesian",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  ru: "Russian",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  ms: "Malay",
  fa: "Persian",
  sw: "Swahili",
};

// POST /api/translate
// Body: { text: string; targetLang: string; sourceLang?: string }
export async function POST(req: Request) {
  try {
    const { text, targetLang, sourceLang } = await req.json();
    
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Missing 'text'." }, { status: 400 });
    }
    
    if (!targetLang || typeof targetLang !== "string") {
      return NextResponse.json({ error: "Missing 'targetLang'." }, { status: 400 });
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

    const targetLangName = LANG_NAMES[targetLang] || targetLang;
    const sourceLangName = sourceLang ? (LANG_NAMES[sourceLang] || sourceLang) : "the source language";

    const systemPrompt = `You are a professional translator. Translate the following text to ${targetLangName}. 
Maintain the original meaning, tone, and formatting. 
If the text contains religious or spiritual content, be respectful and accurate.
Only output the translated text, nothing else.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "Translation failed." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim() || "";

    return NextResponse.json({ 
      translatedText,
      targetLang,
      sourceLang: sourceLang || "auto"
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Translation failed." },
      { status: 500 }
    );
  }
}
