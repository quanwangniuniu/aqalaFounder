"use client";

const rows = [
  {
    metric: "Real-time khutbah understanding",
    aqala: "Built for Islamic lectures and khutbah context",
    others: "General-purpose translation, not Islamic-context optimized",
  },
  {
    metric: "Quran verse detection",
    aqala: "Auto-detects verses and links references",
    others: "No native Quran verse-aware flow",
  },
  {
    metric: "Shared listening rooms",
    aqala: "Live multilingual group listening",
    others: "Typically single-user translation only",
  },
  {
    metric: "Performance in long sessions",
    aqala: "Designed for long-form lectures and events",
    others: "Often optimized for short snippets",
  },
];

export default function MuslimProComparisonSection() {
  return (
    <section className="py-12 md:py-16 bg-[#06402B] border-y border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
          Why Aqala for real-time Islamic translation
        </h2>
        <p className="text-white/80 text-center mb-10 max-w-3xl mx-auto">
          Aqala focuses on comprehension quality and stable performance for Islamic content, compared with generic translation tools.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-lg shadow-black/30">
          <table className="w-full min-w-[760px] bg-[#032117]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white px-5 py-4">Comparison</th>
                <th className="text-left text-[#D4AF37] px-5 py-4">Aqala</th>
                <th className="text-left text-white/90 px-5 py-4">Other Platforms (e.g. Google Translate)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.metric} className="border-b border-white/10 last:border-b-0">
                  <td className="px-5 py-4 text-white font-medium">{row.metric}</td>
                  <td className="px-5 py-4 text-white/90">{row.aqala}</td>
                  <td className="px-5 py-4 text-white/70">{row.others}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
