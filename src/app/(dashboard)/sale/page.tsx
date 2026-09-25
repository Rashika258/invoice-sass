import { redirect } from "next/navigation";

/**
 * /sale — alias for /invoices. Canonical URL is /invoices.
 */
export default function SalePage() {
  redirect("/invoices");
}
