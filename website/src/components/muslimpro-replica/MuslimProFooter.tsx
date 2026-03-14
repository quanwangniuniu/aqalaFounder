"use client";

import Link from "next/link";

const WHO_WE_ARE = [
  { label: "About Us", href: "/muslimpro-demo/about" },
  { label: "Job Openings", href: "#" },
];

const WHAT_WE_DO = [
  { label: "Our Features", href: "/muslimpro-demo/features" },
  { label: "Press Releases", href: "#" },
];

const FOR_USERS = [
  { label: "Gift Premium", href: "/subscription" },
  { label: "Redeem Premium", href: "/subscription" },
  { label: "Contact Us", href: "/support" },
];

const FOR_BUSINESS = [
  { label: "Corporate Gifting", href: "#" },
  { label: "Advertise With Us", href: "#" },
];

const LEGAL = [
  { label: "Help Center", href: "/support" },
  { label: "Contact Press", href: "#" },
  { label: "Cookies Policy", href: "/privacy" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Disclaimer", href: "#" },
];

const languages = [
  { code: "id", label: "Bahasa Indonesia" },
  { code: "ms", label: "Bahasa Malay" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "ru", label: "русский" },
  { code: "bn", label: "বাংলা" },
  { code: "zh", label: "中文" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "fa", label: "فارسی" },
  { code: "hi", label: "हिन्दी" },
  { code: "tr", label: "Türkçe" },
  { code: "ur", label: "اردو" },
  { code: "en", label: "English" },
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
            <div className="w-10 h-10 rounded-xl bg-[#00a651] flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="font-semibold text-white">Muslim Pro</span>
          </div>
          <p className="text-gray-400 text-sm max-w-md">
            Muslim Pro is the essential Islamic app companion for Muslims. Now with Qalbox, we are the digital home for all things Muslim.
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
          Copyright © {new Date().getFullYear()} Bitsmedia Pte. Ltd. All rights reserved.
        </div>

        {/* Language selector */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-gray-500 text-xs mb-3">en_US English</p>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <Link
                key={lang.code}
                href={`?lang=${lang.code}`}
                className="text-gray-400 hover:text-white text-xs transition-colors"
              >
                {lang.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
