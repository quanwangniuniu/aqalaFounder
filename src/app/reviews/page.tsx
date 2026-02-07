"use client";

import { useState } from "react";
import Link from "next/link";
import { submitReview } from "@/lib/firebase/reviews";

export default function ReviewsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!comment.trim()) {
      setError("Please provide your thoughts or feedback.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("Please select a rating.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitReview({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        rating,
        comment: comment.trim(),
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit review. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[calc(100vh-60px)] flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm">Back</span>
            </Link>
            <h1 className="text-lg font-semibold text-white">Reviews</h1>
            <div className="w-16" />
          </div>
        </div>

        {/* Success Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center mx-auto shadow-lg shadow-[#D4AF37]/20 border border-[#D4AF37]/20">
              <span className="text-4xl">✨</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Thank you!</h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Your feedback helps us improve Aqala and serve the community better. JazakAllahu Khairan.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#b8944d] text-[#032117] font-semibold text-sm shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/30 transition-all"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-lg font-semibold text-white">Share Feedback</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center mx-auto border border-[#D4AF37]/20">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">We&apos;d Love to Hear From You</h2>
            <p className="text-white/50 text-sm">Your feedback helps us improve Aqala</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-2">
                Name <span className="text-white/30">(optional)</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50 transition-all"
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                Email <span className="text-white/30">(optional)</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50 transition-all"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Rating */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <label className="block text-sm font-medium text-white/70 mb-3">
                Rating <span className="text-[#D4AF37]">*</span>
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-4xl transition-all hover:scale-110 ${
                      star <= rating ? "text-[#D4AF37]" : "text-white/20"
                    }`}
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="mt-3 text-sm text-center text-[#D4AF37]">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <label htmlFor="comment" className="block text-sm font-medium text-white/70 mb-2">
                Your Thoughts <span className="text-[#D4AF37]">*</span>
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50 transition-all resize-none"
                placeholder="Share your feedback, suggestions, or experience with Aqala..."
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#b8944d] text-[#032117] font-bold text-lg shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#032117] border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>

            {/* Alternative Link */}
            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                Maybe later
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
