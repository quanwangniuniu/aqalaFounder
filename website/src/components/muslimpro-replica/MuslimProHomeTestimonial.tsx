"use client";

const REVIEWS = [
  {
    quote:
      "Finally I can follow khutbahs in my language. The real-time translation is a game-changer — I used to zone out when the imam spoke Arabic. Now I understand every word. JazakAllahu Khairan to the Aqala team.",
    author: "Yusuf K.",
  },
  {
    quote:
      "I listen to Quran recitation with Urdu translation side by side. Aqala has brought my family closer to the Book. MashaAllah.",
    author: "Amina R.",
  },
  {
    quote:
      "As a revert, I struggled with Arabic lectures. Aqala's live translation lets me learn at my own pace. The AI enhancement makes complex terms clearer. May Allah bless this project.",
    author: "James M.",
  },
];

export default function MuslimProHomeTestimonial() {
  return (
    <section className="py-16 md:py-24 bg-[#032117] border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">What listeners say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {REVIEWS.map((r) => (
            <div
              key={r.author}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center md:text-left"
            >
              <blockquote className="text-white/90 leading-relaxed text-sm md:text-base flex-1 mb-4">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <p className="text-[#D4AF37] text-lg mb-1 tracking-tight" aria-label="5 out of 5 stars">
                ★★★★★
              </p>
              <p className="text-white/60 text-sm font-medium">— {r.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
