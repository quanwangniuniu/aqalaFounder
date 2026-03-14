"use client";

import Link from "next/link";

// Order matches Muslim Pro: 4 columns x 3 rows
// Col1: Daily Duas, Inspirational Quotes, Zakat Calculator
// Col2: Mosque Finder, Greeting Cards, Halal Food Finder
// Col3: Prayer Requests, 99 Names of Allah, Makkah Live
// Col4: Blog Articles, Hijri Calendar, Hajj & Umrah Guides
const FEATURES = [
  { icon: "02-Daily-Duas.png", title: "Daily Duas", href: "/listen" },
  { icon: "10-Inspirational-Quotes.png", title: "Inspirational Quotes", href: "#" },
  { icon: "12-Zakat-Calculator.png", title: "Zakat Calculator", href: "/donate" },
  { icon: "05-Mosque-Finder.png", title: "Mosque Finder", href: "/rooms" },
  { icon: "11-Greeting-Cards.png", title: "Greeting Cards", href: "#" },
  { icon: "06-Halal-Food-Finder.png", title: "Halal Food Finder", href: "#" },
  { icon: "04-Prayer-Requests.png", title: "Prayer Requests", href: "/donate" },
  { icon: "01-99-Names-of-Allah.png", title: "99 Names of Allah", href: "/listen" },
  { icon: "07-Makkah-Live.png", title: "Makkah Live", href: "#" },
  { icon: "09-Blog-Articles.png", title: "Blog Articles", href: "/muslimpro-demo/blog" },
  { icon: "03-Hijri-Calendar.png", title: "Hijri Calendar", href: "/muslimpro-demo/prayer-times" },
  { icon: "08-Hajj-Umrah-Guides.png", title: "Hajj & Umrah Guides", href: "#" },
];

export default function MuslimProFeaturesGrid() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12 text-center">
          All Features in the Muslim Pro App
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8">
          {FEATURES.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 mb-3 flex items-center justify-center overflow-hidden rounded-lg">
                <img
                  src={`/muslimpro-demo/icons/${f.icon}`}
                  alt={f.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-sm font-medium text-gray-900 group-hover:text-[#00a651] transition-colors">
                {f.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
