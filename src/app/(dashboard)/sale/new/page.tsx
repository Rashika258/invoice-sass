import { redirect } from "next/navigation";

export default function SaleNewRedirectPage() {
  redirect("/invoices/new");
}
