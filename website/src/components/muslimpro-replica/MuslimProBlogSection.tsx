"use client";

import Link from "next/link";

/**
 * Blog section - Contentful-ready structure.
 * Replace MOCK_POSTS with Contentful fetch when integrated.
 */
interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  href: string;
}

const MOCK_POSTS: BlogPost[] = [
  {
    slug: "ramadan-recharge-2026",
    title: "Ramadan 2026: A Note from the Aqala Team",
    excerpt: "Staying present in worship when life gets heavy. How we built Aqala to support your journey — from khutbah translation to Quran listening.",
    date: "February 12, 2026",
    href: "/app/blog/ramadan-recharge-2026",
  },
  {
    slug: "laylat-al-qadr",
    title: "Laylat al-Qadr: When the Heavens Open",
    excerpt: "One night worth a thousand months. A practical guide to seeking and honouring this blessed night in your own words and worship.",
    date: "March 12, 2026",
    href: "/app/blog/laylat-al-qadr",
  },
  {
    slug: "last-10-nights",
    title: "Ramadan's Final Ten Nights: A Practical Guide",
    excerpt: "Not about pushing limits — about showing up tired, busy, and human. How to meet Allah with honesty in the last stretch.",
    date: "March 11, 2026",
    href: "/app/blog/last-10-nights",
  },
  {
    slug: "itikaf-during-ramadan",
    title: "I'tikaf: Stepping Back to Reconnect",
    excerpt: "When the world feels too loud, retreat into the mosque. A step-by-step look at performing I'tikaf with intention.",
    date: "March 10, 2026",
    href: "/app/blog/itikaf-during-ramadan",
  },
  {
    slug: "heart-feels-tired",
    title: "When Ramadan Feels Flat: What's Really Going On",
    excerpt: "The mid-Ramadan slump isn't failure. Understanding the spiritual rhythm and how to move through it with grace.",
    date: "March 6, 2026",
    href: "/app/blog/heart-feels-tired",
  },
  {
    slug: "simple-ramadan-dhikr",
    title: "Dhikr You Can Do Anywhere This Ramadan",
    excerpt: "Short, powerful remembrances for commutes, breaks, and quiet moments. Build a habit that outlasts the month.",
    date: "March 3, 2026",
    href: "/app/blog/simple-ramadan-dhikr",
  },
  {
    slug: "four-page-rule",
    title: "Finishing the Quran in 30 Days: The Four-Page Method",
    excerpt: "A simple daily target that adds up. How to pace yourself and complete the Book without burnout.",
    date: "March 2, 2026",
    href: "/app/blog/four-page-rule",
  },
];

export default function MuslimProBlogSection() {
  return (
    <section id="blog" className="py-16 md:py-24 bg-[#032117] border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Islamic Resources for Daily Inspiration
        </h2>
        <p className="text-lg text-white/70 mb-12 max-w-3xl">
          Besides the daily tools like prayer times and the holy Quran, Aqala also produces and shares useful and beneficial Islamic articles, guides and infographics to inspire you to be a better Muslim every day.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_POSTS.map((post) => (
            <article
              key={post.slug}
              className="group mp-card-hover border border-white/10 rounded-2xl overflow-hidden hover:border-[#D4AF37]/30 bg-white/[0.03]"
            >
              <div className="h-40 bg-gradient-to-br from-[#D4AF37]/10 to-[#06402B] flex items-center justify-center">
                <span className="text-4xl text-[#D4AF37]/30">﴾</span>
              </div>
              <div className="p-6">
                <p className="text-xs text-white/50 mb-2">{post.date}</p>
                <h3 className="font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-white/70 mb-4 line-clamp-2">{post.excerpt}</p>
                <Link
                  href={post.href}
                  className="inline-flex items-center gap-1 text-[#D4AF37] font-semibold text-sm hover:underline"
                >
                  Read more
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/app/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] transition-colors"
          >
            Read The Aqala Blog
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
