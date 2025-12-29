/* eslint-disable react/button-has-type */
"use client";
import Link from "next/link";

export default function Page() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] px-4 py-8 relative"
      style={{
        backgroundImage: "url('/Connecting through comprehension.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-md flex flex-col items-center relative z-10">
        <div className="w-full flex flex-col items-center gap-4">
          <Link
            href="/listen"
            className="w-full max-w-[256px] inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-900 font-medium text-base leading-7 px-6 py-3 shadow-sm transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z"
                fill="currentColor"
              />
              <path
                d="M5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H10a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11Z"
                fill="currentColor"
              />
            </svg>
            Start Listening
          </Link>
          <Link
            href="/donate"
            className="w-full max-w-[256px] inline-flex items-center justify-center rounded-full border-2 border-white bg-white/90 hover:bg-white text-gray-900 font-medium text-base leading-7 px-6 py-2 transition-colors"
          >
            Donate
          </Link>
        </div>
      </div>
    </div>
  );
}
