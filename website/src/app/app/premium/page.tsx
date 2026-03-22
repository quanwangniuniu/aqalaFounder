"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import MuslimProPremiumSubtabs from "@/components/muslimpro-replica/MuslimProPremiumSubtabs";

const RETURN_URL = "/subscription";

function FeatureCard({
  title,
  description,
  onCta,
  ctaLabel = "Upgrade",
}: {
  title: string;
  description: string;
  onCta: () => void;
  ctaLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-lg shadow-black/20">
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-white/70 text-sm leading-relaxed mb-5">{description}</p>
      <button
        type="button"
        onClick={onCta}
        className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] transition-colors"
      >
        {ctaLabel}
      </button>
    </div>
  );
}

export default function PremiumFeaturesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const goUpgrade = () => {
    if (!user) {
      router.push(`/auth/register?returnUrl=${encodeURIComponent(RETURN_URL)}`);
      return;
    }
    router.push(RETURN_URL);
  };

  const goLogin = () => {
    router.push(`/auth/login?returnUrl=${encodeURIComponent(RETURN_URL)}`);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#032117] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="flex items-center justify-between mb-8">
          <Link href="/app" className="text-white/70 hover:text-white transition-colors text-sm">
            ← Back to /app
          </Link>
          <Link
            href="/subscription"
            className="text-[#D4AF37] hover:text-[#E8D5A3] transition-colors text-sm font-semibold"
          >
            Checkout
          </Link>
        </div>

        <MuslimProPremiumSubtabs />

        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" aria-hidden>
              <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-semibold text-[#D4AF37]">Aqala Premium</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Go Premium. Understand more, distraction-free.</h1>
          <p className="text-white/70 max-w-3xl mx-auto">
            Premium unlocks the best Aqala experience. Purchases run through{" "}
            <strong className="text-white/85">Premium → Unlock / Gift</strong> and checkout. Here&apos;s what you get compared to
            the free plan.
          </p>
        </div>

        {!loading && !user && (
          <div className="mb-10 rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/10 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-white font-semibold mb-1">Create an account to upgrade</p>
              <p className="text-white/70 text-sm">
                You’ll need to register or sign in before upgrading to Premium.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={goUpgrade}
                className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] transition-colors"
              >
                Register to upgrade
              </button>
              <button
                type="button"
                onClick={goLogin}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Sign in
              </button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <FeatureCard
            title="Ad-free experience"
            description="Remove distractions and stay focused during khutbahs and lectures."
            onCta={goUpgrade}
            ctaLabel="Upgrade"
          />
          <FeatureCard
            title="Unlimited translation sessions"
            description="Long-form lectures and events without worrying about limits."
            onCta={goUpgrade}
            ctaLabel="Upgrade"
          />
          <FeatureCard
            title="Premium translation quality"
            description="Enhanced output to improve clarity for complex Islamic topics."
            onCta={goUpgrade}
            ctaLabel="Upgrade"
          />
          <FeatureCard
            title="Support Aqala’s mission"
            description="Your upgrade helps keep core features free for the Ummah."
            onCta={goUpgrade}
            ctaLabel="Upgrade"
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to become Premium?</h2>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Tap below to upgrade. If you’re not logged in, we’ll ask you to register first.
          </p>
          <button
            type="button"
            onClick={goUpgrade}
            className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#b8944d] text-[#032117] font-bold hover:opacity-95 transition-opacity"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );
}

