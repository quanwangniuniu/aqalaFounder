"use client";

import Link from "next/link";
import MuslimProBlogSection from "@/components/muslimpro-replica/MuslimProBlogSection";
import MuslimProNewsletter from "@/components/muslimpro-replica/MuslimProNewsletter";

export default function MuslimProBlogPage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Muslim Pro&apos;s Blog — Your Gateway to Enriching Islamic Content
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mb-8">
            Discover a world of inspiration, spirituality, and practical insights tailored for the modern Muslim. From heartwarming stories of faith, in-depth Islamic knowledge, to lifestyle tips and wellness advice, our blog is designed to guide and uplift your journey in life and faith.
          </p>
          <div className="relative max-w-md">
            <input
              type="search"
              placeholder="Search for:"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00a651] focus:ring-1 focus:ring-[#00a651] outline-none"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded bg-[#00a651] text-white text-sm font-medium">
              Search
            </button>
          </div>
        </div>
      </section>
      <MuslimProBlogSection />
      <MuslimProNewsletter />
    </>
  );
}
