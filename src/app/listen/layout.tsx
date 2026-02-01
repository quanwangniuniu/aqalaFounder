import AdSense from "@/components/AdSense";

export default function ListenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdSense />
      {children}
    </>
  );
}
