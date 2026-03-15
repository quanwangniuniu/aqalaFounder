"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EmailModalProps {
  open: boolean;
  onClose: () => void;
  content: {
    subject: string;
    body: string;
    html?: string;
  };
  onSuccess: () => void;
  onError: (message: string) => void;
  /** Pre-fill with user's email (useful when Resend sandbox restricts to verified address) */
  userEmail?: string | null;
}

export default function EmailModal({
  open,
  onClose,
  content,
  onSuccess,
  onError,
  userEmail,
}: EmailModalProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-fill with user email when modal opens; clear error
  useEffect(() => {
    if (open) {
      setEmail(userEmail?.trim() || "");
      setInlineError(null);
      setIsClosing(false);
      if (inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  }, [open, userEmail]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !isSending) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, isSending]);

  const handleClose = () => {
    setIsClosing(true);
    setInlineError(null);
    setTimeout(() => {
      setEmail("");
      onClose();
    }, 200);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSend = async () => {
    setInlineError(null);
    if (!validateEmail(email)) {
      const msg = t("share.invalidEmail");
      setInlineError(msg);
      onError(msg);
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: content.subject,
          body: content.body,
          html: content.html,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || t("share.emailError");
        setInlineError(msg);
        onError(msg);
        return;
      }

      handleClose();
      onSuccess();
    } catch (err: any) {
      const msg = err?.message || t("share.emailError");
      setInlineError(msg);
      onError(msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSending && email.trim()) {
      handleSend();
    }
  };

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 min-h-[100dvh]
        transition-opacity duration-200
        ${isClosing ? "opacity-0" : "opacity-100"}
      `}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal - dark theme to match app */}
      <div
        className={`
          relative w-full max-w-md bg-gradient-to-b from-[#0a1f16] to-[#061510]
          rounded-3xl border border-white/10 shadow-2xl overflow-hidden
          transition-all duration-200 ease-out
          ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#F0D78C] to-[#D4AF37]" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {t("share.emailTitle")}
              </h2>
              <p className="text-sm text-white/50">
                {t("share.emailSubtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSending}
            className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {/* Email Input */}
          <div className="relative">
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              placeholder={t("share.emailPlaceholder")}
              className="
                w-full px-4 py-3.5 rounded-xl
                bg-white/5 border border-white/10
                text-white placeholder:text-white/30
                focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all
              "
            />
            {email && validateEmail(email) && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
            )}
          </div>

          {/* Preview hint */}
          <p className="mt-3 text-xs text-white/40 text-center">
            {t("share.emailPreviewHint")}
          </p>

          {/* Inline error - keeps error inside modal, doesn't obscure buttons */}
          {inlineError && (
            <div
              className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30"
              role="alert"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6M9 9l6 6" />
              </svg>
              <p className="text-sm text-red-200 flex-1">{inlineError}</p>
              <button
                onClick={() => setInlineError(null)}
                className="flex-shrink-0 p-1 rounded-full hover:bg-red-500/20 text-red-300"
                aria-label="Dismiss"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleClose}
              disabled={isSending}
              className="
                flex-1 px-4 py-3 rounded-xl
                border border-white/20 text-white/80 font-medium
                hover:bg-white/10 active:bg-white/15
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
            >
              {t("share.cancel")}
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || !email.trim()}
              className="
                flex-1 px-4 py-3 rounded-xl
                bg-gradient-to-r from-[#D4AF37] to-[#C49B30] text-[#0a1f16] font-semibold
                hover:from-[#E0BC42] hover:to-[#D4AF37]
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                transition-all
              "
            >
              {isSending ? (
                <>
                  <svg
                    className="animate-spin"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeOpacity="0.3"
                    />
                    <path
                      d="M12 2a10 10 0 0 1 10 10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  {t("share.sending")}
                </>
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m22 2-7 20-4-9-9-4 20-7Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                  {t("share.send")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

