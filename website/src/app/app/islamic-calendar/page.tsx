"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePrayer } from "@/contexts/PrayerContext";
import { formatPrayerTime } from "@/lib/prayer/calculations";
import { gregorianToHijri, hijriToGregorian } from "@/lib/prayer/calendar";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";

const PRAYER_ORDER = [
  { key: "fajr" as const, label: "Fajr", icon: "/app/fajr.svg" },
  { key: "dhuhr" as const, label: "Zuhr", icon: "/app/zuhr.svg" },
  { key: "asr" as const, label: "Asr", icon: "/app/asr.svg" },
  { key: "maghrib" as const, label: "Maghrib", icon: "/app/magrib.svg" },
  { key: "isha" as const, label: "Isha", icon: "/app/isha.svg" },
];

// March 2026 calendar grid
const MARCH_2026_DAYS = [
  { day: 1, hijri: "12", gregorian: "1" },
  { day: 2, hijri: "13", gregorian: "2" },
  { day: 3, hijri: "14", gregorian: "3" },
  { day: 4, hijri: "15", gregorian: "4" },
  { day: 5, hijri: "16", gregorian: "5" },
  { day: 6, hijri: "17", gregorian: "6" },
  { day: 7, hijri: "18", gregorian: "7" },
  { day: 8, hijri: "19", gregorian: "8" },
  { day: 9, hijri: "20", gregorian: "9" },
  { day: 10, hijri: "21", gregorian: "10" },
  { day: 11, hijri: "22", gregorian: "11" },
  { day: 12, hijri: "23", gregorian: "12" },
  { day: 13, hijri: "24", gregorian: "13" },
  { day: 14, hijri: "25", gregorian: "14" },
  { day: 15, hijri: "26", gregorian: "15" },
  { day: 16, hijri: "27", gregorian: "16" },
  { day: 17, hijri: "28", gregorian: "17" },
  { day: 18, hijri: "29", gregorian: "18" },
  { day: 19, hijri: "30", gregorian: "19" },
  { day: 20, hijri: "1", gregorian: "20" },
  { day: 21, hijri: "2", gregorian: "21" },
  { day: 22, hijri: "3", gregorian: "22" },
  { day: 23, hijri: "4", gregorian: "23" },
  { day: 24, hijri: "5", gregorian: "24" },
  { day: 25, hijri: "6", gregorian: "25" },
  { day: 26, hijri: "7", gregorian: "26" },
  { day: 27, hijri: "8", gregorian: "27" },
  { day: 28, hijri: "9", gregorian: "28" },
  { day: 29, hijri: "10", gregorian: "29" },
  { day: 30, hijri: "11", gregorian: "30" },
  { day: 31, hijri: "12", gregorian: "31" },
];

