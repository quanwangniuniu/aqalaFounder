"use client";

import Link from "next/link";

const EVENTS = [
  { name: "Eid-Ul-Fitr", date: "Friday, 20 March 2026", hijri: "1 Shawwal 1447" },
  { name: "Eid-Ul-Adha", date: "Saturday, 6 June 2026", hijri: "10 Dhul Hijjah 1447" },
  { name: "Islamic New Year", date: "Tuesday, 7 July 2026", hijri: "1 Muharram 1448" },
  { name: "Ashura", date: "Thursday, 16 July 2026", hijri: "10 Muharram 1448" },
  { name: "Mawlid al-Nabi", date: "Thursday, 3 September 2026", hijri: "12 Rabi al-Awwal 1448" },
];

export default function MuslimProIslamicCalendarPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a5c3e]/5 to-transparent">
        <div className="absolute inset-0 opacity-5">
          <img src="/muslimpro-demo/banner-bg.svg" alt="" className="w-full h-full object-cover" aria-hidden />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Islamic Calendar 2026
          </h1>
          <p className="text-gray-600 mb-6">
            Hijri Calendar 1447-1448
          </p>
          <p className="text-gray-600 mb-8 max-w-2xl">
            Complete Islamic Hijri calendar 2026 (1447-1448) with Ramadan dates, Eid dates, and important Islamic events. Free Gregorian to Hijri date converter and prayer times.
          </p>
        </div>
      </section>

      {/* Special Islamic Days */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Special Islamic Days</h2>
          <div className="space-y-4">
            {EVENTS.map((e) => (
              <div key={e.name} className="mp-card-hover p-6 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900">{e.name}</h3>
                  <p className="text-gray-600 text-sm">{e.date} | {e.hijri}</p>
                </div>
                <Link href="/muslimpro-demo/prayer-times" className="text-[#00a651] font-semibold hover:underline text-sm shrink-0">
                  View Prayer Times →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get the full calendar in the app</h2>
          <p className="text-gray-600 mb-6">Access the complete Hijri calendar with daily prayer times, Ramadan tracker, and more.</p>
          <Link href="/prayers" className="inline-flex px-8 py-4 rounded-lg bg-[#00a651] text-white font-bold hover:bg-[#008f44] transition-colors">
            Download Free App
          </Link>
        </div>
      </section>
    </>
  );
}
