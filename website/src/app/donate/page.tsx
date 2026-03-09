"use client";

import { useState } from "react";
import Link from "next/link";
import CharityModal from "../charity-modal";

function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.origin;
    const shareData = {
      title: "Aqala",
      text: "Real-time translation for Islamic knowledge",
      url,
    };

    // Try native share first (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers: create temp input
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Silent fail - nothing more we can do
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm"
    >
      {copied ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-[#D4AF37]">Copied!</span>
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}

export default function DonatePage() {
  const [donateOpen, setDonateOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-lg font-semibold text-white">Support Aqala</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center mx-auto shadow-lg shadow-[#D4AF37]/20 border border-[#D4AF37]/20">
              <span className="text-4xl">🤲</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Sadaqah Jariyah</h2>
            <p className="text-white/50 text-sm">Ongoing charity that continues to benefit</p>
          </div>

          {/* Quranic Verse Card */}
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 p-6">
            <div className="text-center space-y-3">
              <p className="text-white/90 text-base leading-relaxed">
                &ldquo;Then do they not reflect upon the Qur&apos;an, or are there locks upon their hearts?&rdquo;
              </p>
              <p className="text-[#D4AF37] text-sm font-medium">
                Qur&apos;an 47:24
              </p>
            </div>
          </div>

          {/* Mission Section */}
          <div className="space-y-4">
            <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
              <p className="text-white/80 text-sm leading-relaxed">
                <span className="text-[#D4AF37] font-semibold">Aqala</span> helps transform spoken Islamic knowledge into understanding — no matter the language — allowing knowledge to reach the heart.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
              <p className="text-white/80 text-sm leading-relaxed">
                The Prophet <span className="text-[#D4AF37]">ﷺ</span> taught that beneficial knowledge continues to reward a person even after death.
                <span className="text-white/40 text-xs ml-1">(Sahih Muslim)</span>
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-2xl border border-[#D4AF37]/20 p-5">
              <p className="text-white/90 text-sm leading-relaxed">
                By supporting Aqala, you help create ongoing access to understanding for the global <span className="text-[#D4AF37] font-semibold">Ummah</span> — a form of <span className="text-[#D4AF37] font-semibold">Sadaqah Jariyah</span>, inshaAllah.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center space-y-2 pt-4">
            <p className="text-xl text-white font-bold">
              Be the reason someone understands.
            </p>
            <p className="text-white/50 text-sm">
              One donation. Endless understanding.
            </p>
          </div>

          {/* Donate Button */}
          <div className="pt-2">
            <button
              onClick={() => setDonateOpen(true)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#b8944d] text-black/90 font-bold text-lg shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/30 transition-all active:scale-[0.98]"
            >
              Donate to Aqala
            </button>
          </div>

          {/* Alternative Actions */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
            <p className="text-white/60 text-sm text-center leading-relaxed">
              If you&apos;re unable to donate, sharing Aqala, leaving a review, or making du&apos;ā&apos; for this project is also deeply appreciated.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Link
                href="/reviews"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Leave Review
              </Link>
              <ShareButton />
            </div>
          </div>

          {/* Du'a Section */}
          <div className="text-center space-y-3 pt-4 pb-8">
            <p className="text-white/80 text-lg leading-relaxed" dir="rtl">
              اللهم انفعنا بما علمتنا وزِدنا علماً نافعاً
            </p>
            <p className="text-white/50 text-sm italic">
              O Allah, benefit us through what You have taught us and increase us in beneficial knowledge.
            </p>
          </div>
        </div>
      </div>

      <CharityModal
        open={donateOpen}
        onClose={() => setDonateOpen(false)}
        currency="$"
        baseAmount={0}
        presetAmounts={[7, 20, 50]}
      />
    </div>
  );
}