function usePremiumCountdown() {
  const [remaining, setRemaining] = useState({ h: 11, m: 36, s: 16 });
  useEffect(() => {
    const t = setInterval(() => {
      setRemaining((r) => {
        let { h, m, s } = r;
        s--;
        if (s < 0) {
          s = 59;
          m--;
          if (m < 0) {
            m = 59;
            h = Math.max(0, h - 1);
          }
        }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return remaining;
}

export default function MuslimProIslamicCalendarPage() {
  const { prayerTimes, nextPrayer, timeUntilNext, loading, location } = usePrayer();
  const locationLabel = location?.city && location?.country ? `${location.city}, ${location.country}` : "Pasadena, United States";
  const countdown = usePremiumCountdown();
  const [convertMode, setConvertMode] = useState<"g2h" | "h2g">("g2h");
  const [gDate, setGDate] = useState({ day: 14, month: 3, year: 2026 });
  const [hDate, setHDate] = useState({ day: 25, month: 9, year: 1447 });
  const [convertedResult, setConvertedResult] = useState("25 Ramadan 1447");
  const [convertLoading, setConvertLoading] = useState(false);

  const isNextPrayer = (label: string) =>
    nextPrayer?.name === label || (nextPrayer?.name === "Dhuhr" && label === "Zuhr");

  return (
    <>
      <MuslimProAppBar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#032117]">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Islamic Calendar 2026
          </h1>
          <p className="text-white/70 mb-8">
            in {location?.country || "United States"} 25 Ramadan 1447
          </p>

          {/* Month grid - March 2026 */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">March</h2>
              <span className="text-white/70">2026</span>
            </div>
            <p className="text-sm text-white/60 mb-4">March 2026</p>
            <p className="text-sm text-white/60 mb-4">Ramadhan 1447 - Shawwal 1447</p>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="font-semibold text-white/60 py-2">
                  {d}
                </div>
              ))}
              {Array.from({ length: 6 }, (_, i) => (
                <div key={`empty-${i}`} className="py-2" />
              ))}
              {MARCH_2026_DAYS.map((d) => (
                <div
                  key={d.day}
                  className={`py-2 rounded-lg ${d.day === 14 ? "bg-[#D4AF37]/30 font-semibold text-[#D4AF37]" : "text-white/90"}`}
                >
                  <span className="block text-xs text-white/50">{d.hijri}</span>
                  <span>{d.gregorian}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-white/60 mt-4">See the full calendar in the app</p>
            <Link
              href="/listen"
              className="inline-flex mt-4 px-6 py-3 rounded-full bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] transition-colors"
            >
              Open in Browser
            </Link>
          </div>
        </div>
      </section>

      {/* Premium banner */}
      <section className="py-8 md:py-12 bg-[#06402B] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Best Premium Offer — Limited Time!</h2>
          <p className="text-white/95 mb-4">Remove ads. Unlock Quran. Stay consistent.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <span className="text-[#D4AF37] font-mono font-bold text-lg tabular-nums">
              {String(countdown.h).padStart(2, "0")} Hr : {String(countdown.m).padStart(2, "0")} Min : {String(countdown.s).padStart(2, "0")} Sec
            </span>
          </div>
          <Link href="/subscription" className="inline-flex px-8 py-4 rounded-lg bg-[#D4AF37] text-[#032117] font-bold hover:bg-[#E8D5A3] transition-colors">
            Upgrade to Premium
          </Link>
        </div>
      </section>

      {/* Prayer times widget */}
      <section className="py-12 md:py-16 bg-[#032117]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {PRAYER_ORDER.map(({ key, label, icon }) => (
              <div key={key} className="mp-card-hover text-center p-4 rounded-xl bg-white/5 border border-white/10">
                <img src={icon} alt="" className="w-8 h-8 mx-auto mb-1 opacity-80 invert" />
                <p className="font-semibold text-white text-sm">{label}</p>
                {loading || !prayerTimes ? (
                  <p className="text-white/40 text-sm">--:--</p>
                ) : (
                  <>
                    <p className="text-[#D4AF37] font-medium text-sm">{formatPrayerTime(prayerTimes[key])}</p>
                    {isNextPrayer(label) && (
                      <p className="text-xs text-[#D4AF37] mt-0.5">Next in {timeUntilNext}</p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          <Link href="/app/prayer-times" className="text-[#D4AF37] font-semibold hover:underline">
            Prayer Times in {locationLabel} →
          </Link>
        </div>
      </section>

      {/* Gregorian ⇄ Hijri converter */}
      <section className="py-12 md:py-16 bg-[#032117]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            {convertMode === "g2h" ? "Gregorian Calendar to Hijri" : "Hijri Calendar to Gregorian"}
          </h2>
          <button
            type="button"
            onClick={() => setConvertMode((m) => (m === "g2h" ? "h2g" : "g2h"))}
            className="text-[#D4AF37] font-medium hover:underline mb-6"
          >
            ⇄ Switch
          </button>
          <p className="text-white/70 mb-4">Select a date to convert</p>
          {convertMode === "g2h" ? (
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <input
                type="number"
                min={1}
                max={31}
                value={gDate.day}
                onChange={(e) => setGDate((d) => ({ ...d, day: parseInt(e.target.value) || 1 }))}
                className="w-16 px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white"
              />
              <select
                value={gDate.month}
                onChange={(e) => setGDate((d) => ({ ...d, month: parseInt(e.target.value) }))}
                className="px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white"
              >
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                value={gDate.year}
                onChange={(e) => setGDate((d) => ({ ...d, year: parseInt(e.target.value) || 2026 }))}
                className="w-20 px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white"
              />
              <button
                type="button"
                disabled={convertLoading}
                onClick={async () => {
                  setConvertLoading(true);
                  try {
                    const r = await gregorianToHijri(gDate.day, gDate.month, gDate.year);
                    setConvertedResult(r);
                  } catch {
                    setConvertedResult("—");
                  } finally {
                    setConvertLoading(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] disabled:opacity-60"
              >
                {convertLoading ? "..." : "Convert"}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <input
                type="number"
                min={1}
                max={30}
                value={hDate.day}
                onChange={(e) => setHDate((d) => ({ ...d, day: parseInt(e.target.value) || 1 }))}
                className="w-16 px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white"
              />
              <select
                value={hDate.month}
                onChange={(e) => setHDate((d) => ({ ...d, month: parseInt(e.target.value) }))}
                className="px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white"
              >
                {["Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani", "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Shaban", "Ramadan", "Shawwal", "Dhul Qadah", "Dhul Hijjah"].map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                value={hDate.year}
                onChange={(e) => setHDate((d) => ({ ...d, year: parseInt(e.target.value) || 1447 }))}
                className="w-20 px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white"
              />
              <button
                type="button"
                disabled={convertLoading}
                onClick={async () => {
                  setConvertLoading(true);
                  try {
                    const r = await hijriToGregorian(hDate.day, hDate.month, hDate.year);
                    setConvertedResult(r);
                  } catch {
                    setConvertedResult("—");
                  } finally {
                    setConvertLoading(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] disabled:opacity-60"
              >
                {convertLoading ? "..." : "Convert"}
              </button>
            </div>
          )}
          <p className="text-sm text-white/60">There is a small probability of one day error</p>
          <p className="mt-4 font-semibold text-white">Converted: {convertedResult}</p>
        </div>
      </section>

      {/* The Islamic Calendar article */}
      <section className="py-12 md:py-16 bg-[#06402B]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6">The Islamic Calendar</h2>
          <h3 className="text-lg font-semibold text-white mb-2">The Hijri Calendar: A Lunar System</h3>
          <p className="text-white/80 mb-4">
            The Islamic calendar, also known as the Hijri calendar (1446 AH), is based on the phases of the moon, unlike the solar-based Gregorian calendar. Its starting point is the Hijrah, which was the Prophet Muhammad&apos;s migration to Medina. A new month officially begins when the new moon is sighted at the close of the previous month. Because the start of each month depends on this lunar sighting, the calendar provides an estimated, rather than a fixed, schedule for upcoming Islamic dates.
          </p>
          <h3 className="text-lg font-semibold text-white mb-2">Calendar Structure and Months</h3>
          <p className="text-white/80 mb-4">
            Like the Gregorian calendar, the Islamic year has 12 months. However, it is shorter, with each year containing approximately 354 to 355 days compared to the 365 or 366 days of the Gregorian calendar. The months in order are: Muharram, Safar, Rabi al-Awwal, Rabi al-Thani, Jumada al-Awwal, Jumada al-Thani, Rajab, Shaban, Ramadan, Shawwal, Dhul Qadah, and Dhul Hijjah.
          </p>
          <h3 className="text-lg font-semibold text-white mb-2">Sacred Months</h3>
          <p className="text-white/80 mb-4">
            Four months in the Islamic calendar are considered sacred, and it&apos;s forbidden to wage war during them. As stated in a narration from the Prophet (PBUH) found in Bukhari (3197), these months are: &apos;Dhul-Qa&apos;dah, Dhul-Hijjah, and Muharram, which occur in succession, and the fourth is Rajab.&apos;
          </p>
          <h3 className="text-lg font-semibold text-white mb-2">Important Events and Online Resources</h3>
          <p className="text-white/80 mb-6">
            Key Islamic holidays and major events, such as Eid al-Fitr, Hajj, and Eid al-Adha, are determined by the dates of the Hijri calendar. The Aqala app and website provides these dates, which allow you to easily convert dates between the Hijri and Gregorian systems. Many of these resources let you view both calendars side-by-side for convenience. This makes it simple to plan for Islamic holidays and events.
          </p>
          <Link href="/listen" className="inline-flex px-8 py-4 rounded-lg bg-[#D4AF37] text-[#032117] font-bold hover:bg-[#E8D5A3] transition-colors">
            Open in Browser
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-[#032117]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Your Prayer and Quran Companion</h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Let Aqala guide your day with accurate prayer times, real-time Quran translation, and meaningful Islamic reminders. Get real-time Adhan alerts, understand khutbahs and lectures in your language, and stay inspired every step of the way.
          </p>
          <Link href="/listen" className="inline-flex px-8 py-4 rounded-lg bg-[#D4AF37] text-[#032117] font-bold hover:bg-[#E8D5A3] transition-colors">
            Open in Browser
          </Link>
        </div>
      </section>
    </>
  );
}
