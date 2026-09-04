import { notFound } from "next/navigation";
import { getInvoice } from "@/actions/invoices";
import { getCompanyProfile } from "@/actions/settings";
import { InvoiceViewActions } from "@/components/invoices/invoice-view-actions";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, profile] = await Promise.all([
    getInvoice(id),
    getCompanyProfile(),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <InvoiceViewActions
      invoice={invoice}
      currency={profile?.currency ?? "INR"}
    />
  );
}
