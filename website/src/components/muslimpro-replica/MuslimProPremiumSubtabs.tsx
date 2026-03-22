"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Unlock premium", href: "/app/premium" },
  { label: "Gift Premium", href: "/app/premium/gift" },
  { label: "Redeem Premium", href: "/app/premium/redeem" },
] as const;

export default function MuslimProPremiumSubtabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Premium sections" className="mb-8">
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {TABS.map((tab) => {
          const active =
            tab.href === "/app/premium"
              ? pathname === "/app/premium"
              : pathname === tab.href || pathname?.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                active
                  ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/35"
                  : "text-white/80 hover:text-white bg-white/5 border border-transparent hover:border-white/10"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
