"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { sendPasswordReset, error: authError } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    setIsLoading(true);
    setIsSuccess(false);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setLocalError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordReset(email);
      setIsSuccess(true);
    } catch (err: any) {
      // Show generic message for security (don't reveal if email exists)
      const errorCode = err.code || "";
      if (errorCode === "auth/invalid-email") {
        setLocalError("Please enter a valid email address");
      } else if (errorCode === "auth/user-not-found") {
        // Show generic success message even if user doesn't exist for security
        setIsSuccess(true);
      } else {
        setLocalError("Failed to send password reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || (authError && !isSuccess ? authError : null);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] px-4 py-8">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
        <p className="text-gray-600 text-center mb-8">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {isSuccess ? (
          <div className="w-full max-w-md mx-auto px-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-6">
              If an account with that email exists, we've sent a password reset link. Please check your email.
            </div>
            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-[#10B981] hover:underline font-medium"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto px-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none"
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
              </div>

              {displayError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {displayError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center rounded-full bg-[#10B981] hover:bg-[#059669] active:bg-[#047857] text-white font-medium text-base leading-7 px-6 py-2 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link href="/auth/login" className="text-[#10B981] hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

