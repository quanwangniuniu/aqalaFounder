import { redirect } from "next/navigation";

/**
 * /ummah alias - redirects to Core Features
 */
export default function UmmahRedirect() {
  redirect("/app/features");
}
