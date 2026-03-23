"use client";

import { useState, type FormEvent } from "react";

export default function MuslimProNewsletter() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-[#032117] border-t border-white/10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Subscribe &amp; stay up to date.</h2>
        <p className="text-white/70 mb-8 leading-relaxed">
          Get updates on promotional discounts, new features, app improvements and Islamic content.
        </p>
        {submitted ? (
          <p className="text-[#D4AF37] font-semibold">Thank you for subscribing!</p>
        ) : (
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="text"
              placeholder="First Name*"
              className="flex-1 px-4 py-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder:text-white/50 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
            />
            <input
              type="email"
              placeholder="Email Address*"
              className="flex-1 px-4 py-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder:text-white/50 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] transition-colors"
            >
              Subscribe
            </button>
          </form>
        )}
        <p className="text-xs text-white/50 mt-4">
          We care about the protection of your data. Read our{" "}
          <a href="/privacy" className="text-[#D4AF37] hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </section>
  );
}
