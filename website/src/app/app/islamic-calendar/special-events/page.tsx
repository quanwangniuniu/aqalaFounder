"use client";

import Link from "next/link";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";

const EVENTS = [
  { name: "Eid-Ul-Fitr", date: "Friday, 20 March 2026", hijri: "1 Shawwal 1447" },
  { name: "Eid-Ul-Adha", date: "Saturday, 6 June 2026", hijri: "10 Dhul Hijjah 1447" },
  { name: "Islamic New Year", date: "Tuesday, 7 July 2026", hijri: "1 Muharram 1448" },
  { name: "Ashura", date: "Thursday, 16 July 2026", hijri: "10 Muharram 1448" },
  { name: "Mawlid al-Nabi", date: "Thursday, 3 September 2026", hijri: "12 Rabi al-Awwal 1448" },
  { name: "Laylat al-Qadr", date: "~19–27 Ramadan 1447", hijri: "27 Ramadan 1447" },
];

export default function MuslimProSpecialEventsPage() {
  return (
    <>
      <MuslimProAppBar />

      <section className="relative overflow-hidden bg-[#032117]">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-white/60 mb-4">
            <Link href="/app" className="hover:text-[#D4AF37]">Home</Link>
            {" > "}
            <Link href="/app/islamic-calendar" className="hover:text-[#D4AF37]">Islamic Calendar</Link>
            {" > "}
            <span className="text-white/80">Special Events</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Islamic Events 2026</h1>
          <p className="text-white/70 mb-8">All Special Islamic Events 2026</p>

          <div className="space-y-4 mb-12">
            {EVENTS.map((e) => (
              <div key={e.name} className="mp-card-hover p-6 rounded-2xl border border-white/10 bg-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white">{e.name}</h3>
                  <p className="text-white/70 text-sm">{e.date} | {e.hijri}</p>
                </div>
                <Link href="/app/prayer-times" className="text-[#D4AF37] font-semibold hover:underline text-sm shrink-0">
                  View Prayer Times →
                </Link>
              </div>
            ))}
          </div>

          <Link href="/app/prayer-times" className="inline-flex px-6 py-3 rounded-lg bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] transition-colors">
            Go to Prayer Times
          </Link>
        </div>
      </section>
    </>
  );
}
