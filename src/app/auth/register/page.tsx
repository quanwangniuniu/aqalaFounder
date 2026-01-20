"use client";

import { Suspense } from "react";
import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";

function AuthFormWrapper() {
  return <AuthForm mode="register" />;
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] px-4 py-8">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-gray-600 text-center mb-8">Sign up to get started with Aqala.</p>

        <Suspense fallback={<div className="text-center text-gray-600">Loading...</div>}>
          <AuthFormWrapper />
        </Suspense>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#10B981] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

