"use client";

import Link from "next/link";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";

export default function IslamicCalendarFeaturePage() {
  return (
    <>
      <MuslimProAppBar />
      <main className="min-h-screen bg-[#032117]">
        <section className="pt-12 md:pt-20 pb-12 md:pb-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
              Islamic Calendar
            </h1>
            <p className="text-white/75 text-base md:text-lg leading-relaxed mb-8">
              Stay aligned with the Ummah. View Hijri dates, convert between Gregorian and Islamic calendars, and keep
              track of special events — Ramadan, Eid, and key Islamic occasions throughout the year.
            </p>
            <Link
              href="/app/islamic-calendar"
              className="inline-flex px-6 py-3 md:px-8 md:py-4 rounded-xl bg-[#D4AF37] text-[#032117] font-bold hover:bg-[#b8944d] transition-colors mp-btn-hover"
            >
              View Islamic Calendar →
            </Link>
          </div>
        </section>
        <section className="py-8 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <Link href="/app/features" className="text-white/60 hover:text-[#D4AF37] transition-colors text-sm">
              ← Back to all features
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
