"use client";

import Link from "next/link";
import Image from "next/image";
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
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 bg-[#032117]">
          <h1 className="text-2xl font-bold text-white mb-4">Article not found</h1>
          <Link href="/app/blog" className="text-[#D4AF37] font-semibold hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <MuslimProAppBar />
      <article className="bg-[#032117] text-white">
        <header className="relative">
          <div className="relative h-[260px] md:h-[340px]">
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[#032117]/75" />
          </div>
          <div className="relative -mt-24 md:-mt-28 pb-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl border border-white/10 bg-black/20 backdrop-blur-md p-6 md:p-8">
                <p className="text-sm text-white/70 mb-2">
                  {post.date} · {post.author}
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
                  {post.title}
                </h1>
                <p className="text-lg text-white/80 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="prose prose-invert max-w-none">
            {post.content.map((p, idx) => (
              <p key={idx} className="text-white/80 leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          <Link
            href="/app/blog"
            className="inline-flex items-center gap-2 mt-10 text-[#D4AF37] font-semibold hover:underline"
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
