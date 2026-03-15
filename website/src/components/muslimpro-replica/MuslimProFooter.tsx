"use client";

import Link from "next/link";

const WHO_WE_ARE = [
  { label: "About Us", href: "/app/about" },
  { label: "Job Openings", href: "#" },
];

const WHAT_WE_DO = [
  { label: "Our Features", href: "/app/features" },
  { label: "Press Releases", href: "#" },
];

const FOR_USERS = [
  { label: "Gift Premium", href: "/subscription" },
  { label: "Redeem Premium", href: "/subscription" },
  { label: "Giving / Donate", href: "/app/giving" },
  { label: "Contact Us", href: "/support" },
];

const FOR_BUSINESS = [
  { label: "Corporate Gifting", href: "#" },
  { label: "Advertise With Us", href: "#" },
];

const LEGAL = [
  { label: "Help Center", href: "/support" },
  { label: "Contact Support", href: "/support" },
  { label: "Contact Press", href: "#" },
  { label: "Cookies Policy", href: "/privacy" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Disclaimer", href: "#" },
];

const languages = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "id", flag: "🇮🇩", label: "Bahasa Indonesia" },
  { code: "ms", flag: "🇲🇾", label: "Bahasa Malay" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "ar", flag: "🇸🇦", label: "العربية" },
  { code: "ru", flag: "🇷🇺", label: "русский" },
  { code: "bn", flag: "🇧🇩", label: "বাংলা" },
  { code: "zh", flag: "🇨🇳", label: "中文" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "fa", flag: "🇮🇷", label: "فارسی" },
  { code: "hi", flag: "🇮🇳", label: "हिन्दी" },
  { code: "tr", flag: "🇹🇷", label: "Türkçe" },
  { code: "ur", flag: "🇵🇰", label: "اردو" },
];

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="font-semibold text-white mb-3">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MuslimProFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          <FooterColumn title="Who We Are" links={WHO_WE_ARE} />
          <FooterColumn title="What We Do" links={WHAT_WE_DO} />
          <FooterColumn title="For Users" links={FOR_USERS} />
          <FooterColumn title="For Business" links={FOR_BUSINESS} />
        </div>

        {/* Brand + tagline */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <img src="/aqala-logo.png" alt="Aqala" className="w-10 h-10 rounded-xl object-contain invert" />
            <span className="font-semibold text-white">Aqala</span>
          </div>
          <p className="text-gray-400 text-sm max-w-md">
            Aqala connects people through comprehension. Real-time translation and multilingual communication for Islamic content — Qur&apos;an, khutbahs, and lectures.
          </p>
        </div>

        {/* Legal links */}
        <div className="flex flex-wrap gap-4 py-6 text-sm">
          {LEGAL.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="text-gray-500 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-gray-500">
          Copyright © {new Date().getFullYear()} Aqala. All rights reserved.
        </div>

        {/* Language selector */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-gray-500 text-xs mb-3">🇬🇧 English</p>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <Link
                key={lang.code}
                href={`?lang=${lang.code}`}
                className="text-gray-400 hover:text-white text-xs transition-colors inline-flex items-center gap-1"
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
