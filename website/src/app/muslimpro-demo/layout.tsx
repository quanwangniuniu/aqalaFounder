import { Inter } from "next/font/google";
import MuslimProShell from "@/components/muslimpro-replica/MuslimProShell";
import MuslimProFooter from "@/components/muslimpro-replica/MuslimProFooter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-muslimpro-sans",
  display: "swap",
});

export default function MuslimProDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.className}>
      <MuslimProShell>
        {children}
      </MuslimProShell>
      <MuslimProFooter />
    </div>
  );
}
