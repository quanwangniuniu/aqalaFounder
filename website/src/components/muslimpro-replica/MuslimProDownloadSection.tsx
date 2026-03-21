"use client";

import Image from "next/image";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aqala.org";
const qrData = `${siteUrl}/app`;
const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(qrData)}`;

export default function MuslimProDownloadSection() {
  return (
    <section id="get-aqala-app" className="py-12 md:py-16 bg-[#032117] scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-[#06402B] p-6 md:p-10 shadow-2xl shadow-black/30">
          <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Get Aqala app</h2>
              <p className="text-white/80 mb-6">
                Scan the QR to open Aqala quickly. App store buttons are placeholders for now (fake QR as requested in QA).
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-black text-white font-semibold hover:bg-black/80 transition-colors mp-btn-hover"
                >
                  Google Play
                </a>
                <a
                  href="https://www.apple.com/app-store/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-black text-white font-semibold hover:bg-black/80 transition-colors mp-btn-hover"
                >
                  App Store
                </a>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="rounded-2xl bg-white p-3 shadow-lg">
                <Image
                  src={qrSrc}
                  alt="Aqala app QR code placeholder"
                  width={220}
                  height={220}
                  className="rounded-xl"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
