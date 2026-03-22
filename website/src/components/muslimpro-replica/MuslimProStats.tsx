"use client";

const highlights = [
  "98% Translation Accuracy — Powered by Contextual-Aware Islamic AI.",
  "Private, encrypted real-time processing & content saving. On your terms.",
  "Globally known, actively used in 22+ countries worldwide.",
  "Translated over 22,000min+ of Islamic content to users, knowledge in mind-boggling volume.",
  "20+ Languages supported ensuring you understand.",
];

export default function MuslimProStats() {
  return (
    <section className="py-16 md:py-24 bg-[#06402B] border-y border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-5">
          Deepening Devotion Through Understanding
        </h2>
        <p className="text-white/90 text-center mb-12 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          Aqala breaks language barriers in real-time. Whether it&apos;s a Friday khutbah or a deep-dive lecture, experience
          the message in your language as it&apos;s spoken.
        </p>

        <ul className="max-w-3xl mx-auto space-y-5 md:space-y-6">
          {highlights.map((text) => (
            <li
              key={text}
              className="flex gap-4 rounded-2xl border border-white/10 bg-[#032117]/60 px-5 py-4 md:px-6 md:py-5"
            >
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#D4AF37]" aria-hidden />
              <p className="text-white/85 text-sm md:text-base leading-relaxed">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
