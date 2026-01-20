"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EmailModalProps {
  open: boolean;
  onClose: () => void;
  content: {
    subject: string;
    body: string;
  };
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function EmailModal({
  open,
  onClose,
  content,
  onSuccess,
  onError,
}: EmailModalProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (open) {
      setIsClosing(false);
    }
  }, [open]);

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
    setTimeout(() => {
      setEmail("");
      onClose();
    }, 200);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSend = async () => {
    if (!validateEmail(email)) {
      onError(t("share.invalidEmail"));
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
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send email");
      }

      handleClose();
      onSuccess();
    } catch (err: any) {
      onError(err.message || t("share.emailError"));
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
      className={`fixed inset-0 z-50 flex items-center justify-center p-4
        transition-opacity duration-200
        ${isClosing ? "opacity-0" : "opacity-100"}
      `}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`
          relative w-full max-w-md bg-white rounded-3xl shadow-2xl
          transition-all duration-200 ease-out
          ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2E7D32"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t("share.emailTitle")}
              </h2>
              <p className="text-sm text-gray-500">
                {t("share.emailSubtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSending}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
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
                bg-gray-50 border border-gray-200
                text-gray-900 placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all
              "
            />
            {email && validateEmail(email) && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2E7D32]">
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
          <p className="mt-3 text-xs text-gray-400 text-center">
            {t("share.emailPreviewHint")}
          </p>

          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleClose}
              disabled={isSending}
              className="
                flex-1 px-4 py-3 rounded-xl
                border border-gray-200 text-gray-700 font-medium
                hover:bg-gray-50 active:bg-gray-100
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
                bg-[#2E7D32] text-white font-medium
                hover:bg-[#1B5E20] active:bg-[#145214]
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                transition-colors
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

