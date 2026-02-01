"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const { confirmPasswordReset, error: authError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("oobCode");
    if (!code) {
      setLocalError("Invalid reset link. Please request a new password reset.");
    } else {
      setOobCode(code);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    setIsLoading(true);

    // Validation
    if (!newPassword || !confirmPassword) {
      setLocalError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setLocalError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!oobCode) {
      setLocalError("Invalid reset code. Please request a new password reset.");
      setIsLoading(false);
      return;
    }

    try {
      await confirmPasswordReset(oobCode, newPassword);
      setIsSuccess(true);
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      const errorCode = firebaseError.code || "";
      if (errorCode === "auth/expired-action-code") {
        setLocalError("This password reset link has expired. Please request a new one.");
      } else if (errorCode === "auth/invalid-action-code") {
        setLocalError("Invalid reset link. Please request a new password reset.");
      } else if (errorCode === "auth/weak-password") {
        setLocalError("Password is too weak. Please choose a stronger password.");
      } else {
        setLocalError("Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || (authError && !isSuccess ? authError : null);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 hero-gradient-bg-enhanced" />
      
      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 hero-pattern opacity-40" />
      
      {/* Floating orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] hero-orb hero-orb-1" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] hero-orb hero-orb-2" />
      <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] hero-orb hero-orb-3" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md hero-fade-in">
          {/* Logo */}
          <div className="flex justify-center mb-8 hero-fade-in hero-fade-in-delay-1">
            <Link href="/" className="transition-transform hover:scale-105">
              <Image
                src="/aqala-logo.png"
                alt="Aqala"
                width={120}
                height={40}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
          </div>

          {/* Card */}
          <div className="relative hero-fade-in hero-fade-in-delay-2">
            {/* Card glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37]/20 via-transparent to-[#D4AF37]/20 rounded-3xl blur-xl opacity-50" />
            
            {/* Card content */}
            <div className="relative bg-[#021a12]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Create New Password</h1>
                <p className="text-white/60 text-sm">Enter your new password below</p>
              </div>

              {isSuccess ? (
                <div className="w-full">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm mb-6 flex items-start gap-3">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Your password has been reset successfully. Redirecting to sign in...</span>
                  </div>
                  <Link
                    href="/auth/login"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#c9a431] hover:from-[#E8D5A3] hover:to-[#D4AF37] text-[#021a12] font-semibold text-base px-6 py-3.5 shadow-lg shadow-[#D4AF37]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#D4AF37]/30 hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Go to Sign In
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-white/70 mb-2">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50 outline-none transition-all"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70 mb-2">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                    disabled={isLoading || !oobCode}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#c9a431] hover:from-[#E8D5A3] hover:to-[#D4AF37] text-[#021a12] font-semibold text-base px-6 py-3.5 shadow-lg shadow-[#D4AF37]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#D4AF37]/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Resetting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Reset Password
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Sign in link */}
              {!isSuccess && (
                <div className="mt-8 text-center border-t border-white/10 pt-6">
                  <p className="text-sm text-white/50">
                    Remember your password?{" "}
                    <Link 
                      href="/auth/login" 
                      className="text-[#D4AF37] hover:text-[#E8D5A3] font-medium transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Back to home */}
          <div className="text-center mt-6 hero-fade-in hero-fade-in-delay-3">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient-bg-enhanced" />
        <div className="absolute inset-0 hero-pattern opacity-40" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-8">
              <Image
                src="/aqala-logo.png"
                alt="Aqala"
                width={120}
                height={40}
                className="h-10 w-auto brightness-0 invert"
              />
            </div>
            <div className="relative bg-[#021a12]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
                <div className="typing-dots justify-center mt-4">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
