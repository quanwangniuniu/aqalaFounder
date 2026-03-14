"use client";

import Link from "next/link";

const BENEFITS = [
  "Ask unlimited questions to our AI bot",
  "Access thousands of hours of Muslim films, TV series and more",
  "Recite, learn and memorise surahs with ease",
  "Listen to your favorite Quran reciters offline",
  "No ads, no interruptions",
];

export default function MuslimProSpecialOfferPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a5c3e] via-[#00a651] to-[#008f44]">
        <div className="absolute inset-0 opacity-10">
          <img src="/muslimpro-demo/banner-bg.svg" alt="" className="w-full h-full object-cover" aria-hidden />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-white text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/90 mb-4">Limited Time Offer</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Best Premium Offer — Only on Web</h1>
          <p className="text-xl text-white/95 max-w-2xl mx-auto mb-8">
            Remove ads. Unlock Quran. Stay consistent. Get the full Muslim Pro experience today.
          </p>
          <Link href="/subscription" className="inline-flex px-10 py-4 rounded-xl bg-white text-[#00a651] font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
            Upgrade to Premium
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12 text-center">What you get with Premium</h2>
          <ul className="text-left max-w-xl mx-auto space-y-4">
            {BENEFITS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-[#00a651] font-bold shrink-0">✓</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
          <div className="text-center mt-12">
            <Link href="/subscription" className="inline-flex px-8 py-4 rounded-lg bg-[#00a651] text-white font-bold hover:bg-[#008f44] transition-colors">
              Get Premium Now
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Gift Premium to a loved one</h2>
          <p className="text-gray-600 mb-6">Share the blessing of ad-free Muslim Pro with family and friends.</p>
          <Link href="/subscription" className="inline-flex px-8 py-4 rounded-lg bg-[#00a651] text-white font-bold hover:bg-[#008f44] transition-colors">
            Gift Premium
          </Link>
        </div>
      </section>
    </>
  );
}
