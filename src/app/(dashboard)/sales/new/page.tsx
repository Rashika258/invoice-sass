import { redirect } from "next/navigation";

export default function SalesNewRedirectPage() {
  redirect("/invoices/new");
}
