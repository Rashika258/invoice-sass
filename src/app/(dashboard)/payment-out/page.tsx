import { getCustomers } from "@/actions/customers";
import { getPayments } from "@/actions/money";
import { getCompanyProfile } from "@/actions/settings";
import {
  PurchaseTransactionsView,
  type PurchaseDocumentItem,
} from "@/components/documents/purchase-transactions-view";

export const dynamic = "force-dynamic";

export default async function PaymentOutPage() {
  const [payments, customers, profile] = await Promise.all([
    getPayments("OUT"),
    getCustomers(),
    getCompanyProfile(),
  ]);
  const currency = profile?.currency ?? "INR";

  const paymentDocs: PurchaseDocumentItem[] = payments.map((p) => ({
    id: p.id,
    invoiceNumber: p.number,
    documentType: "PAYMENT_OUT",
    issueDate: p.date,
    total: p.amount,
    paidAmount: p.amount,
    status: "PAID",
    customer: p.party ? { id: p.party.id, name: p.party.name, phone: p.party.phone } : null,
    paymentMode: p.mode,
    notes: p.notes,
  }));

  return (
    <PurchaseTransactionsView
      currentTab="PAYMENT_OUT"
      documents={paymentDocs}
      customers={customers}
      currency={currency}
      companyName={profile?.companyName || "Sri Manjunatha Engineering Works"}
    />
  );
}
