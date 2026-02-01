"use client";

import { usePrayer } from "@/contexts/PrayerContext";
import { formatPrayerTime, getMethodName } from "@/lib/prayer/calculations";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrayersPage() {
  const { isRTL } = useLanguage();
  const {
    prayerTimes,
    settings,
    location,
    loading,
    error,
    nextPrayer,
    currentPrayer,
    timeUntilNext,
    refreshLocation,
    refreshPrayerTimes,
  } = usePrayer();

  const prayers = prayerTimes
    ? [
        { name: "Fajr", nameAr: "الفجر", time: prayerTimes.fajr },
        { name: "Sunrise", nameAr: "الشروق", time: prayerTimes.sunrise, isSunrise: true },
        { name: "Dhuhr", nameAr: "الظهر", time: prayerTimes.dhuhr },
        { name: "Asr", nameAr: "العصر", time: prayerTimes.asr },
        { name: "Maghrib", nameAr: "المغرب", time: prayerTimes.maghrib },
        { name: "Isha", nameAr: "العشاء", time: prayerTimes.isha },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#032117] text-white" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/" 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold">Prayer Times</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/qibla"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
                </svg>
                <span className="text-xs font-medium">Qibla</span>
              </Link>
              <Link
                href="/prayers/settings"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Location Info */}
        {location && !loading && (
          <button 
            onClick={refreshLocation}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <span>{location.city ? `${location.city}, ${location.country}` : "Update location"}</span>
          </button>
        )}

        {/* Next Prayer Hero Card */}
        {nextPrayer && !loading && !error && (
          <section className="bg-gradient-to-br from-[#0a5c3e] to-[#053521] rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Next Prayer</p>
                <p className="text-3xl font-bold text-[#D4AF37]">{nextPrayer.name}</p>
                <p className="text-sm text-white/60 mt-1">in {timeUntilNext}</p>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mb-2">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <p className="text-2xl font-light text-white">{formatPrayerTime(nextPrayer.time)}</p>
              </div>
            </div>
          </section>
        )}

        {/* Loading State */}
        {loading && (
          <section className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-2 border-white/20 border-t-[#D4AF37] rounded-full animate-spin" />
            </div>
            <p className="text-white/50">Getting your location...</p>
            <p className="text-xs text-white/30 mt-2">Please allow location access</p>
          </section>
        )}

        {/* Error State */}
        {error && (
          <section className="bg-red-500/5 rounded-2xl p-5 border border-red-500/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-red-400 text-sm font-medium mb-1">Location Required</p>
                <p className="text-white/50 text-xs mb-4">{error}</p>
                <div className="flex gap-2">
                  <button
                    onClick={refreshLocation}
                    className="px-4 py-2 text-sm bg-white/10 hover:bg-white/15 rounded-xl transition-colors"
                  >
                    Retry Location
                  </button>
                  <button
                    onClick={refreshPrayerTimes}
                    className="px-4 py-2 text-sm bg-white/10 hover:bg-white/15 rounded-xl transition-colors"
                  >
                    Retry Prayer Times
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Prayer Times List */}
        {!loading && !error && prayerTimes && (
          <section>
            <h2 className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
              Today&apos;s Prayers
            </h2>
            <div className="space-y-2">
              {prayers.map((prayer) => {
                const isNext = nextPrayer?.name === prayer.name;
                const isCurrent = currentPrayer === prayer.name;
                const isPast = new Date() > prayer.time && !isNext;

                return (
                  <div
                    key={prayer.name}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                      isNext
                        ? "bg-[#D4AF37]/10 border border-[#D4AF37]/30"
                        : isCurrent
                        ? "bg-white/5 border border-white/10"
                        : "bg-white/[0.02] border border-white/5 hover:bg-white/5"
                    } ${isPast ? "opacity-40" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isNext
                            ? "bg-[#D4AF37]/20"
                            : prayer.isSunrise
                            ? "bg-orange-500/10"
                            : "bg-white/5"
                        }`}
                      >
                        {prayer.isSunrise ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isNext ? "#D4AF37" : "#fb923c"} strokeWidth="1.5">
                            <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M4.93 19.07l1.41-1.41M12 20v2M18.66 18.66l1.41 1.41M22 12h-2M18.66 5.34l1.41-1.41" />
                            <circle cx="12" cy="12" r="5" />
                          </svg>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isNext ? "#D4AF37" : "currentColor"} strokeWidth="1.5" className={isNext ? "" : "text-white/40"}>
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className={`font-semibold text-lg ${isNext ? "text-[#D4AF37]" : "text-white"}`}>
                          {prayer.name}
                        </p>
                        <p className="text-sm text-white/40">{prayer.nameAr}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-medium ${isNext ? "text-[#D4AF37]" : "text-white/80"}`}>
                        {formatPrayerTime(prayer.time)}
                      </p>
                      {isNext && (
                        <p className="text-xs text-[#D4AF37]/70 mt-0.5">in {timeUntilNext}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Calculation Method Info */}
        {!loading && !error && prayerTimes && (
          <section className="bg-white/5 rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
              Calculation Method
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{getMethodName(settings.method)}</p>
                  <p className="text-xs text-white/40">{settings.school === 1 ? "Hanafi School" : "Standard"}</p>
                </div>
              </div>
              <Link
                href="/prayers/settings"
                className="text-xs text-[#D4AF37] hover:text-[#E8D5A3] transition-colors"
              >
                Change
              </Link>
            </div>
          </section>
        )}

        {/* App Info */}
        <div className="text-center pt-4 pb-8">
          <Image
            src="/aqala-logo.png"
            alt="Aqala"
            width={60}
            height={20}
            className="mx-auto opacity-20 brightness-0 invert"
          />
        </div>
      </div>
    </div>
  );
}
