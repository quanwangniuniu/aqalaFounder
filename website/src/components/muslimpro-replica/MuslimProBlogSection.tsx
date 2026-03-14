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
    title: "Ramadan Re:Charge 2026 | Letter from Nafees, Muslim Pro CEO",
    excerpt: "As the weight of daily life continues, how do we stay present in our worship? Our CEO shares how Ramadan Re:Charge supports your journey through every sincere return.",
    date: "February 12, 2026",
    href: "#",
  },
  {
    slug: "laylat-al-qadr",
    title: "What Actually Happens on Laylat al-Qadr?",
    excerpt: "The barrier between heaven and earth disappears on Laylat al-Qadr. Here is how this night allows you to rewrite your future.",
    date: "March 12, 2026",
    href: "#",
  },
  {
    slug: "last-10-nights",
    title: "What to Expect from the Last 10 Nights of Ramadan",
    excerpt: "The last 10 nights of Ramadan are not about pushing your body to the limit. They are about meeting Allah with honesty while tired, busy, and human.",
    date: "March 11, 2026",
    href: "#",
  },
  {
    slug: "itikaf-during-ramadan",
    title: "How Do You Perform I'tikaf Correctly During Ramadan?",
    excerpt: "Is the world too loud? Discover how Itikaf can help you reconnect with your Creator during the final stretch of Ramadan.",
    date: "March 10, 2026",
    href: "#",
  },
  {
    slug: "heart-feels-tired",
    title: "Why Your Heart Feels Tired This Ramadan",
    excerpt: "The flatness you feel halfway through Ramadan isn't a sign of failure. Here's what's actually going on and how to keep going.",
    date: "March 6, 2026",
    href: "#",
  },
  {
    slug: "simple-ramadan-dhikr",
    title: "Simple Ramadan Dhikr for Everyday Practice",
    excerpt: "Ramadan often begins with strong intentions. You want to pray more, read more Quran, and give more charity.",
    date: "March 3, 2026",
    href: "#",
  },
  {
    slug: "four-page-rule",
    title: "Complete the Quran in Ramadan With This 4-Page Rule",
    excerpt: "Is your Quran goal slipping away? Don't quit. Here is the mathematical and habit-based strategy to finish the book in 30 days.",
    date: "March 2, 2026",
    href: "#",
  },
];

export default function MuslimProBlogSection() {
  return (
    <section id="blog" className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Islamic Resources for Daily Inspiration
        </h2>
        <p className="text-lg text-gray-600 mb-12 max-w-3xl">
          Besides the daily tools like prayer times and the holy Quran, Muslim Pro also produces and shares useful and beneficial Islamic articles, guides and infographics to inspire you to be a better Muslim every day.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_POSTS.map((post) => (
            <article
              key={post.slug}
              className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#00a651]/30 transition-all duration-300"
            >
              <div className="h-40 bg-gradient-to-br from-[#00a651]/10 to-emerald-500/10 flex items-center justify-center">
                <span className="text-4xl text-[#00a651]/30">﴾</span>
              </div>
              <div className="p-6">
                <p className="text-xs text-gray-500 mb-2">{post.date}</p>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#00a651] transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                <Link
                  href={post.href}
                  className="inline-flex items-center gap-1 text-[#00a651] font-semibold text-sm hover:underline"
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
            href="/muslimpro-demo/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#00a651] text-white font-semibold hover:bg-[#008f44] transition-colors"
          >
            Read The Muslim Pro Blog
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
