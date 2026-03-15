"use client";

import Link from "next/link";
import MuslimProHero from "@/components/muslimpro-replica/MuslimProHero";
import MuslimProIntro from "@/components/muslimpro-replica/MuslimProIntro";
import MuslimProHomeCarousel from "@/components/muslimpro-replica/MuslimProHomeCarousel";
import MuslimProHomeSections from "@/components/muslimpro-replica/MuslimProHomeSections";
import MuslimProQalboxHomeSection from "@/components/muslimpro-replica/MuslimProQalboxHomeSection";
import MuslimProStats from "@/components/muslimpro-replica/MuslimProStats";
import MuslimProHomeTestimonial from "@/components/muslimpro-replica/MuslimProHomeTestimonial";
import MuslimProBlogSection from "@/components/muslimpro-replica/MuslimProBlogSection";
import MuslimProNewsletter from "@/components/muslimpro-replica/MuslimProNewsletter";
import MuslimProAsSeenOn from "@/components/muslimpro-replica/MuslimProAsSeenOn";

/**
 * Muslim Pro Home - /app
 * Layout matches Muslim Pro homepage structure
 */
export default function MuslimProDemoPage() {
  return (
    <>
      <MuslimProHero />
      <MuslimProIntro />
      <MuslimProHomeCarousel />
      <MuslimProHomeSections />
      <MuslimProQalboxHomeSection />
      <MuslimProStats />
      <MuslimProHomeTestimonial />
      <MuslimProBlogSection />
      <MuslimProNewsletter />
      <MuslimProAsSeenOn />
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Aqala</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/app/features" className="px-6 py-3 rounded-full bg-[#00a651] text-white font-semibold hover:bg-[#008f44]">
              Features
            </Link>
            <Link href="/app/prayer-times" className="px-6 py-3 rounded-full bg-[#00a651] text-white font-semibold hover:bg-[#008f44]">
              Prayer Times
            </Link>
            <Link href="/app/app" className="px-6 py-3 rounded-full bg-[#00a651] text-white font-semibold hover:bg-[#008f44]">
              Open App
            </Link>
            <Link href="/app/quran" className="px-6 py-3 rounded-full bg-[#00a651] text-white font-semibold hover:bg-[#008f44]">
              Quran
            </Link>
            <Link href="/app/blog" className="px-6 py-3 rounded-full bg-[#00a651] text-white font-semibold hover:bg-[#008f44]">
              Blog
            </Link>
            <Link href="/app/about" className="px-6 py-3 rounded-full bg-[#00a651] text-white font-semibold hover:bg-[#008f44]">
              About Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
