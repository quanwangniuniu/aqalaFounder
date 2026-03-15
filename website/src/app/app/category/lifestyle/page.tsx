"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";
import MuslimProNewsletter from "@/components/muslimpro-replica/MuslimProNewsletter";
import {
  getPostsForCategory,
  getPaginatedPosts,
  getTotalPages,
} from "../../blog/_data";

export default function MuslimProLifestyleCategoryPage() {
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams?.get("page") ?? "1", 10) || 1);
  const lifestylePosts = getPostsForCategory("lifestyle");
  const totalPages = getTotalPages(lifestylePosts);
  const currentPage = Math.min(page, totalPages || 1);
  const posts = getPaginatedPosts(lifestylePosts, currentPage);

  return (
    <>
      <MuslimProAppBar />
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 mb-2">Category: Lifestyle</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Lifestyle</h1>
        </div>
      </section>

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
                  <p className="text-xs text-gray-500 mb-2">{post.author}</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <Link
                    href={post.href}
                    className="inline-flex items-center gap-1 text-[#00a651] font-semibold text-sm hover:underline"
                  >
                    read more
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Blog pagination">
              <Link
                href={`/app/category/lifestyle?page=${totalPages}`}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium"
              >
                {totalPages}
              </Link>
              <span className="px-2 text-gray-400">…</span>
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => totalPages - 2 + i)
                .filter((p) => p >= 1)
                .reverse()
                .map((p) => (
                  <Link
                    key={p}
                    href={p === 1 ? "/app/category/lifestyle" : `/app/category/lifestyle?page=${p}`}
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
