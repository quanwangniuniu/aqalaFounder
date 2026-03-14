"use client";

import Link from "next/link";

const CATEGORIES = [
  { name: "Urgent", desc: "Support urgent humanitarian causes and emergency relief.", href: "/donate", icon: "🆘" },
  { name: "Sadaqah", desc: "Give voluntary charity and earn ongoing rewards.", href: "/donate", icon: "🤲" },
  { name: "Zakat", desc: "Fulfill your Zakat obligation with trusted partners.", href: "/donate", icon: "📿" },
  { name: "Waqaf", desc: "Contribute to perpetual charity and lasting impact.", href: "/donate", icon: "🕌" },
  { name: "Aqiqah", desc: "Celebrate the birth of a child with Aqiqah.", href: "/donate", icon: "👶" },
];

export default function MuslimProGivingPage() {
  return (
    <>
      {/* Hero - charity section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a5c3e] to-[#003d28]">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-white text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Giving by Muslim Pro</h1>
          <p className="text-lg text-white/95 max-w-2xl mx-auto mb-8">
            Support causes that matter to the Ummah. Give with confidence through trusted partners and make a lasting impact.
          </p>
          <Link href="/donate" className="inline-flex px-8 py-4 rounded-lg bg-[#00a651] text-white font-bold hover:bg-[#008f44] transition-colors">
            Explore Causes
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">How would you like to give?</h2>
          <p className="text-gray-600 mb-12 text-center max-w-2xl mx-auto">
            Choose a category that resonates with you. Every contribution supports the global Muslim community.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((c) => (
              <Link key={c.name} href={c.href} className="mp-card-hover block p-6 rounded-2xl border border-gray-200 hover:border-[#00a651]/30 group">
                <span className="text-3xl mb-4 block">{c.icon}</span>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#00a651] transition-colors">{c.name}</h3>
                <p className="text-sm text-gray-600">{c.desc}</p>
                <span className="inline-block mt-4 text-[#00a651] font-semibold text-sm group-hover:underline">Give now →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Gaza banner */}
      <section className="py-12 md:py-16 bg-amber-50 border-y border-amber-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">🇵🇸 Feed 10 refugees in Gaza with this bundle! 🇵🇸</h2>
          <p className="text-gray-600 mb-6">Support urgent relief for our brothers and sisters in Gaza.</p>
          <Link href="/donate" className="inline-flex px-8 py-4 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors">
            Donate Now
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Become a Partner</h2>
          <p className="text-gray-600 mb-6">Organizations and mosques can partner with Muslim Pro Giving to reach millions of Muslims worldwide.</p>
          <Link href="/donate" className="inline-flex px-8 py-4 rounded-lg bg-[#00a651] text-white font-bold hover:bg-[#008f44] transition-colors">
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
