"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DonateSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to home after 3 seconds
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-100 to-white px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Thank you for your donation!
        </h1>
        <p className="text-gray-600">
          Your contribution makes a difference. Redirecting to home page...
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 w-full inline-flex items-center justify-center rounded-full bg-[#10B981] hover:bg-[#059669] text-white font-medium text-base leading-7 px-6 py-3 shadow-sm transition-colors"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}

