"use client";

import Link from "next/link";
import { usePrayer } from "@/contexts/PrayerContext";
import { formatPrayerTime } from "@/lib/prayer/calculations";

const PRAYER_ORDER: { key: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha"; label: string }[] = [
  { key: "fajr", label: "Fajr" },
  { key: "dhuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
];

export default function MuslimProPrayerSection() {
  const { prayerTimes, nextPrayer, timeUntilNext, loading, location } = usePrayer();

  const locationLabel = location?.city && location?.country
    ? `${location.city}, ${location.country}`
    : location?.city || location?.country || "Enable location";

  return (
    <section id="prayer-times" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Verified Prayer Times, Qibla & Adhan Notifications
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Aqala offers accurate prayer times alongside real-time translation. Stay on schedule and understand Islamic content in your language.
            </p>
            {nextPrayer && (
              <p className="text-[#00a651] font-semibold mb-4">
                Next: {nextPrayer.name} in {timeUntilNext}
              </p>
            )}
            <Link
              href="/prayers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#00a651] text-white font-semibold hover:bg-[#008f44] transition-colors"
            >
              Get Prayer Times
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          </div>
          <div className="flex-1 w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <p className="text-sm text-gray-500 mb-4">Today&apos;s Prayer Times</p>
              {loading ? (
                <div className="space-y-3">
                  {PRAYER_ORDER.map(({ label }) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="font-medium text-gray-900">{label}</span>
                      <span className="text-gray-400 animate-pulse">--:--</span>
                    </div>
                  ))}
                </div>
              ) : prayerTimes ? (
                <div className="space-y-3">
                  {PRAYER_ORDER.map(({ key, label }) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="font-medium text-gray-900">{label}</span>
                      <span className="text-gray-600">{formatPrayerTime(prayerTimes[key])}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-4">
                  Enable location to see prayer times, or{" "}
                  <Link href="/prayers" className="text-[#00a651] hover:underline">
                    set manually
                  </Link>
                  .
                </p>
              )}
              <p className="text-xs text-gray-400 mt-4">Location: {locationLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
