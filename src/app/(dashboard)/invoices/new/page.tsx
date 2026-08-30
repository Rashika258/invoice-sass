import { getCustomers } from "@/actions/customers";
import { getItems } from "@/actions/items";
import { getCompanyProfile } from "@/actions/settings";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default async function NewInvoicePage() {
  const [customers, items, profile] = await Promise.all([
    getCustomers(),
    getItems(),
    getCompanyProfile(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
        <p className="text-muted-foreground">
          Add customers, line items, taxes, and notes dynamically.
        </p>
      </div>

      <InvoiceForm
        customers={customers}
        catalogItems={items}
        defaultTaxRate={profile?.defaultTaxRate ?? 0}
        defaultTerms={profile?.paymentTerms}
        currency={profile?.currency ?? "USD"}
      />
    </div>
  );
}
