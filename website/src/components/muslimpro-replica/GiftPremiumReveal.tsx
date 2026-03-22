"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";

type Phase = "envelope" | "opening" | "revealed";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export default function GiftPremiumReveal({
  giftFrom,
  giftMessage,
  autoPlay,
}: {
  giftFrom: string | null;
  giftMessage: string | null;
  autoPlay: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("envelope");
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const goRevealed = useCallback(() => {
    setPhase("revealed");
  }, []);

  const runOpening = useCallback(() => {
    if (reducedMotion) {
      goRevealed();
      return;
    }
    setPhase("opening");
    window.setTimeout(goRevealed, 1100);
  }, [goRevealed, reducedMotion]);

  useEffect(() => {
    if (!autoPlay) return;
    if (reducedMotion) {
      const id = window.setTimeout(goRevealed, 0);
      return () => window.clearTimeout(id);
    }
    const t0 = window.setTimeout(() => setPhase("opening"), 500);
    const t1 = window.setTimeout(goRevealed, 1700);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
    };
  }, [autoPlay, reducedMotion, goRevealed]);

  const displayFrom = giftFrom?.trim() || "Someone who cares about you";
  const displayMessage = giftMessage?.trim();

  return (
    <div className="relative max-w-lg mx-auto min-h-[320px] flex flex-col items-center justify-center">
      {phase === "envelope" && !autoPlay && (
        <button
          type="button"
          onClick={() => runOpening()}
          className="group flex flex-col items-center gap-4 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-3xl p-6"
        >
          <div className="mp-gift-envelope relative w-44 h-36 rounded-2xl bg-gradient-to-br from-[#8B4513] via-[#a0522d] to-[#5c3317] shadow-2xl shadow-black/40 flex items-center justify-center border border-[#D4AF37]/30">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#D4AF37]/25 to-transparent rounded-t-2xl" />
            <div className="relative z-10 w-16 h-16 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#032117] text-3xl shadow-lg mp-gift-pulse">
              🎁
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[88px] border-r-[88px] border-t-[48px] border-l-transparent border-r-transparent border-t-[#4a2c17]/95" />
          </div>
          <span className="text-white font-semibold text-lg group-hover:text-[#D4AF37] transition-colors">
            Tap to open your gift
          </span>
        </button>
      )}

      {(phase === "envelope" && autoPlay) || phase === "opening" ? (
        <div
          className={`flex flex-col items-center gap-4 ${phase === "envelope" && autoPlay ? "" : "mp-gift-lift"}`}
          aria-hidden={phase === "opening"}
        >
          <div
            className={`relative w-48 h-40 rounded-2xl bg-gradient-to-br from-[#06402B] to-[#032117] border-2 border-[#D4AF37]/40 shadow-2xl flex flex-col items-center justify-center overflow-hidden ${
              phase === "opening" ? "mp-gift-box-open" : ""
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.2),transparent_50%)]" />
            <span className="text-5xl relative z-10 mp-gift-sparkle">✨</span>
            {phase === "opening" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-full mp-gift-burst bg-[radial-gradient(circle,rgba(212,175,55,0.35)_0%,transparent_70%)]" />
              </div>
            )}
          </div>
          {phase === "opening" && (
            <p className="text-[#D4AF37] text-sm font-medium animate-pulse">Opening…</p>
          )}
        </div>
      ) : null}

      {phase === "revealed" && (
        <div className="w-full mp-gift-reveal text-center space-y-5 px-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30">
            <span className="text-lg" aria-hidden>
              🌟
            </span>
            <span className="text-xs font-semibold text-[#D4AF37] tracking-wide uppercase">Premium gift</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            You&apos;ve been gifted Aqala Premium
          </h2>
          <p className="text-white/70 text-sm md:text-base">
            Enjoy ad-free listening, unlimited translation sessions, and the full Premium experience — courtesy of{" "}
            <span className="text-[#D4AF37] font-semibold">{displayFrom}</span>.
          </p>
          {displayMessage ? (
            <blockquote className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-left">
              <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Personal message</p>
              <p className="text-white/90 text-base leading-relaxed italic">&ldquo;{displayMessage}&rdquo;</p>
            </blockquote>
          ) : null}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/auth/register?returnUrl=/subscription"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#D4AF37] text-[#032117] font-bold hover:bg-[#E8D5A3] transition-colors"
            >
              Create account &amp; redeem
            </Link>
            <Link
              href="/auth/login?returnUrl=/app/premium/redeem"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Sign in
            </Link>
          </div>
          <p className="text-white/40 text-xs max-w-sm mx-auto pt-2">
            When gifting goes live, entering your code while signed in will activate Premium on your account. This screen previews the experience for recipients.
          </p>
        </div>
      )}
    </div>
  );
}
