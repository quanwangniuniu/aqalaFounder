"use client";

import { useEffect } from "react";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Aqala: link to web app until mobile apps available
const AQALA_APP_URL = "/listen";

export default function DownloadModal({ isOpen, onClose }: DownloadModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Open Aqala"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-500"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-center text-lg font-bold text-gray-900 mb-2">Open Aqala on your device</h3>
        <p className="text-center text-sm text-gray-600 mb-6">Scan the code or tap below to open Aqala.</p>

        {/* QR code - links to Aqala web app */}
        <div className="flex justify-center mb-6">
          <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                (process.env.NEXT_PUBLIC_SITE_URL || "https://aqala.org") + "/listen"
              )}`}
              alt="QR code to open Aqala"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <a
            href={AQALA_APP_URL}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <span>Open Aqala</span>
          </a>
          <a
            href={AQALA_APP_URL}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#D4AF37] text-[#032117] text-sm font-medium hover:bg-[#b8944d] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
            </svg>
            <span>Open Aqala</span>
          </a>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-4">
          <span>Real-time translation</span>
          <span>•</span>
          <span>Qur&apos;an, khutbahs & lectures</span>
        </div>

        <p className="text-xs text-gray-500 text-center">
          By using Aqala, you agree to our{" "}
          <a href="/terms" className="text-[#D4AF37] hover:underline">Terms of Use</a>,{" "}
          <a href="/privacy" className="text-[#D4AF37] hover:underline">Privacy Policy</a> and{" "}
          <a href="/support" className="text-[#D4AF37] hover:underline">Support</a>.
        </p>
      </div>
    </div>
  );
}
