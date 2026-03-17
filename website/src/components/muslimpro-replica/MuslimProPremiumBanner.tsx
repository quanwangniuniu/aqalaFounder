"use client";

import Link from "next/link";

export default function MuslimProPremiumBanner() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Aqala-branded gradient background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #032117 0%, #06402B 40%, #0a5c3e 70%, #032117 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{ backgroundColor: "#021a12" }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">
          Aqala Premium — No ads, unlimited translation, AI enhancement
        </h3>
        <p className="text-base md:text-lg opacity-95 mb-8 leading-relaxed">
          Go ad-free, enjoy unlimited translation time, and invite friends to get $10 off. AI enhancement makes translations clearer. One-time payment, lifetime access.
        </p>
        <Link
          href="/subscription"
          className="inline-flex items-center px-8 py-4 rounded-xl bg-[#D4AF37] text-[#032117] font-bold text-lg hover:bg-[#E8D5A3] transition-colors shadow-lg"
        >
          Upgrade to Premium
        </Link>
      </div>
    </section>
  );
}
