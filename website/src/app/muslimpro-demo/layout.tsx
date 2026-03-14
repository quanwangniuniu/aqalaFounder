import { Poppins, Edu_NSW_ACT_Foundation } from "next/font/google";
import MuslimProShell from "@/components/muslimpro-replica/MuslimProShell";
import MuslimProFooter from "@/components/muslimpro-replica/MuslimProFooter";
import "./muslimpro-demo.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-muslimpro-sans",
  display: "swap",
});

const eduNsw = Edu_NSW_ACT_Foundation({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-muslimpro-arabic",
  display: "swap",
});

export default function MuslimProDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${poppins.variable} ${eduNsw.variable} muslimpro-demo-root`}>
      <MuslimProShell>
        {children}
      </MuslimProShell>
      <MuslimProFooter />
    </div>
  );
}
