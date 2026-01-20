"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import UserAvatar from "@/components/UserAvatar";

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide header on landing page
  if (pathname === "/") return null;

  return (
    <header className="fixed top-0 left-0 right-0 bg-transparent z-50">
      <div className="mx-auto max-w-[554px] h-[68px] px-6 flex items-center justify-between bg-white">
        <Link href="/" className="flex items-center">
          <Image
            src="/aqala-logo.png"
            alt="Logo"
            width={100}
            height={100}
            priority
            className="bg-white rounded-md p-1"
          />
          <span className="sr-only">Home</span>
        </Link>
        {user && <UserAvatar />}
      </div>
    </header>
  );
}
