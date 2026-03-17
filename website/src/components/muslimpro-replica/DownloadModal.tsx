"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

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

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm min-h-screen"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Open Aqala"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-center text-xl font-bold text-gray-900 mb-1 pt-2">Listen. Understand.</h3>
        <p className="text-center text-sm text-gray-600 mb-5">Scan to open Aqala — real-time translation for Islamic content.</p>

        {/* QR code - links to Aqala web app */}
        <div className="flex justify-center mb-5">
          <div className="w-44 h-44 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 p-1">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                (process.env.NEXT_PUBLIC_SITE_URL || "https://aqala.org") + "/listen"
              )}`}
              alt="QR code to open Aqala"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
          <a
            href={AQALA_APP_URL}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#032117] text-white text-sm font-semibold hover:bg-[#053d28] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z" />
              <path d="M5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11Z" />
            </svg>
            <span>Open in Browser</span>
          </a>
          <a
            href={AQALA_APP_URL}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#D4AF37] text-[#032117] text-sm font-semibold hover:bg-[#b8944d] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z" />
              <path d="M5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11Z" />
            </svg>
            <span>Start Listening</span>
          </a>
        </div>

        <p className="text-xs text-gray-500 text-center">
          By using Aqala, you agree to our{" "}
          <a href="/terms" className="text-[#D4AF37] hover:underline">Terms</a>,{" "}
          <a href="/privacy" className="text-[#D4AF37] hover:underline">Privacy</a> and{" "}
          <a href="/support" className="text-[#D4AF37] hover:underline">Support</a>.
        </p>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : modal;
}
