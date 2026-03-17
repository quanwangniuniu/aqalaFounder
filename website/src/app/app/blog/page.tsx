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
      <section className="py-16 md:py-24 bg-[#032117]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Aqala Blog — Your Gateway to Enriching Islamic Content
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mb-8">
            Discover a world of inspiration, spirituality, and practical insights tailored for the modern Muslim. From heartwarming stories of faith, in-depth Islamic knowledge, to lifestyle tips and wellness advice, our blog is designed to guide and uplift your journey in life and faith.
          </p>
          <div className="relative max-w-md">
            <input
              type="search"
              placeholder="Search for:"
              className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder:text-white/50 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded bg-[#D4AF37] text-[#032117] text-sm font-medium">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Article grid */}
      <section className="py-8 md:py-12 bg-[#032117] border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group mp-card-hover border border-white/10 rounded-2xl overflow-hidden hover:border-[#D4AF37]/30 bg-white/[0.03]"
              >
                <div className="h-40 bg-gradient-to-br from-[#D4AF37]/10 to-[#06402B] flex items-center justify-center">
                  <span className="text-4xl text-[#D4AF37]/30">﴾</span>
                </div>
                <div className="p-6">
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

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Blog pagination">
              <Link
                href={`/app/blog?page=${totalPages}`}
                className="px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/10 text-sm font-medium"
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
                      ? "border-[#D4AF37] bg-[#D4AF37] text-[#032117]"
                      : "border-white/20 text-white/70 hover:bg-white/10"
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
