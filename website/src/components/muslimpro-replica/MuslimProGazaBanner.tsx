"use client";

import Link from "next/link";

export default function MuslimProGazaBanner() {
  return (
    <div className="sticky top-0 z-[60] bg-[#00a651] text-white py-2.5 px-4 text-center">
      <Link
        href="/donate"
        className="inline-flex items-center gap-2 font-semibold text-sm hover:underline"
      >
        <span>🇵🇸</span>
        <span>Feed 10 refugees in Gaza with this bundle!</span>
        <span>🇵🇸</span>
      </Link>
    </div>
  );
}
