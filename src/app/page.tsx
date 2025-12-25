/* eslint-disable react/button-has-type */
"use client";
import Link from "next/link";
import { useState } from "react";
import CharityModal from "./charity-modal";
import { useAuth } from "@/contexts/AuthContext";

export default function Page() {
  const { user } = useAuth();
  const [donateOpen, setDonateOpen] = useState(false);
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] px-4 py-8 relative"
      style={{
        backgroundImage: "url('/Connecting through comprehension.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="w-full max-w-md flex flex-col items-center relative z-10">
        <div className="w-full flex flex-col items-center gap-4">
          <Link
            href="/rooms"
            className="w-full max-w-[256px] inline-flex items-center justify-center rounded-full bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-900 font-medium text-base leading-7 px-6 py-2 shadow-sm transition-colors"
          >
            Go to Mosque
          </Link>
          {!user ? (
            <Link
              href="/auth/login"
              className="w-full max-w-[256px] inline-flex items-center justify-center rounded-full border-2 border-white bg-white/90 hover:bg-white text-gray-900 font-medium text-base leading-7 px-6 py-2 transition-colors"
            >
              Sign In
            </Link>
          ) : null}
          <button
            onClick={() => setDonateOpen(true)}
            className="w-full max-w-[256px] inline-flex items-center justify-center rounded-full border-2 border-white bg-white/90 hover:bg-white text-gray-900 font-medium text-base leading-7 px-6 py-2 transition-colors"
          >
            Donate to charity
          </button>
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
