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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] px-4 py-8 bg-white">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <img
          src="/aqala-logo.png"
          alt="Aqala"
          className="h-20 w-20 rounded-2xl mb-8 object-contain"
        />
        
        <div className="w-full flex flex-col items-center gap-4">
          <Link
            href="/rooms"
            className="w-full max-w-[256px] inline-flex items-center justify-center rounded-full bg-[#10B981] hover:bg-[#059669] active:bg-[#047857] text-white font-medium text-base leading-7 px-6 py-2 shadow-sm transition-colors"
          >
            Go to Mosque
          </Link>
          {!user ? (
            <Link
              href="/auth/login"
              className="w-full max-w-[256px] inline-flex items-center justify-center rounded-full border border-zinc-300 text-zinc-700 font-medium text-base leading-7 px-6 py-2 transition-colors hover:bg-zinc-50"
            >
              Sign In
            </Link>
          ) : null}
          <button
            onClick={() => setDonateOpen(true)}
            className="w-full max-w-[256px] inline-flex items-center justify-center rounded-full border border-[#10B981] text-[#10B981] font-medium text-base leading-7 px-6 py-2 transition-colors hover:bg-[#ECFDF5]"
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
