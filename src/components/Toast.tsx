"use client";

import React, { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type,
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Auto dismiss
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        fixed bottom-24 left-1/2 -translate-x-1/2 z-[100]
        flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl
        backdrop-blur-md border
        transition-all duration-300 ease-out
        ${isVisible && !isLeaving 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-4"
        }
        ${type === "success"
          ? "bg-[#2E7D32]/95 border-[#4CAF50]/30 text-white"
          : "bg-red-500/95 border-red-400/30 text-white"
        }
      `}
    >
      {/* Icon */}
      <span className="flex-shrink-0">
        {type === "success" ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6M9 9l6 6" />
          </svg>
        )}
      </span>

      {/* Message */}
      <span className="text-sm font-medium">{message}</span>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-1 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Dismiss"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

