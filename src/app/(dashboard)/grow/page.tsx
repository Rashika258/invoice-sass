import { redirect } from "next/navigation";

/**
 * /grow — redirects to the marketing tools hub.
 * Individual sub-routes: /grow/google-profile, /grow/marketing-tools,
 * /grow/whatsapp-marketing, /grow/online-store
 */
export default function GrowPage() {
  redirect("/grow/marketing-tools");
}
