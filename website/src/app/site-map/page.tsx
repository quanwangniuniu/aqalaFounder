import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sitemap",
  description:
    "Aqala site map: find all main pages including Home, Privacy, About, Donate, Reviews, Listen, Qibla, Prayers, and more.",
};

const links: { href: string; label: string; description: string }[] = [
  { href: "/", label: "Home", description: "Main landing page and app entry." },
  { href: "/privacy", label: "Privacy Policy", description: "How we collect, use, and protect your data." },
  { href: "/about", label: "About & Contact", description: "About Aqala and how to get in touch." },
  { href: "/donate", label: "Donate", description: "Support Aqala with a donation." },
  { href: "/reviews", label: "Reviews", description: "Share your feedback and read about others' experiences." },
  { href: "/listen", label: "Listen", description: "Listen to content with real-time translation." },
  { href: "/qibla", label: "Qibla", description: "Find the direction of the Qibla." },
  { href: "/prayers", label: "Prayers", description: "Prayer times and settings." },
  { href: "/translate", label: "Translate", description: "Real-time translation tools." },
  { href: "/rooms", label: "Rooms", description: "Join or create live sessions." },
  { href: "/subscription", label: "Subscription", description: "Get Premium and manage your plan." },
  { href: "/auth/login", label: "Log in", description: "Sign in to your account." },
  { href: "/auth/register", label: "Register", description: "Create an account." },
];

export default function SitemapPage() {
  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center justify-between max-w-[554px] mx-auto">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-lg font-semibold text-white">Sitemap</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-[554px] mx-auto space-y-6">
          <p className="text-white/60 text-sm">
            Main pages and sections of Aqala. For the machine-readable sitemap used by search engines, see{" "}
            <a href="/sitemap.xml" className="text-[#D4AF37] hover:underline">
              /sitemap.xml
            </a>
            .
          </p>
          <ul className="space-y-4">
            {links.map(({ href, label, description }) => (
              <li key={href} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <Link
                  href={href}
                  className="text-white font-medium hover:text-[#D4AF37] transition-colors block mb-1"
                >
                  {label}
                </Link>
                <p className="text-white/50 text-sm">{description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
