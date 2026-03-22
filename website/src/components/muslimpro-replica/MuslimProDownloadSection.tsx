"use client";

import Image from "next/image";

const APP_STORE_BADGE = "/app/homepage/appstore-200-69.png";
const PLAY_BADGE = "/app/homepage/play_store-200.png";

export default function MuslimProDownloadSection() {
  return (
    <section id="get-aqala-app" className="py-12 md:py-16 bg-[#032117] scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-[#06402B] p-6 md:p-10 shadow-2xl shadow-black/30">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center md:text-left">
            Download the App
          </h2>
          <p className="text-white/80 mb-10 text-center md:text-left max-w-2xl">
            Get Aqala on your device. Choose your platform below.
          </p>

          <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-start">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="mb-4 flex justify-center md:justify-start">
                <Image
                  src={APP_STORE_BADGE}
                  alt="Download on the App Store"
                  width={200}
                  height={69}
                  className="h-auto w-[200px] max-w-full object-contain"
                />
              </div>
              <a
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[#e2ffbc] text-[#032117] font-bold hover:brightness-95 transition-colors mp-btn-hover"
              >
                Download for iOS
              </a>
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="mb-4 flex justify-center md:justify-start">
                <Image
                  src={PLAY_BADGE}
                  alt="Get it on Google Play"
                  width={200}
                  height={69}
                  className="h-auto w-[200px] max-w-full object-contain"
                />
              </div>
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[#e2ffbc] text-[#032117] font-bold hover:brightness-95 transition-colors mp-btn-hover"
              >
                Download for Android
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
