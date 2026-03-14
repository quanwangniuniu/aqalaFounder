import Link from "next/link";

export const metadata = {
  title: "How Aqala Works",
  description:
    "Learn how Aqala works: our sources, AI-powered translation and summarization, and our commitment to transparency.",
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center justify-between max-w-[554px] mx-auto">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-lg font-semibold text-white">How Aqala Works</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-[554px] mx-auto space-y-8">
          {/* How It Works */}
          <section>
            <h2 className="text-base font-semibold text-white mb-2">How Aqala Works</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Aqala helps you understand and engage with Islamic content across languages. We combine
              trusted sources with modern technology to deliver real-time translation, tafsir
              (commentary), and AI-generated summaries—so you can listen, learn, and connect no
              matter what language you speak.
            </p>
          </section>

          {/* Our Sources */}
          <section>
            <h2 className="text-base font-semibold text-white mb-2">Our Sources</h2>
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
              <p className="text-white/80 text-sm leading-relaxed">
                All Quran verses and tafsirs (exegesis) in Aqala come from{" "}
                <a
                  href="https://quran.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4AF37] hover:underline"
                >
                  quran.com
                </a>
                , a widely trusted and verified source for the Quran and its translations.
              </p>
              <p className="text-white/70 text-sm leading-relaxed">
                This ensures the foundational religious text you see is accurate and authoritative.
              </p>
            </div>
          </section>

          {/* AI Transparency */}
          <section>
            <h2 className="text-base font-semibold text-white mb-2">AI Transparency</h2>
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
              <p className="text-white/80 text-sm leading-relaxed">
                We believe in being transparent about how we use technology. Here is how AI is used
                in Aqala:
              </p>
              <ul className="text-white/80 text-sm leading-relaxed space-y-2 list-disc list-inside">
                <li>
                  <strong className="text-white/90">Verses & Tafsirs:</strong> Sourced from quran.com—no AI.
                </li>
                <li>
                  <strong className="text-white/90">Translations:</strong> AI is used to detect speech and
                  automatically translate it into your language. This enables real-time, multilingual
                  listening.
                </li>
                <li>
                  <strong className="text-white/90">Summaries:</strong> Content summaries are generated
                  using AI to help you quickly grasp key points.
                </li>
              </ul>
              <p className="text-white/70 text-sm leading-relaxed pt-1">
                AI translations and summaries are learning aids, not authoritative religious rulings.
                For important decisions or deeper study, we encourage consulting qualified scholars
                and verified sources.
              </p>
            </div>
          </section>

          {/* Verification */}
          <section>
            <h2 className="text-base font-semibold text-white mb-2">Verify Our Sources</h2>
            <p className="text-white/70 text-sm leading-relaxed mb-3">
              You can verify our Quran and tafsir content anytime:
            </p>
            <a
              href="https://quran.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-white/10 hover:border-[#D4AF37]/30 transition-all"
            >
              <span>Visit quran.com</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </section>

          <section className="pt-4 border-t border-white/5">
            <Link
              href="/"
              className="text-white/50 text-sm hover:text-white/70 transition-colors"
            >
              ← Back to Home
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
