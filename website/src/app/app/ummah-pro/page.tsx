"use client";

import { useState } from "react";
import Link from "next/link";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";

const FEATURES = [
  { title: "Connect", desc: "Join meaningful conversations with Muslims around the world in a safe space." },
  { title: "Share", desc: "Share du'as, reflections, and questions with a respectful global Ummah." },
  { title: "Grow", desc: "Discover trending topics, support one another, and feel spiritually grounded within a connected Muslim community." },
];

const MOCK_POSTS = [
  { id: "1", username: "aishaBWeI", time: "2d", location: "Romania", content: "صل لنا أيضا، لكي نكون بصحة جيدة ونرزق بطفل معكم أمام الله.", avatar: "A", likes: 12, comments: 3 },
  { id: "2", username: "dynam1g", time: "17/02/2026", location: "Romania", content: "Hello, when is ramadan in Romania ?", avatar: "D", likes: 0, comments: 0 },
  { id: "3", username: "taulend", time: "17/02/2026", location: "Romania", content: "Ramadan", avatar: "T", likes: 2, comments: 1 },
  { id: "4", username: "nahhas", time: "17/12/2025", location: "Romania", content: "الحمدالله على كل حال", avatar: "N", likes: 8, comments: 2 },
];

export default function MuslimProUmmahProPage() {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likesCount, setLikesCount] = useState<Record<string, number>>(
    Object.fromEntries(MOCK_POSTS.map((p) => [p.id, p.likes]))
  );

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        setLikesCount((c) => ({ ...c, [postId]: (c[postId] ?? 0) - 1 }));
      } else {
        next.add(postId);
        setLikesCount((c) => ({ ...c, [postId]: (c[postId] ?? 0) + 1 }));
      }
      return next;
    });
  };

  return (
    <>
      <MuslimProAppBar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a5c3e]/5 to-transparent">
        <div className="absolute inset-0 opacity-5">
          <img src="/app/banner-bg.svg" alt="" className="w-full h-full object-cover" aria-hidden />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ummah</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Join the Muslim Pro community to connect, share, and grow in faith together.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Why join Ummah?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="mp-card-hover p-6 rounded-2xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community feed - Recent posts */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent posts from Romania</h2>
          <p className="text-gray-600 mb-8">See what the Ummah is sharing today.</p>

          <div className="space-y-4">
            {MOCK_POSTS.map((post) => (
              <article
                key={post.id}
                className="mp-card-hover flex gap-4 p-4 rounded-2xl bg-white border border-gray-200"
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-[#0a5c3e]/10 flex items-center justify-center text-[#0a5c3e] font-semibold">
                  {post.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <span className="font-semibold text-gray-900">{post.username}</span>
                    <span>{post.time}</span>
                    <span>·</span>
                    <span>{post.location}</span>
                  </div>
                  <p className="text-gray-800 mb-4">{post.content}</p>
                  <div className="flex items-center gap-6">
                    <button
                      type="button"
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                        likedPosts.has(post.id) ? "text-[#00a651]" : "text-gray-500 hover:text-[#00a651]"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill={likedPosts.has(post.id) ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>{likesCount[post.id] ?? post.likes}</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#00a651] transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>{post.comments}</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-6 text-center">
            <Link href="/app/ummah-pro" className="text-[#00a651] font-semibold hover:underline">
              View more on Ummah Pro
            </Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get the full experience in the app</h2>
          <p className="text-gray-600 mb-6">Access Ummah Pro features, community posts, and more in the Muslim Pro app.</p>
          <Link
            href="/app/app"
            className="inline-flex px-8 py-4 rounded-lg bg-[#00a651] text-white font-bold hover:bg-[#008f44] transition-colors"
          >
            Download Free App
          </Link>
        </div>
      </section>
    </>
  );
}
