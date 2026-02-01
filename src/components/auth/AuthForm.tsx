"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GoogleSignInButton from "./GoogleSignInButton";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, error: authError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      setLocalError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      if (mode === "register") {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      // Redirect to returnUrl if provided, otherwise home page
      const returnUrl = searchParams.get("returnUrl");
      router.push(returnUrl || "/");
    } catch (err: unknown) {
      // Error is already set in AuthContext, but we can show a user-friendly message
      const firebaseError = err as { code?: string };
      const errorMessage = firebaseError.code
        ? firebaseError.code.replace("auth/", "").replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
        : "An error occurred. Please try again.";
      setLocalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50 outline-none transition-all"
            placeholder="your@email.com"
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-white/70">
              Password
            </label>
            {mode === "login" && (
              <Link
                href="/auth/forgot-password"
                className="text-sm text-[#D4AF37] hover:text-[#E8D5A3] font-medium transition-colors"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50 outline-none transition-all"
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>

        {displayError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {displayError}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#c9a431] hover:from-[#E8D5A3] hover:to-[#D4AF37] text-[#021a12] font-semibold text-base px-6 py-3.5 shadow-lg shadow-[#D4AF37]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#D4AF37]/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Please wait...
            </>
          ) : mode === "register" ? (
            "Create Account"
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#021a12] text-white/40">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
