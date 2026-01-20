"use client";

import { Suspense } from "react";
import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";

function AuthFormWrapper() {
  return <AuthForm mode="login" />;
}

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] px-4 py-8">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Sign In</h1>
        <p className="text-gray-600 text-center mb-8">Welcome back! Please sign in to your account.</p>

        <Suspense fallback={<div className="text-center text-gray-600">Loading...</div>}>
          <AuthFormWrapper />
        </Suspense>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-[#10B981] hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

