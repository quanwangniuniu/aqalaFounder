import { redirect } from "next/navigation";

/**
 * Keep /app as the only landing page entry.
 */
export default function Page() {
  redirect("/app");
}
