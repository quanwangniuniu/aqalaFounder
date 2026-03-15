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

      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a5c3e]/5 to-transparent">
        <div className="absolute inset-0 opacity-5">
          <img src="/app/banner-bg.svg" alt="" className="w-full h-full object-cover" aria-hidden />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-4">
            <Link href="/app" className="hover:text-[#00a651]">Home</Link>
            {" > "}
            <Link href="/app/islamic-calendar" className="hover:text-[#00a651]">Islamic Calendar</Link>
            {" > "}
            <span className="text-gray-600">Special Events</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Islamic Events 2026</h1>
          <p className="text-gray-600 mb-8">All Special Islamic Events 2026</p>

          <div className="space-y-4 mb-12">
            {EVENTS.map((e) => (
              <div key={e.name} className="mp-card-hover p-6 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900">{e.name}</h3>
                  <p className="text-gray-600 text-sm">{e.date} | {e.hijri}</p>
                </div>
                <Link href="/app/prayer-times" className="text-[#00a651] font-semibold hover:underline text-sm shrink-0">
                  View Prayer Times →
                </Link>
              </div>
            ))}
          </div>

          <Link href="/app/prayer-times" className="inline-flex px-6 py-3 rounded-lg bg-[#00a651] text-white font-semibold hover:bg-[#008f44] transition-colors">
            Go to Prayer Times
          </Link>
        </div>
      </section>
    </>
  );
}
