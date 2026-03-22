"use client";

import Link from "next/link";

export default function MuslimProHelpCenterSection() {
  return (
    <section className="py-12 md:py-14 bg-[#021a12] border-t border-white/10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Help Center</h2>
        <p className="text-white/70 text-sm md:text-base mb-6 max-w-xl mx-auto">
          Find answers to common questions, guides, and support resources.
        </p>
        <Link
          href="/support"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/10 border border-white/15 text-white font-semibold hover:bg-white/15 transition-colors"
        >
          Visit Help Center
        </Link>
      </div>
    </section>
  );
}
