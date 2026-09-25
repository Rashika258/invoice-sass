import { notFound } from "next/navigation";
import { getInvoice } from "@/actions/invoices";
import { getCompanyProfile } from "@/actions/settings";
import { InvoiceViewActions } from "@/components/invoices/invoice-view-actions";

export const dynamic = "force-dynamic";

export default async function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, profile] = await Promise.all([
    getInvoice(id),
    getCompanyProfile(),
  ]);

  if (!invoice) notFound();

  return (
    <InvoiceViewActions
      invoice={invoice}
      currency={profile?.currency ?? "INR"}
      logoUrl={profile?.logoUrl}
    />
  );
}
