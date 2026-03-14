"use client";

const TESTIMONIALS = [
  {
    quote: "It's the best Islamic app I've ever come across, it's super duper. Love it so much. Upgrading to the premium is the best decision I've taken in a long time. Jazakallahu khairan! May Allah reward the developers of this app with jannatul firdausi.",
    author: "Isa A.",
  },
  {
    quote: "I love this app with all my heart, as a Muslim it helps me find mosque's near me, what the times to pray are all over the world. It has so many different abilities, you should download and see for yourself. It might be even better in the future.",
    author: "Amhar O.",
  },
  {
    quote: "Jazakalla khair ya ikhwa. This app is wonderfully designed and only seems to get better! Perfect for the Muslim living in the west where there are so many different distractions and influences pulling one in many different directions. May Allah grant the brothers and sisters who have contributed to this app a high place in Jannah! Ameen!",
    author: "Moe T.",
  },
  {
    quote: "MashaAllah, a great source of reflection, learning, ibadah and being on track, whether it is praying on time or following your Deen in all aspects! May Allah reward the makers of the app. Immensely, InshaAllah and Ameen",
    author: "—",
  },
];

export default function MuslimProTestimonial() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12 text-center">
          What Members Say
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
