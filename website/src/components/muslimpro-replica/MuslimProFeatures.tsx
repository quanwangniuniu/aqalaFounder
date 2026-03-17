"use client";

import Link from "next/link";

const features = [
  {
    title: "Everything you need for Ramadan, in one place",
    desc: "From daily fasting times and iftar du'as to ready-to-use Ramadan greetings, the Ramadan Hub is designed to be your main reference point throughout Ramadan 2026.",
    cta: "Get Ready for Ramadan",
    href: "#",
    gradient: "from-amber-500/10 to-orange-500/10",
    border: "border-amber-200",
    hover: "hover:border-amber-300",
  },
  {
    title: "Fulfil Umrah For Your Loved Ones",
    desc: "Gift a Badal Umrah to be performed in Makkah on behalf of your loved one. Whether for the deceased, the sick, or those unable to perform it themselves.",
    cta: "Learn More",
    href: "#",
    gradient: "from-rose-500/10 to-pink-500/10",
    border: "border-rose-200",
    hover: "hover:border-rose-300",
  },
  {
    title: "Upgrade to Aqala Premium",
    desc: "No ads, unlimited translation time, invite friends for $10 off, and AI enhancement. One-time payment, lifetime access.",
    cta: "Upgrade to Premium",
    href: "/subscription",
    gradient: "from-[#00a651]/10 to-emerald-500/10",
    border: "border-[#00a651]/30",
    hover: "hover:border-[#00a651]/50",
  },
];

export default function MuslimProFeatures() {
  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 md:space-y-12">
          {features.map((f, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-2xl border-2 p-6 md:p-8 bg-gradient-to-br ${f.gradient} ${f.border} ${f.hover} transition-all duration-300 hover:shadow-lg`}
            >
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                {f.title}
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl">
                {f.desc}
              </p>
              <Link
                href={f.href}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00a651] text-white font-semibold text-sm hover:bg-[#008f44] transition-colors group-hover:shadow-md"
              >
                {f.cta}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
