import { NextResponse } from "next/server";

export const runtime = "nodejs";

// POST /api/refine
// Body: { text: string; arabicText?: string; context?: string; fast?: boolean }
export async function POST(req: Request) {
  try {
    const { text, arabicText, context, fast } = await req.json();
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

    const systemPrompt = [
      "You are a precise editor fixing grammar and flow in English translations of Islamic content.",
      "",
      "CRITICAL RULES - NEVER VIOLATE:",
      "",
      "1. Output ONLY what is in the input. NEVER add new sentences, ideas, stories, or content.",
      "2. If input has 2 sentences, output has 2 sentences. If input has 10 words, output has roughly 10 words.",
      "3. Do NOT expand, elaborate, or infer beyond what is explicitly stated.",
      "4. Do NOT add greetings, blessings, advice, or commentary not in the original.",
      "5. Do NOT generate typical khutbah content unless it is LITERALLY in the input.",
      "",
      "Your ONLY job is to:",
      "- Fix grammar and sentence structure",
      "- Correct obvious typos or transcription errors",
      "- Make the existing text flow naturally",
      "- Add appropriate Islamic honorifics (e.g. 'peace be upon him') ONLY where contextually required",
      "",
      "If the input is just 'All praise is due to God Lord of the worlds', output something like:",
      "'All praise is due to Allah, the Lord of all the worlds.'",
      "",
      "Do NOT turn that into a full paragraph about praise and worship.",
      "",
      "Be MINIMAL. Preserve the LENGTH of the input. Fix grammar ONLY.",
    ].join("\n");

    const prefix = arabicText
      ? "The original Arabic meaning must be preserved. If the English is unclear, prioritise the intended Arabic meaning.\n\n"
      : "";

    const parts: string[] = [];
    parts.push("Fix the grammar in this text. Output ONLY the corrected version.");
    parts.push("Do NOT add any new content, sentences, or ideas.");
    parts.push("Keep the same length - if input is short, output is short.");
    parts.push("");
    if (typeof arabicText === "string" && arabicText.trim().length > 0) {
      parts.push("Arabic reference (for word choice only, do not translate or expand):");
      parts.push(arabicText.trim());
      parts.push("");
    }
    parts.push("Text to fix:");
    parts.push(prefix + text);
    parts.push("");
    parts.push("Output the corrected text ONLY. No explanations. No additions.");
    const userPrompt = parts.join("\n");

    const model =
      (fast ? process.env.OPENAI_FAST_MODEL : process.env.OPENAI_MODEL) ||
      (fast ? "gpt-4o-mini" : "gpt-4o");
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
    return NextResponse.json({ result: content });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Unexpected error", detail: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}


