"use client";

import Link from "next/link";

// Aqala features with inline SVG icons
const FEATURES = [
  { title: "Real-time Translation", href: "/listen", Icon: IconTranslate },
  { title: "Quran Detection", href: "/listen", Icon: IconQuran },
  { title: "Prayer Times", href: "/app/prayer-times", Icon: IconPrayer },
  { title: "Islamic Calendar", href: "/app/islamic-calendar", Icon: IconCalendar },
  { title: "Blog & Articles", href: "/app/blog", Icon: IconBlog },
  { title: "Quran Explorer", href: "/app/quran", Icon: IconQuran },
  { title: "Support Us", href: "/donate", Icon: IconDonate },
];

function IconTranslate({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
  );
}
function IconQuran({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
function IconPrayer({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function IconBlog({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );
}
function IconDonate({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

export default function MuslimProFeaturesGrid() {
  return (
    <section className="py-16 md:py-24 bg-[#032117]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-12 text-center">
          All Features in the Aqala App
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8">
          {FEATURES.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group mp-card-hover flex flex-col items-center text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/30 transition-colors"
            >
              <div className="mp-img-hover w-24 h-24 md:w-32 md:h-32 mb-3 flex items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] group-hover:bg-[#D4AF37]/20 transition-colors">
                <f.Icon className="w-12 h-12 md:w-16 md:h-16 group-hover:scale-105 transition-transform duration-300" />
              </div>
              <span className="text-sm font-medium text-white group-hover:text-[#D4AF37] transition-colors">
                {f.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
