"use client";

const rows = [
  {
    feature: "Khutbah & Lecture Understanding",
    aqala: "Purpose-built for Islamic lectures and khutbahs, preserving meaning and context within the Islamic space.",
    generic:
      "General-purpose translation. Limited understanding of Islamic context. Misrepresentation of individual words.",
  },
  {
    feature: "Quran Verse Detection",
    aqala:
      "Automatically detects verses and produces an interactive reference that enables deeper exploration and understanding.",
    generic: "No native Quran-aware detection or structured verse recognition.",
  },
  {
    feature: "Contextual Accuracy",
    aqala:
      "Designed to convey meaning with care, complementary to the depth of Islamic content and scripts.",
    generic:
      "Often literal, lacking nuance. Underperforming contextual understanding. Translates word by word, therefore losing context of phrases and body texts.",
  },
  {
    feature: "Performance in Long Sessions",
    aqala:
      "Optimised for stability during extended lectures and live events. Purpose built for extended performance requirements.",
    generic:
      "Often tuned for short snippets and short conversational communication, less reliable over long sessions.",
  },
  {
    feature: "Purpose & Focus",
    aqala: "Built specifically for the Ummah, with Islamic use cases and knowledge at its core.",
    generic: "Built for general use across all content types.",
  },
  {
    feature: "Intention",
    aqala: "Built for Muslims, by Muslims. Thoughtfully designed to reflect Islamic values in every detail.",
    generic: "Other platforms lack this intentional focus and cultural grounding.",
  },
];

export default function MuslimProComparisonSection() {
  return (
    <section className="py-12 md:py-16 bg-[#06402B] border-y border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6">
          Why should I pick Aqala and not turn back?
        </h2>

        <div className="max-w-3xl mx-auto text-center mb-10 space-y-5 text-white/80 leading-relaxed">
          <h3 className="text-lg font-semibold text-[#D4AF37]">Our intention.</h3>
          <p className="text-white font-medium">Aqala is built for understanding, not just translation</p>
          <p>
            Aqala goes beyond basic translation by combining deep contextual accuracy with stable, real-time performance,
            purposefully designed for Islamic content &amp; conversation.
          </p>
          <p>Every word is delivered with clarity and care, preserving the depth, meaning, and essence behind what you hear.</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-lg shadow-black/30">
          <table className="w-full min-w-[720px] bg-[#032117] text-sm md:text-base">
            <thead>
              <tr className="border-b border-white/10 bg-[#021a12]">
                <th className="text-left text-white font-semibold px-4 md:px-5 py-4 w-[22%]">Feature</th>
                <th className="text-left text-[#D4AF37] font-semibold px-4 md:px-5 py-4 w-[39%]">Aqala</th>
                <th className="text-left text-white/90 font-semibold px-4 md:px-5 py-4 w-[39%]">
                  Generic Translation Tools
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature} className="border-b border-white/10 last:border-b-0 align-top">
                  <td className="px-4 md:px-5 py-4 text-white font-medium">{row.feature}</td>
                  <td className="px-4 md:px-5 py-4 text-white/90 leading-relaxed">{row.aqala}</td>
                  <td className="px-4 md:px-5 py-4 text-white/70 leading-relaxed">{row.generic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
