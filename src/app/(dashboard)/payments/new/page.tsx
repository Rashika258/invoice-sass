import { getCustomers } from "@/actions/customers";
import { getInvoices } from "@/actions/invoices";
import { getBankAccounts } from "@/actions/money";
import { getCompanyProfile } from "@/actions/settings";
import { PaymentNewForm } from "@/components/money/payment-new-form";

export const dynamic = "force-dynamic";

interface NewPaymentPageProps {
  searchParams: Promise<{
    direction?: string;
    partyId?: string;
    invoiceId?: string;
  }>;
}

export default async function NewPaymentPage({ searchParams }: NewPaymentPageProps) {
  const params = await searchParams;
  const rawDirection = params.direction?.toUpperCase();
  const direction: "IN" | "OUT" = rawDirection === "OUT" ? "OUT" : "IN";

  const [parties, accounts, sales, purchases, profile] = await Promise.all([
    getCustomers(),
    getBankAccounts(),
    getInvoices("SALE"),
    getInvoices("PURCHASE"),
    getCompanyProfile(),
  ]);

  const currency = profile?.currency ?? "INR";
  const bankAccounts = accounts.map(({ payments: _p, expenses: _e, ...account }) => account);

  const saleBills = sales.map((doc) => ({
    id: doc.id,
    invoiceNumber: doc.invoiceNumber,
    total: doc.total,
    paidAmount: doc.paidAmount,
    customerId: doc.customerId,
  }));

  const purchaseBills = purchases.map((doc) => ({
    id: doc.id,
    invoiceNumber: doc.invoiceNumber,
    total: doc.total,
    paidAmount: doc.paidAmount,
    customerId: doc.customerId,
  }));

  return (
    <div className="py-2">
      <PaymentNewForm
        initialDirection={direction}
        parties={parties}
        accounts={bankAccounts}
        saleBills={saleBills}
        purchaseBills={purchaseBills}
        currency={currency}
        initialPartyId={params.partyId}
        initialInvoiceId={params.invoiceId}
      />
    </div>
  );
}
