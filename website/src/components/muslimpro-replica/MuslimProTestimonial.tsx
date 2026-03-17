"use client";

const TESTIMONIALS = [
  {
    quote: "Finally I can follow khutbahs in my language. The real-time translation is a game-changer — I used to zone out when the imam spoke Arabic. Now I understand every word. JazakAllahu Khairan to the Aqala team.",
    author: "Yusuf K.",
  },
  {
    quote: "I listen to Quran recitation with Urdu translation side by side. My kids and I use the shared listening room during family time. Aqala has brought us closer to the Book. MashaAllah.",
    author: "Amina R.",
  },
  {
    quote: "As a revert, I struggled with Arabic lectures. Aqala's live translation lets me learn at my own pace. The AI enhancement makes complex terms clearer. May Allah bless this project.",
    author: "James M.",
  },
  {
    quote: "Our mosque uses Aqala for Friday khutbahs — visitors who don't speak Arabic can follow along on their phones. The community feedback has been incredible. BarakAllahu feekum.",
    author: "Imam Hassan",
  },
];

export default function MuslimProTestimonial() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12 text-center">
          What the Community Says About Aqala
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <blockquote className="text-gray-700 leading-relaxed text-sm mb-4 line-clamp-4">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex gap-1 text-[#00a651] text-lg" aria-label="5 stars">
                {[1, 2, 3, 4, 5].map((j) => (
                  <span key={j} aria-hidden>★</span>
                ))}
              </div>
              {t.author !== "—" && (
                <p className="text-xs text-gray-500 mt-2">— {t.author}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
