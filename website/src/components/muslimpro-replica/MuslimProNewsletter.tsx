"use client";

import { useState } from "react";

export default function MuslimProNewsletter() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Subscribe to Our Newsletter!
        </h2>
        <p className="text-gray-600 mb-8">
          For exciting updates on our app - from new features and sweet deals to new Muslim films & TV series, subscribe to our newsletter!
        </p>
        {submitted ? (
          <p className="text-[#00a651] font-semibold">Thank you for subscribing!</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="text"
              placeholder="First Name*"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00a651] focus:ring-1 focus:ring-[#00a651] outline-none"
            />
            <input
              type="email"
              placeholder="Email Address*"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00a651] focus:ring-1 focus:ring-[#00a651] outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-[#00a651] text-white font-semibold hover:bg-[#008f44] transition-colors"
            >
              Subscribe
            </button>
          </form>
        )}
        <p className="text-xs text-gray-500 mt-4">
          We care about the protection of your data. Read our{" "}
          <a href="/privacy" className="text-[#00a651] hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </section>
  );
}
