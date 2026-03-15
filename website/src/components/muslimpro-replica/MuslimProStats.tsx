"use client";

export default function MuslimProStats() {
  const stats = [
    { value: "180+ million", label: "downloads and growing" },
    { value: "9.7M users", label: "on Day 1 of Ramadan 2024" },
    { value: "4.7 Stars", label: "review on App Store" },
    { value: "4.2 Stars", label: "reviews on Play Store" },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#00a651]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
          The Digital Home for All Things Muslim
        </h2>
        <p className="text-white/90 text-center mb-12 max-w-2xl mx-auto">
          Aqala connects people through comprehension — real-time translation for Qur&apos;an, khutbahs, and Islamic lectures across 20+ languages.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-white/80 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
