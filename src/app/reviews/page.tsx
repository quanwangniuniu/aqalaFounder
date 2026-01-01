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
      <div className="relative min-h-[calc(100vh-68px)] overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 hero-gradient-bg" />
        <div className="absolute inset-0 hero-geometric-overlay" />
        <div className="absolute inset-0 hero-pattern" />
        
        <div className="relative z-10 min-h-[calc(100vh-68px)] flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-2xl w-full">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 space-y-8 text-center">
              <div className="text-6xl mb-4">✨</div>
              <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
                Thank you for sharing your thoughts!
              </h1>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-8">
                Your feedback helps us improve Aqala and serve the community better.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#c9a962] to-[#b8944d] text-[#0c1f2d] font-semibold text-base px-6 py-3 shadow-xl shadow-black/20 transition-all transform hover:scale-105"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-68px)] overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 hero-gradient-bg" />
      <div className="absolute inset-0 hero-geometric-overlay" />
      <div className="absolute inset-0 hero-pattern" />
      
      <div className="relative z-10 min-h-[calc(100vh-68px)] flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
                Share Your <span className="text-gradient-gold">Thoughts</span>
              </h1>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                We'd love to hear from you. Your feedback helps us improve Aqala.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name (optional)
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-3xl transition-transform hover:scale-110 ${
                        star <= rating ? "text-[#c9a962]" : "text-gray-300"
                      }`}
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="mt-2 text-sm text-gray-700">
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Thoughts <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none"
                  placeholder="Share your feedback, suggestions, or experience with Aqala..."
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full max-w-md inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#c9a962] to-[#b8944d] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-[#0c1f2d] font-semibold text-lg leading-7 px-8 py-4 shadow-xl shadow-black/20 transition-all transform hover:scale-105 disabled:transform-none"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
                <Link
                  href="/"
                  className="text-gray-700 hover:text-gray-900 font-medium text-sm underline"
                >
                  Return to Home
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

