"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";
import MuslimProNewsletter from "@/components/muslimpro-replica/MuslimProNewsletter";
import { BLOG_POSTS } from "../_data";

export default function BlogArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <>
        <MuslimProAppBar />
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h1>
          <Link href="/app/blog" className="text-[#00a651] font-semibold hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <MuslimProAppBar />
      <article className="bg-white">
        <header className="py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-gray-500 mb-2">{post.date} · {post.author}</p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <p className="text-lg text-gray-700 leading-relaxed mb-8">{post.excerpt}</p>
          <p className="text-gray-600 leading-relaxed">
            This article is part of the Aqala blog. Full content would be loaded from your CMS or content source.
            Article content placeholder.
          </p>
          <Link
            href="/app/blog"
            className="inline-flex items-center gap-2 mt-8 text-[#00a651] font-semibold hover:underline"
          >
            ← Back to Blog
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Link>
        </div>
      </article>

      <MuslimProNewsletter />
    </>
  );
}
