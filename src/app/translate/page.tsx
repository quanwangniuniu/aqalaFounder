export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";

export default function TranslatePage() {
  // Translation is only available inside rooms now; server-redirect immediately.
  redirect("/rooms");
}
