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
            <div className="text-4xl mb-2">📿</div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Support Understanding
            </h1>
          </div>

          {/* Main content */}
          <div className="space-y-6 text-center">
            {/* Quranic verse */}
            <div className="space-y-3">
              <p className="text-lg md:text-xl text-gray-800 leading-relaxed font-medium">
                <span className="text-emerald-600 font-semibold">Allah</span> calls us to reflect upon the Qur'an, not merely recite it
              </p>
              <p className="text-sm text-emerald-700 font-medium">
                (Qur'an 47:24)
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="h-px bg-emerald-200 flex-1"></div>
              <div className="text-2xl text-emerald-600">✦</div>
              <div className="h-px bg-emerald-200 flex-1"></div>
            </div>

            {/* Aqala mission */}
            <div className="space-y-4">
              <p className="text-lg md:text-xl text-gray-800 leading-relaxed">
                <span className="font-semibold text-emerald-700">Aqala</span> helps turn spoken Arabic into understanding — allowing knowledge to reach the heart.
              </p>
            </div>

            {/* Hadith */}
            <div className="space-y-3 pt-4">
              <p className="text-lg md:text-xl text-gray-800 leading-relaxed font-medium">
                The Prophet <span className="text-emerald-600">ﷺ</span> said that beneficial knowledge continues to reward a person even after death
              </p>
              <p className="text-sm text-emerald-700 font-medium">
                (Sahih Muslim)
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="h-px bg-emerald-200 flex-1"></div>
              <div className="text-2xl text-emerald-600">✦</div>
              <div className="h-px bg-emerald-200 flex-1"></div>
            </div>

            {/* Call to action */}
            <div className="space-y-4 pt-2">
              <p className="text-xl md:text-2xl text-gray-900 leading-relaxed font-semibold">
                Support Aqala for the sake of <span className="text-emerald-600">Allah</span>,
              </p>
              <p className="text-xl md:text-2xl text-gray-900 leading-relaxed font-semibold">
                and be a means for understanding to reach others.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col items-center gap-4 pt-6">
            <button
              onClick={() => setDonateOpen(true)}
              className="w-full max-w-md inline-flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-lg leading-7 px-8 py-4 shadow-lg transition-all transform hover:scale-105"
            >
              Donate to Charity
            </button>
            <Link
              href="/"
              className="text-emerald-700 hover:text-emerald-800 font-medium text-sm underline"
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

