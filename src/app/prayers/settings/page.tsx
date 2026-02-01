"use client";

import { usePrayer } from "@/contexts/PrayerContext";
import { 
  CALCULATION_METHODS, 
  CalculationMethod, 
  School,
  getMethodName,
} from "@/lib/prayer/calculations";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrayerSettingsPage() {
  const { isRTL } = useLanguage();
  const {
    settings,
    location,
    setMethod,
    setSchool,
    setAdjustment,
    refreshLocation,
  } = usePrayer();

  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);

  const schoolOptions: { value: School; label: string; desc: string }[] = [
    { value: 0, label: "Standard", desc: "Shafi'i, Maliki, Hanbali" },
    { value: 1, label: "Hanafi", desc: "Later Asr time" },
  ];

  const adjustmentPrayers = [
    { key: "fajr" as const, label: "Fajr" },
    { key: "sunrise" as const, label: "Sunrise" },
    { key: "dhuhr" as const, label: "Dhuhr" },
    { key: "asr" as const, label: "Asr" },
    { key: "maghrib" as const, label: "Maghrib" },
    { key: "isha" as const, label: "Isha" },
  ];

  return (
    <div className="min-h-screen bg-[#032117] text-white" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <Link 
            href="/prayers" 
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-xl font-semibold">Prayer Settings</h1>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Calculation Section */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            Calculation
          </h2>
          <div className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden">
            {/* Method */}
            <button
              onClick={() => setShowMethodPicker(!showMethodPicker)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div>
                <p className="font-medium">Method</p>
                <p className="text-sm text-white/50 mt-0.5">
                  {getMethodName(settings.method)}
                </p>
              </div>
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className={`text-white/40 transition-transform ${showMethodPicker ? 'rotate-180' : ''}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* Method Picker */}
            {showMethodPicker && (
              <div className="border-t border-white/5 bg-black/20 max-h-64 overflow-y-auto">
                {CALCULATION_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => {
                      setMethod(method.id as CalculationMethod);
                      setShowMethodPicker(false);
                    }}
                    className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${
                      settings.method === method.id ? "bg-[#D4AF37]/10" : ""
                    }`}
                  >
                    <span className={settings.method === method.id ? "text-[#D4AF37]" : ""}>
                      {method.name}
                    </span>
                    {settings.method === method.id && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-white/5" />

            {/* School (Asr calculation) */}
            <div className="p-4">
              <p className="font-medium mb-3">School (Asr calculation)</p>
              <div className="flex gap-2">
                {schoolOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSchool(option.value)}
                    className={`flex-1 p-3 rounded-lg border transition-all ${
                      settings.school === option.value
                        ? "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs text-white/40 mt-0.5">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5" />

            {/* Adjustments */}
            <button
              onClick={() => setShowAdjustments(!showAdjustments)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div>
                <p className="font-medium">Manual Adjustments</p>
                <p className="text-sm text-white/50 mt-0.5">
                  Fine-tune prayer times (±minutes)
                </p>
              </div>
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className={`text-white/40 transition-transform ${showAdjustments ? 'rotate-180' : ''}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* Adjustments Panel */}
            {showAdjustments && (
              <div className="border-t border-white/5 bg-black/20 p-4 space-y-4">
                <p className="text-xs text-white/40">
                  Adjust each prayer time by minutes. Positive values delay the time, negative values advance it.
                </p>
                {adjustmentPrayers.map((prayer) => (
                  <div key={prayer.key} className="flex items-center justify-between">
                    <span className="text-sm">{prayer.label}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAdjustment(prayer.key, settings.adjustments[prayer.key] - 1)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="w-12 text-center text-sm font-mono">
                        {settings.adjustments[prayer.key] >= 0 ? "+" : ""}
                        {settings.adjustments[prayer.key]}m
                      </span>
                      <button
                        onClick={() => setAdjustment(prayer.key, settings.adjustments[prayer.key] + 1)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5v14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Location Section */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            Location
          </h2>
          <div className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Location</p>
                  {location ? (
                    <p className="text-sm text-white/50 mt-0.5">
                      {location.city && location.country 
                        ? `${location.city}, ${location.country}`
                        : `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                      }
                    </p>
                  ) : (
                    <p className="text-sm text-white/50 mt-0.5">Not set</p>
                  )}
                </div>
                <button
                  onClick={refreshLocation}
                  className="px-4 py-2 text-sm bg-white/10 rounded-lg hover:bg-white/15 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="pt-4">
          <div className="bg-[#D4AF37]/5 rounded-xl border border-[#D4AF37]/10 p-4">
            <div className="flex gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <div className="text-sm text-white/60">
                <p className="mb-2">
                  <strong className="text-[#D4AF37]">Calculation Methods</strong> differ based on the angle 
                  of the sun used to determine Fajr and Isha times. Choose the method used in your region.
                </p>
                <p>
                  <strong className="text-[#D4AF37]">School</strong> affects Asr timing: Standard 
                  (Shafi&apos;i) calculates when shadow equals object height, Hanafi when it equals twice the height.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data source */}
        <p className="text-xs text-white/20 text-center pt-4">
          Prayer times provided by Aladhan API
        </p>
      </div>
    </div>
  );
}
