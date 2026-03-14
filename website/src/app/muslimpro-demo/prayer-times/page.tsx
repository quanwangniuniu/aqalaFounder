"use client";

import Link from "next/link";
import { usePrayer } from "@/contexts/PrayerContext";
import { formatPrayerTime } from "@/lib/prayer/calculations";

const PRAYER_ORDER = [
  { key: "fajr" as const, label: "Fajr" },
  { key: "dhuhr" as const, label: "Zuhr" },
  { key: "asr" as const, label: "Asr" },
  { key: "maghrib" as const, label: "Maghrib" },
  { key: "isha" as const, label: "Isha" },
];

const WEEK_MOCK = [
  { date: "Sun, Mar 08", hijri: "18, Ram", fajr: "05:24", zuhr: "01:11", asr: "04:29", maghrib: "07:26", isha: "08:56" },
  { date: "Mon, Mar 09", hijri: "19, Ram", fajr: "05:26", zuhr: "01:10", asr: "04:28", maghrib: "07:24", isha: "08:54" },
  { date: "Tue, Mar 10", hijri: "20, Ram", fajr: "05:27", zuhr: "01:10", asr: "04:28", maghrib: "07:22", isha: "08:52" },
  { date: "Wed, Mar 11", hijri: "21, Ram", fajr: "05:28", zuhr: "01:10", asr: "04:27", maghrib: "07:21", isha: "08:51" },
  { date: "Thu, Mar 12", hijri: "22, Ram", fajr: "05:29", zuhr: "01:10", asr: "04:26", maghrib: "07:19", isha: "08:49" },
  { date: "Fri, Mar 13", hijri: "23, Ram", fajr: "05:30", zuhr: "01:10", asr: "04:26", maghrib: "07:18", isha: "08:48" },
  { date: "Sat, Mar 14", hijri: "24, Ram", fajr: "05:31", zuhr: "01:10", asr: "04:25", maghrib: "07:17", isha: "08:47" },
];

export default function MuslimProPrayerTimesPage() {
  const { prayerTimes, nextPrayer, timeUntilNext, loading, location } = usePrayer();
  const locationLabel = location?.city && location?.country ? `${location.city}, ${location.country}` : "Sydney, Australia";

  return (
    <>
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Prayer Times in {locationLabel}
          </h1>
          <p className="text-gray-600 mb-6">
            Saturday, 14 March 2026 | 24 Ramadan 1447
          </p>
          <p className="text-sm text-gray-500 mb-8">Muslim World League (MWL)</p>

          {/* Today's times */}
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8 mb-12">
            <p className="text-sm text-gray-500 mb-4">Imsak 5:31am | Iftar 7:17pm</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {PRAYER_ORDER.map(({ key, label }) => (
                <div key={key} className="text-center p-4 rounded-xl bg-white border border-gray-200">
                  <p className="font-semibold text-gray-900 mb-1">{label}</p>
                  {loading || !prayerTimes ? (
                    <p className="text-gray-400">--:--</p>
                  ) : (
                    <p className="text-[#00a651] font-medium">{formatPrayerTime(prayerTimes[key])}</p>
                  )}
                  {nextPrayer?.name === label && (
                    <p className="text-xs text-gray-500 mt-1">in {timeUntilNext}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Weekly table */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Prayer times in {locationLabel.split(",")[0]} for this week</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-3 font-semibold text-gray-900">Date (Hijri)</th>
                  <th className="py-3 font-semibold text-gray-900">Fajr</th>
                  <th className="py-3 font-semibold text-gray-900">Zuhr</th>
                  <th className="py-3 font-semibold text-gray-900">Asr</th>
                  <th className="py-3 font-semibold text-gray-900">Maghrib</th>
                  <th className="py-3 font-semibold text-gray-900">Isha</th>
                </tr>
              </thead>
              <tbody>
                {WEEK_MOCK.map((row) => (
                  <tr key={row.date} className="border-b border-gray-100">
                    <td className="py-3 text-gray-700">{row.date}</td>
                    <td className="py-3 text-gray-700">{row.hijri}</td>
                    <td className="py-3 text-center">{row.fajr}</td>
                    <td className="py-3 text-center">{row.zuhr}</td>
                    <td className="py-3 text-center">{row.asr}</td>
                    <td className="py-3 text-center">{row.maghrib}</td>
                    <td className="py-3 text-center">{row.isha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-4">See the full calendar in the app</p>
          <Link href="/prayers" className="inline-flex mt-6 px-6 py-3 rounded-full bg-[#00a651] text-white font-semibold hover:bg-[#008f44]">
            Download Free App
          </Link>
        </div>
      </section>
    </>
  );
}
