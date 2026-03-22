import Link from "next/link";
import MuslimProPremiumSubtabs from "@/components/muslimpro-replica/MuslimProPremiumSubtabs";

export default function GiftPremiumPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#032117] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="flex items-center justify-between mb-8">
          <Link href="/app" className="text-white/70 hover:text-white transition-colors text-sm">
            ← Back to /app
          </Link>
        </div>

        <MuslimProPremiumSubtabs />

        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-4">
            <span className="text-lg" aria-hidden>
              🎁
            </span>
            <span className="text-xs font-semibold text-[#D4AF37]">Gift Premium</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Give Aqala Premium</h1>
          <p className="text-white/70 leading-relaxed">
            Purchase Premium for yourself or for someone else. Checkout happens here — after payment, the buyer receives a{" "}
            <strong className="text-white/90">secret redeem code</strong> and a{" "}
            <strong className="text-white/90">shareable link</strong>. You can email the code from your receipt flow or copy the
            link and send it by text. The recipient opens the link for a gift-themed experience, sees your name and optional
            message, then redeems on their account.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left">
            <h2 className="text-lg font-semibold text-white mb-2">Unlock for yourself</h2>
            <p className="text-white/65 text-sm leading-relaxed mb-5">
              Same checkout as gifting — choose Premium for your own account. All paid upgrades use the Premium section.
            </p>
            <Link
              href="/subscription"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] transition-colors"
            >
              Go to checkout
            </Link>
          </div>
          <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/5 p-6 text-left">
            <h2 className="text-lg font-semibold text-[#E8D5A3] mb-2">Gift someone else</h2>
            <p className="text-white/65 text-sm leading-relaxed mb-5">
              Complete checkout, then share the code or link we provide. Add the recipient&apos;s name and a short note when we
              wire up the final email template — the preview redeem screen already shows gifter name and message from the link.
            </p>
            <Link
              href="/subscription"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white/10 border border-[#D4AF37]/40 text-white font-semibold hover:bg-white/15 transition-colors"
            >
              Purchase a gift
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 max-w-3xl mx-auto">
          <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-3">Example share link</h3>
          <p className="text-white/60 text-sm mb-3">
            Recipients open a URL like this (your domain + code + personalisation):
          </p>
          <code className="block text-left text-xs sm:text-sm text-[#e2ffbc]/90 bg-black/30 rounded-xl p-4 overflow-x-auto border border-white/10">
            …/app/premium/redeem?code=YOUR-CODE&amp;from=Your%20Name&amp;message=Barakallahu%20feekum
          </code>
          <p className="text-white/45 text-xs mt-4">
            Production gifting will generate this link and optional email automatically after Stripe confirms payment.
          </p>
        </div>

        <div className="text-center mt-10">
          <Link href="/app/premium/redeem" className="text-[#D4AF37] hover:text-[#E8D5A3] text-sm font-semibold">
            Already have a code? Redeem Premium →
          </Link>
        </div>
      </div>
    </div>
  );
}
