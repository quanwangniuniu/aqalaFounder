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

export default function MuslimProDeenCategoryPage() {
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams?.get("page") ?? "1", 10) || 1);
  const deenPosts = getPostsForCategory("deen");
  const totalPages = getTotalPages(deenPosts);
  const currentPage = Math.min(page, totalPages || 1);
  const posts = getPaginatedPosts(deenPosts, currentPage);

  return (
    <>
      <MuslimProAppBar />
      <section className="py-12 md:py-16 bg-[#032117]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-white/50 mb-2">Category: Deen</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Deen</h1>
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
                <div className="h-40 bg-[#021a12] flex items-center justify-center">
                  <span className="text-4xl text-[#D4AF37]/30">﴾</span>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-white/50 mb-2">{post.author}</p>
                  <p className="text-sm text-white/70 mb-4 line-clamp-3">{post.excerpt}</p>
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
                href={`/app/category/deen?page=${totalPages}`}
                className="px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/10 text-sm font-medium"
              >
                {totalPages}
              </Link>
              <span className="px-2 text-white/40">…</span>
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => totalPages - 2 + i)
                .filter((p) => p >= 1)
                .reverse()
                .map((p) => (
                  <Link
                    key={p}
                    href={p === 1 ? "/app/category/deen" : `/app/category/deen?page=${p}`}
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
