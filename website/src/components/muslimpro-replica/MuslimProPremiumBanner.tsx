"use client";

import Link from "next/link";

export default function MuslimProPremiumBanner() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background image - muslim-pro-features.jpg */}
      <div className="absolute inset-0">
        <img
          src="/app/muslim-pro-features.jpg"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden
        />
        {/* Overlay: #0E1C25 with ~76% opacity (C2 in hex = 194/255) */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(14, 28, 37, 0.76)" }}
        />
        {/* Base tint: #003232 */}
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{ backgroundColor: "#003232" }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">
          Upgrade to Aqala Premium!
        </h3>
        <p className="text-base md:text-lg opacity-95 mb-8 leading-relaxed">
          Ads help us keep Aqala running, but upgrading to Premium offers you an uninterrupted experience while directly supporting the app&apos;s growth and development. Upgrade to{" "}
          <strong>Aqala Premium</strong> today and enjoy an ad-free experience + unlock all features!
        </p>
        <Link
          href="/subscription"
          className="inline-flex items-center px-8 py-4 rounded-lg bg-[#00a651] text-white font-bold text-lg hover:bg-[#008f44] transition-colors shadow-lg"
        >
          Upgrade to Premium
        </Link>
      </div>
    </section>
  );
}
