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
    <header className="bg-[#032117] z-50">
      <div className="mx-auto max-w-[554px] h-[60px] px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/aqala-logo.png"
            alt="Logo"
            width={72}
            height={72}
            priority
            className="invert"
          />
          <span className="sr-only">Home</span>
        </Link>
        {user && <UserAvatar />}
      </div>
    </header>
  );
}
