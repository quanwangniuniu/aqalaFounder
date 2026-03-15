"use client";

import Link from "next/link";

export default function MuslimProGazaBanner() {
  return (
    <div className="sticky top-0 z-[60] bg-[#00a651] text-white py-2.5 px-4 flex items-center justify-between gap-4">
      <Link
        href="/donate"
        className="flex-1 text-center font-semibold text-sm hover:underline inline-flex items-center justify-center gap-2"
      >
        <span>🇵🇸</span>
        <span>Feed 10 refugees in Gaza with this bundle!</span>
        <span>🇵🇸</span>
      </Link>
      <Link
        href="/privacy"
        className="shrink-0 text-xs text-white/80 hover:text-white transition-colors"
      >
        Manage Preferences
      </Link>
    </div>
  );
}
