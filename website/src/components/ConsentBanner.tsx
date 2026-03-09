"use client";

import { useState } from "react";
import Link from "next/link";
import { usePrivacyConsent } from "@/contexts/PrivacyConsentContext";

export default function ConsentBanner() {
  const { showBanner, acceptAll, rejectAll, updateConsent } = usePrivacyConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [sessionRecording, setSessionRecording] = useState(true);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[200] p-4 pointer-events-none">
      <div className="max-w-lg mx-auto pointer-events-auto">
        <div className="bg-[#0a1a14] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in slide-in-from-bottom duration-300">
          {/* Main content */}
          <div className="p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white mb-1">Your Privacy Matters</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  We use analytics and session recording to improve your experience. You can
                  choose which data collection you&apos;re comfortable with.{" "}
                  <Link href="/privacy" className="text-[#D4AF37] hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>

            {/* Expanded details */}
            {showDetails && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                {/* Analytics toggle */}
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-white">Analytics</p>
                    <p className="text-xs text-white/50">Help us understand how the app is used</p>
                  </div>
                  <button
                    onClick={() => setAnalytics(!analytics)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      analytics ? "bg-[#D4AF37]" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        analytics ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </label>

                {/* Session recording toggle */}
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-white">Session Recording</p>
                    <p className="text-xs text-white/50">Record sessions to identify bugs</p>
                  </div>
                  <button
                    onClick={() => setSessionRecording(!sessionRecording)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      sessionRecording ? "bg-[#D4AF37]" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        sessionRecording ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </label>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 flex gap-2">
            {showDetails ? (
              <>
                <button
                  onClick={() => updateConsent({ analytics, sessionRecording })}
                  className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] text-[#032117] text-sm font-semibold hover:bg-[#E8D5A3] transition-colors"
                >
                  Save Preferences
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Back
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={acceptAll}
                  className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] text-[#032117] text-sm font-semibold hover:bg-[#E8D5A3] transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={() => setShowDetails(true)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Manage
                </button>
                <button
                  onClick={rejectAll}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
