"use client";

import { Suspense } from "react";
import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import Image from "next/image";

function AuthFormWrapper() {
  return <AuthForm mode="register" />;
}

export default function RegisterPage() {
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
                <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
                <p className="text-white/60 text-sm">Join Aqala and start your journey</p>
              </div>

              <Suspense fallback={
                <div className="text-center text-white/50 py-8">
                  <div className="typing-dots justify-center">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              }>
                <AuthFormWrapper />
              </Suspense>

              {/* Sign in link */}
              <div className="mt-8 text-center border-t border-white/10 pt-6">
                <p className="text-sm text-white/50">
                  Already have an account?{" "}
                  <Link 
                    href="/auth/login" 
                    className="text-[#D4AF37] hover:text-[#E8D5A3] font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
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
