import { getCustomers } from "@/actions/customers";
import { getPayments } from "@/actions/money";
import { getCompanyProfile } from "@/actions/settings";
import {
  SaleTransactionsView,
  type SaleDocumentItem,
} from "@/components/documents/sale-transactions-view";

export const dynamic = "force-dynamic";

export default async function PaymentInPage() {
  const [payments, customers, profile] = await Promise.all([
    getPayments("IN"),
    getCustomers(),
    getCompanyProfile(),
  ]);
  const currency = profile?.currency ?? "INR";

  const paymentDocs: SaleDocumentItem[] = payments.map((p) => ({
    id: p.id,
    invoiceNumber: p.number,
    documentType: "PAYMENT_IN",
    issueDate: p.date,
    total: p.amount,
    paidAmount: p.amount,
    status: "PAID",
    customer: p.party ? { id: p.party.id, name: p.party.name, phone: p.party.phone } : null,
    paymentMode: p.mode,
    notes: p.notes,
  }));

  return (
    <SaleTransactionsView
      currentTab="PAYMENT_IN"
      documents={paymentDocs}
      customers={customers}
      currency={currency}
      companyName={profile?.companyName || "Sri Manjunatha Engineering Works"}
    />
  );
}
