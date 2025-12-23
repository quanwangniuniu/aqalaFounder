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
    <div className="w-full">
      <div className="relative">
        <div
          className="w-full h-[180px] bg-gradient-to-b from-emerald-100 to-white bg-center bg-cover"
          style={{ backgroundImage: "url(/bg-img.png)" }}
        />
        {/* Curved transition bar under the hero */}
        <div className="absolute left-0 right-0 bottom-[-1px] w-full h-[30px] bg-white rounded-t-[24px]" />
        {/* Center logo straddling the seam */}
        <img
          src="/aqala-logo.png"
          alt="Aqala"
          className="absolute left-1/2 top-[150px] -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-2xl shadow-md bg-white object-contain p-[2px]"
        />
      </div>
      <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 180px)" }}>
        <div
          className="mx-auto flex flex-col items-center px-4 text-center"
          style={{ maxWidth: "272px", width: "100%" }}
        >
          <div className="w-full flex flex-col items-center gap-4">
            <Link
              href="/rooms"
              className="w-[256px] inline-flex items-center justify-center rounded-full bg-[#7D00D4] hover:bg-[#6A00B6] active:bg-[#5B00A0] text-white font-medium text-base leading-7 px-6 py-2 shadow-sm transition-colors"
            >
              Go to Mosque
            </Link>
            {!user ? (
              <Link
                href="/auth/login"
                className="w-[256px] inline-flex items-center justify-center rounded-full border border-zinc-300 text-zinc-700 font-medium text-base leading-7 px-6 py-2 transition-colors hover:bg-zinc-50"
              >
                Sign In
              </Link>
            ) : null}
            <button
              onClick={() => setDonateOpen(true)}
              className="w-[256px] inline-flex items-center justify-center rounded-full border border-[#7D00D4] text-[#7D00D4] font-medium text-base leading-7 px-6 py-2 transition-colors hover:bg-[#F7ECFF]"
            >
              Donate to charity
            </button>
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
