import { redirect } from "next/navigation";

/**
 * /ummah alias - redirects to /ummah-pro (matches app.muslimpro.com/ummah)
 */
export default function UmmahRedirect() {
  redirect("/app/ummah-pro");
}
