"use client";

export default function MuslimProAsSeenOn() {
  const placeholders = ["Media 1", "Media 2", "Media 3", "Media 4"];

  return (
    <section className="py-12 md:py-16 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
          As Seen On
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {placeholders.map((name, i) => (
            <div
              key={i}
              className="h-10 w-24 md:w-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs font-medium"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
