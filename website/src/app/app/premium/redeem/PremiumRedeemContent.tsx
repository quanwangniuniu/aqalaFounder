"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MuslimProPremiumSubtabs from "@/components/muslimpro-replica/MuslimProPremiumSubtabs";
import GiftPremiumReveal from "@/components/muslimpro-replica/GiftPremiumReveal";

export default function PremiumRedeemContent() {
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code");
  const fromUrl = searchParams.get("from");
  const messageUrl = searchParams.get("message");

  const [inputCode, setInputCode] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const giftFrom = useMemo(() => {
    if (!fromUrl) return null;
    try {
      return decodeURIComponent(fromUrl);
    } catch {
      return fromUrl;
    }
  }, [fromUrl]);

  const giftMessage = useMemo(() => {
    if (!messageUrl) return null;
    try {
      return decodeURIComponent(messageUrl);
    } catch {
      return messageUrl;
    }
  }, [messageUrl]);

  const hasLinkCode = Boolean(codeFromUrl?.trim());
  const showReveal = hasLinkCode || submitted;

  const handleRedeem = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = inputCode.trim();
    if (trimmed.length < 4) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#032117] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="flex items-center justify-between mb-8">
          <Link href="/app" className="text-white/70 hover:text-white transition-colors text-sm">
            ← Back to /app
          </Link>
        </div>

        <MuslimProPremiumSubtabs />

        <div className="max-w-2xl mx-auto text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Redeem Premium</h1>
          <p className="text-white/70 text-sm md:text-base leading-relaxed">
            Enter the code from your email or gift message. If you opened a shared gift link, your surprise will appear below.
          </p>
        </div>

        {!showReveal && (
          <form onSubmit={handleRedeem} className="max-w-md mx-auto mb-12 space-y-4">
            <label className="block text-left text-sm font-medium text-white/80">
              Gift code
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Paste your code"
                className="mt-2 w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                autoComplete="off"
              />
            </label>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#D4AF37] text-[#032117] font-bold hover:bg-[#E8D5A3] transition-colors"
            >
              Redeem
            </button>
          </form>
        )}

        {showReveal && (
          <div className="rounded-3xl border border-[#D4AF37]/20 bg-gradient-to-b from-[#06402B]/40 to-[#032117] p-8 md:p-12 shadow-2xl shadow-black/30">
            <GiftPremiumReveal
              giftFrom={giftFrom}
              giftMessage={giftMessage}
              autoPlay={hasLinkCode}
            />
          </div>
        )}

        {!hasLinkCode && showReveal && (
          <p className="text-center text-white/45 text-xs max-w-lg mx-auto mt-8">
            Demo: any code of 4+ characters plays the gift experience. Live redemption will verify your code on the server and
            attach Premium to your signed-in account.
          </p>
        )}
      </div>
    </div>
  );
}
