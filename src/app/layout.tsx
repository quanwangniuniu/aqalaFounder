import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./header";
import Footer from "./footer";
import MainWrapper from "./main-wrapper";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Aqala - Real-Time Translation & Communication",
    template: "%s | Aqala",
  },
  description:
    "Connecting through comprehension. Aqala enables real-time translation and seamless multilingual communication across languages.",
  keywords: [
    "translation",
    "real-time translation",
    "multilingual",
    "communication",
    "language",
    "live translation",
  ],
  openGraph: {
    title: "Aqala - Real-Time Translation & Communication",
    description:
      "Connecting through comprehension. Aqala enables real-time translation and seamless multilingual communication across languages.",
    siteName: "Aqala",
    type: "website",
    images: [
      {
        url: "/aqala-logo.png",
        width: 512,
        height: 512,
        alt: "Aqala Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aqala - Real-Time Translation & Communication",
    description:
      "Connecting through comprehension. Aqala enables real-time translation and seamless multilingual communication across languages.",
    images: ["/aqala-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <Providers>
          <Header />
          <MainWrapper>{children}</MainWrapper>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
