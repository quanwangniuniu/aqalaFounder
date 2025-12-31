"use client";

import { useState } from "react";
import Link from "next/link";
import CharityModal from "../charity-modal";

export default function DonatePage() {
  const [donateOpen, setDonateOpen] = useState(false);

  return (
    <div 
      className="min-h-[calc(100vh-68px)] flex flex-col items-center justify-center px-4 py-12 relative"
      style={{
        backgroundImage: "url('/Connecting through comprehension.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="max-w-2xl w-full relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="text-5xl mb-2">🙌</div>
          </div>

          {/* Main content */}
          <div className="space-y-6 text-center">
            {/* Quranic verse */}
            <div className="space-y-2">
              <p className="text-lg md:text-xl text-gray-800 leading-relaxed font-medium">
                <span className="text-emerald-800 font-semibold">Allah</span> calls us to reflect upon the Qur'an, not merely recite it.
              </p>
              <p className="text-sm text-emerald-800 font-medium">
                (Qur'an 47:24)
              </p>
            </div>

            {/* Aqala mission */}
            <div className="space-y-4 pt-2">
              <p className="text-lg md:text-xl text-gray-800 leading-relaxed">
                <span className="font-semibold text-emerald-800">Aqala</span> helps transform spoken Islamic knowledge into understanding — no matter the language — allowing knowledge to reach the heart.
              </p>
            </div>

            {/* Hadith */}
            <div className="space-y-2 pt-4">
              <p className="text-lg md:text-xl text-gray-800 leading-relaxed font-medium">
                The Prophet <span className="text-emerald-800">ﷺ</span> taught that beneficial knowledge continues to reward a person even after death (Sahih Muslim).
              </p>
            </div>

            {/* Support message */}
            <div className="space-y-2 pt-4">
              <p className="text-lg md:text-xl text-gray-800 leading-relaxed font-medium">
                By supporting Aqala, you help create ongoing access to understanding for the global <span className="text-emerald-800 font-semibold">Ummah</span> — a form of <span className="text-emerald-800 font-semibold">Sadaqah Jariyah</span>, inshaAllah.
              </p>
            </div>

            {/* Mission statement */}
            <div className="space-y-3 pt-6">
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                Our mission is simple: remove the barriers to understanding and reconnect hearts and minds through knowledge.
              </p>
            </div>

            {/* Call to action */}
            <div className="space-y-2 pt-4">
              <p className="text-xl md:text-2xl text-gray-900 leading-relaxed font-semibold">
                Be the reason someone understands.
              </p>
            </div>

            {/* Alternative ways to help */}
            <div className="space-y-2 pt-4">
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                If you're unable to donate, sharing Aqala, leaving a review, or making duʿā' for this project is also deeply appreciated.
              </p>
            </div>
          </div>

          {/* Closing statements */}
          <div className="space-y-4 pt-6 text-center">
            <div className="space-y-2">
              <p className="text-2xl md:text-3xl text-gray-900 leading-relaxed font-bold">
                One donation. Endless understanding.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                AQALA is free to use. Your support keeps it that way.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <p className="text-lg md:text-xl text-emerald-800 leading-relaxed font-medium">
                Together, we can remove language as a barrier to faith.
              </p>
            </div>
          </div>

          {/* Du'a */}
          <div className="space-y-2 pt-4 text-center">
            <p className="text-base md:text-lg text-gray-800 leading-relaxed font-medium" dir="rtl" style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}>
              اللهم انفعنا بما علمتنا وزِدنا علماً نافعاً
            </p>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed italic">
              Allahumma anfaʿnā bimā ʿallamtanā wa zidnā ʿilman nāfiʿā.
            </p>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              O Allah, benefit us through what You have taught us and increase us in beneficial knowledge.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col items-center gap-4 pt-6">
            <button
              onClick={() => setDonateOpen(true)}
              className="w-full max-w-md inline-flex items-center justify-center rounded-full bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-semibold text-lg leading-7 px-8 py-4 shadow-lg transition-all transform hover:scale-105"
            >
              Donate to Charity
            </button>
            <Link
              href="/"
              className="text-emerald-800 hover:text-emerald-900 font-medium text-sm underline"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>

      <CharityModal
        open={donateOpen}
        onClose={() => setDonateOpen(false)}
        currency="$"
        baseAmount={0}
        presetAmounts={[7, 20, 50]}
      />
    </div>
  );
}

