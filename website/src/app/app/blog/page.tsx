"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";
import MuslimProNewsletter from "@/components/muslimpro-replica/MuslimProNewsletter";
import {
  BLOG_POSTS,
  getPaginatedPosts,
  getTotalPages,
} from "./_data";

export default function MuslimProBlogPage() {
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams?.get("page") ?? "1", 10) || 1);
  const totalPages = getTotalPages(BLOG_POSTS);
  const currentPage = Math.min(page, totalPages || 1);
  const posts = getPaginatedPosts(BLOG_POSTS, currentPage);

  return (
    <>
      <MuslimProAppBar />
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

      {/* Article grid - Muslim Pro style */}
      <section className="py-8 md:py-12 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group mp-card-hover border border-gray-200 rounded-2xl overflow-hidden hover:border-[#00a651]/30"
              >
                <div className="h-40 bg-gradient-to-br from-[#00a651]/10 to-emerald-500/10 flex items-center justify-center">
                  <span className="text-4xl text-[#00a651]/30">﴾</span>
                </div>
                <div className="p-6">
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

          {/* Pagination - Muslim Pro style */}
          {totalPages > 1 && (
            <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Blog pagination">
              <Link
                href={`/app/blog?page=${totalPages}`}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium"
              >
                {totalPages}
              </Link>
              <span className="px-2 text-gray-400">…</span>
              {[3, 2, 1]
                .filter((p) => p <= totalPages)
                .reverse()
                .map((p) => (
                <Link
                  key={p}
                  href={p === 1 ? "/app/blog" : `/app/blog?page=${p}`}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    p === currentPage
                      ? "border-[#00a651] bg-[#00a651] text-white"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </section>

      <MuslimProNewsletter />
    </>
  );
}
