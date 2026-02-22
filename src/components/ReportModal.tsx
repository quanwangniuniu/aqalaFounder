"use client";

import { useState } from "react";
import {
  submitReport,
  REPORT_REASONS,
  ReportReason,
  ReportTargetType,
} from "@/lib/firebase/moderation";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  targetUserId: string;
  targetLabel?: string;
}

export default function ReportModal({
  open,
  onClose,
  reporterId,
  targetType,
  targetId,
  targetUserId,
  targetLabel,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!reason) {
      setError("Please select a reason.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitReport({
        reporterId,
        targetType,
        targetId,
        targetUserId,
        reason,
        description: description.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason(null);
    setDescription("");
    setSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center md:justify-center"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full md:max-w-md bg-[#0a1a14] border border-white/10 rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-5 pt-5 pb-4 border-b border-white/5">
          <button
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            onClick={handleClose}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Report {targetType === "user" ? "User" : targetType === "message" ? "Message" : "Room"}
              </h2>
              {targetLabel && (
                <p className="text-sm text-white/50">{targetLabel}</p>
              )}
            </div>
          </div>
        </div>

        {submitted ? (
          /* Success state */
          <div className="px-5 py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Report Submitted</h3>
            <p className="text-sm text-white/60 mb-6">
              Thank you for helping keep Aqala safe. Our team will review your report and take
              appropriate action.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Reason selection */}
            <div className="px-5 py-4 space-y-2 max-h-[300px] overflow-y-auto">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-3">
                Why are you reporting this?
              </p>
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => {
                    setReason(r.value);
                    setError(null);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                    reason === r.value
                      ? "bg-red-500/10 border border-red-500/30 text-white"
                      : "bg-white/5 border border-transparent text-white/70 hover:bg-white/10"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Additional details */}
            {reason && (
              <div className="px-5 py-3 border-t border-white/5">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any additional details (optional)..."
                  rows={3}
                  maxLength={500}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/30"
                />
                <p className="text-xs text-white/30 text-right mt-1">
                  {description.length}/500
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="px-5">
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <div className="px-5 py-4 border-t border-white/5">
              <button
                onClick={handleSubmit}
                disabled={submitting || !reason}
                className="w-full py-3 rounded-xl bg-red-500/80 text-white text-sm font-semibold hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Report"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
