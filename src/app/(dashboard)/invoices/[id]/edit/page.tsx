import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getCustomers } from "@/actions/customers";
import { getInvoice } from "@/actions/invoices";
import { getItems } from "@/actions/items";
import { getCompanyProfile } from "@/actions/settings";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, customers, items, profile] = await Promise.all([
    getInvoice(id),
    getCustomers(),
    getItems(),
    getCompanyProfile(),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Edit {invoice.invoiceNumber}
        </h1>
        <p className="text-muted-foreground">
          Update invoice details, line items, and totals.
        </p>
      </div>

      <InvoiceForm
        invoiceId={invoice.id}
        customers={customers}
        catalogItems={items}
        defaultTaxRate={profile?.defaultTaxRate ?? 0}
        defaultTerms={profile?.paymentTerms}
        currency={profile?.currency ?? "USD"}
        initialData={{
          customerId: invoice.customerId,
          issueDate: format(invoice.issueDate, "yyyy-MM-dd"),
          dueDate: format(invoice.dueDate, "yyyy-MM-dd"),
          status: invoice.status,
          taxRate: invoice.taxRate,
          discount: invoice.discount,
          notes: invoice.notes,
          terms: invoice.terms,
          items: invoice.items.map((item) => ({
            description: item.description,
            hsn: item.hsn ?? "",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }}
      />
    </div>
  );
}
