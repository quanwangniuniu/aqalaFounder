"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ResetPasswordPage() {
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
    } catch (err: any) {
      const errorCode = err.code || "";
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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] px-4 py-8">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
        <p className="text-gray-600 text-center mb-8">Enter your new password below.</p>

        {isSuccess ? (
          <div className="w-full max-w-md mx-auto px-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-6">
              Your password has been reset successfully. Redirecting to sign in...
            </div>
            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-[#10B981] hover:underline font-medium"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto px-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none"
                  placeholder="••••••"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                disabled={isLoading || !oobCode}
                className="w-full inline-flex items-center justify-center rounded-full bg-[#10B981] hover:bg-[#059669] active:bg-[#047857] text-white font-medium text-base leading-7 px-6 py-2 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
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

