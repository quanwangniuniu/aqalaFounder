import type { Metadata } from "next";
import "./landing.css";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aqala.org";

export const metadata: Metadata = {
  title: "Aqala - Real-Time Translation for Islamic Content",
  description:
    "Don't just listen. Understand. Aqala translates spoken Islamic word - Qur'an, khutbahs, and lectures - into clear, real-time meaning. From any language to any language.",
  openGraph: {
    title: "Aqala - Real-Time Translation for Islamic Content",
    description:
      "Don't just listen. Understand. Real-time translation for Islamic content, any language to any language.",
    url: `${baseUrl}/landing`,
  },
  alternates: {
    canonical: `${baseUrl}/landing`,
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Aqala",
    url: baseUrl,
    description:
      "Real-time translation for Islamic content. Listen to khutbahs, join rooms, and converse across languages.",
    potentialAction: {
      "@type": "ListenAction",
      target: `${baseUrl}/listen`,
      "query-input": "required name=language",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
