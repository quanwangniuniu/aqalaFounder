import { redirect } from "next/navigation";

/** Legacy route; shared-listening marketing removed — send users to live translation. */
export default function QalboxRedirectPage() {
  redirect("/listen");
}
