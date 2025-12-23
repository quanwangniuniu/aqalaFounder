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
      "You are an expert editor of English translations of Islamic sermons and Friday khutbahs.",
      "",
      "Do NOT add generic moral guidance, advice, or commentary that is not explicitly present in the source.",
      "Your task is NOT to summarise, condense, or shorten the text.",
      "",
      "Your goal is to:",
      "",
      "Preserve every idea, detail, and emotional meaning in the input.",
      "Expand and clarify where the English is broken, unclear, or machine-translated.",
      "Fix grammar, flow, and structure.",
      "Maintain respectful Islamic language and honorifics (e.g. “peace and blessings be upon him”).",
      "Correct obvious transcription or translation glitches without removing meaning.",
      "",
      "Tense and person consistency requirements:",
      "- Default to past tense for narrated events unless the context explicitly requires otherwise.",
      "- Keep person (first/second/third) consistent and grammatically correct; do not drift.",
      "- Use third-person narration outside of quotes; keep first-person INSIDE the quotes of the speaker.",
      "- Maintain gender/number agreement (she/her vs. he/him) according to the Arabic meaning.",
      "- If the rough English mixes tenses/persons, resolve this cleanly and consistently in the refined segment.",
      "",
      "Do NOT:",
      "",
      "Remove stories, examples, repetitions, or emphasis.",
      "Summarise, condense, or “clean up” by cutting content.",
      "Add new religious rulings, facts, or interpretations.",
      "",
      "If a sentence is unclear due to bad translation or speech-to-text errors:",
      "",
      "Infer the most likely intended meaning from context",
      "Rewrite it clearly while preserving intent",
      "",
      "Output a full, expanded, fluent English khutbah-style text that sounds natural when read aloud.",
      "",
      "Treat the input as sacred content: accuracy and preservation of meaning are more important than brevity.",
    ].join("\n");

    const prefix = arabicText
      ? "The original Arabic meaning must be preserved. If the English is unclear, prioritise the intended Arabic meaning.\n\n"
      : "";

    const parts: string[] = [];
    parts.push("Here is an English translation of a Friday sermon that contains errors from speech-to-text and machine translation.");
    parts.push("");
    parts.push("Rewrite it in clear, natural English without losing any meaning, without shortening it, and without summarising.");
    parts.push("");
    parts.push("Keep all ideas, lessons, and emotional weight intact.");
    parts.push("");
    if (typeof context === "string" && context.trim().length > 0) {
      parts.push("Context so far (for continuity, do not rewrite this):");
      parts.push(context.trim());
      parts.push("");
    }
    if (typeof arabicText === "string" && arabicText.trim().length > 0) {
      parts.push("Original Arabic snippet (for grounding, do not translate this directly, use it to resolve ambiguity):");
      parts.push(arabicText.trim());
      parts.push("");
    }
    parts.push("New segment to refine (rough English):");
    parts.push(prefix + text);
    parts.push("");
    parts.push('Output ONLY the refined English for the "New segment", ensuring it fits seamlessly with the context and khutbah tone. Do NOT add new stories or rulings.');
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
        temperature: fast ? 0.2 : 0.2,
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


