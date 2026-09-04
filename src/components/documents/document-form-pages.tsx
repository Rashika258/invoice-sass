import type { DocumentType } from "@/generated/prisma/client";
import { getCustomers } from "@/actions/customers";
import { getInvoice } from "@/actions/invoices";
import { getItems } from "@/actions/items";
import { getCompanyProfile } from "@/actions/settings";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { DOCUMENT_META } from "@/lib/documents";
import { format } from "date-fns";
import { notFound } from "next/navigation";

export async function DocumentNewPage({ documentType }: { documentType: DocumentType }) {
  const meta = DOCUMENT_META[documentType];
  const [customers, items, profile] = await Promise.all([
    getCustomers(),
    getItems(),
    getCompanyProfile(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New {meta.label}</h1>
        <p className="text-muted-foreground">
          Add items, GST, and {meta.partyLabel.toLowerCase()} details.
        </p>
      </div>
      <InvoiceForm
        documentType={documentType}
        customers={customers}
        catalogItems={items}
        companyState={profile?.state}
        defaultTaxRate={profile?.defaultTaxRate ?? 18}
        defaultTerms={profile?.paymentTerms}
        currency={profile?.currency ?? "INR"}
      />
    </div>
  );
}

export async function DocumentEditPage({
  id,
}: {
  id: string;
}) {
  const [invoice, customers, items, profile] = await Promise.all([
    getInvoice(id),
    getCustomers(),
    getItems(),
    getCompanyProfile(),
  ]);
  if (!invoice) notFound();
  const meta = DOCUMENT_META[invoice.documentType];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit {invoice.invoiceNumber}</h1>
        <p className="text-muted-foreground">Update this {meta.label.toLowerCase()}.</p>
      </div>
      <InvoiceForm
        invoiceId={invoice.id}
        documentType={invoice.documentType}
        customers={customers}
        catalogItems={items}
        companyState={profile?.state}
        defaultTaxRate={profile?.defaultTaxRate ?? 18}
        defaultTerms={profile?.paymentTerms}
        currency={profile?.currency ?? "INR"}
        initialData={{
          customerId: invoice.customerId,
          issueDate: format(invoice.issueDate, "yyyy-MM-dd"),
          dueDate: format(invoice.dueDate, "yyyy-MM-dd"),
          status: invoice.status,
          taxRate: invoice.taxRate,
          discount: invoice.discount,
          notes: invoice.notes,
          terms: invoice.terms,
          placeOfSupply: invoice.placeOfSupply,
          isInterState: invoice.isInterState,
          vehicleNumber: invoice.vehicleNumber,
          ewayBill: invoice.ewayBill,
          orderNumber: invoice.orderNumber,
          items: invoice.items.map((item) => ({
            itemId: item.itemId ?? "",
            description: item.description,
            hsn: item.hsn ?? "",
            unit: item.unit ?? "",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            gstRate: item.gstRate,
          })),
        }}
      />
    </div>
  );
}
