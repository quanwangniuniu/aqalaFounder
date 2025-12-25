"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
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
      // Redirect to home page on success
      router.push("/");
    } catch (err: any) {
      // Error is already set in AuthContext, but we can show a user-friendly message
      const errorMessage = err.code
        ? err.code.replace("auth/", "").replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
        : "An error occurred. Please try again.";
      setLocalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none"
            placeholder="••••••"
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
          {isLoading ? "Please wait..." : mode === "register" ? "Create Account" : "Sign In"}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}

