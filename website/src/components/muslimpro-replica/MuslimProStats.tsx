"use client";

export default function MuslimProStats() {
  const stats = [
    { value: "20+", label: "languages supported" },
    { value: "Real-time", label: "translation as you listen" },
    { value: "Quran", label: "verse detection built-in" },
    { value: "Shared", label: "listening rooms" },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#06402B] border-y border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
          Connecting Through Comprehension
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
