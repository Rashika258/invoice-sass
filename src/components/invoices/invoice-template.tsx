import { format } from "date-fns";
import type { Customer, Invoice, InvoiceItem } from "@/generated/prisma/client";
import {
  formatAddress,
  formatCurrency,
} from "@/lib/invoice-utils";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";

type InvoiceTemplateProps = {
  invoice: Invoice & {
    customer: Customer;
    items: InvoiceItem[];
  };
  currency?: string;
  className?: string;
};

export function InvoiceTemplate({
  invoice,
  currency = "USD",
  className = "",
}: InvoiceTemplateProps) {
  const companyAddress = formatAddress({
    address: invoice.companyAddress,
    city: invoice.companyCity,
    state: invoice.companyState,
    zipCode: invoice.companyZip,
    country: invoice.companyCountry,
  });

  const customerAddress = formatAddress({
    address: invoice.customer.address,
    city: invoice.customer.city,
    state: invoice.customer.state,
    zipCode: invoice.customer.zipCode,
    country: invoice.customer.country,
  });

  return (
    <div
      className={`mx-auto w-full max-w-[800px] bg-white text-slate-900 shadow-sm print:shadow-none ${className}`}
    >
      <div className="border-b-4 border-slate-900 px-10 py-8">
        <div className="flex items-start justify-between gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {invoice.companyName}
            </h1>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              {companyAddress && (
                <p className="whitespace-pre-line">{companyAddress}</p>
              )}
              {invoice.companyEmail && <p>{invoice.companyEmail}</p>}
              {invoice.companyPhone && <p>{invoice.companyPhone}</p>}
              {invoice.companyTaxId && <p>Tax ID: {invoice.companyTaxId}</p>}
            </div>
          </div>

          <div className="text-right">
            <p className="text-4xl font-black tracking-wider text-slate-900">
              INVOICE
            </p>
            <p className="mt-2 text-lg font-semibold">{invoice.invoiceNumber}</p>
            <div className="mt-3 flex justify-end">
              <InvoiceStatusBadge status={invoice.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 px-10 py-8">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Bill To
          </p>
          <p className="text-lg font-semibold">{invoice.customer.name}</p>
          <div className="mt-2 space-y-1 text-sm text-slate-600">
            {customerAddress && (
              <p className="whitespace-pre-line">{customerAddress}</p>
            )}
            {invoice.customer.email && <p>{invoice.customer.email}</p>}
            {invoice.customer.phone && <p>{invoice.customer.phone}</p>}
            {invoice.customer.taxId && (
              <p>Tax ID: {invoice.customer.taxId}</p>
            )}
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-medium text-slate-500">Issue Date</span>
            <span>{format(invoice.issueDate, "MMM dd, yyyy")}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-medium text-slate-500">Due Date</span>
            <span>{format(invoice.dueDate, "MMM dd, yyyy")}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-medium text-slate-500">Amount Due</span>
            <span className="text-lg font-bold">
              {formatCurrency(invoice.total, currency)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-10 pb-8">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-slate-900 bg-slate-50">
              <th className="px-3 py-3 text-left font-semibold">Description</th>
              <th className="px-3 py-3 text-right font-semibold">Qty</th>
              <th className="px-3 py-3 text-right font-semibold">Rate</th>
              <th className="px-3 py-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-slate-200">
                <td className="px-3 py-4 align-top">{item.description}</td>
                <td className="px-3 py-4 text-right align-top">{item.quantity}</td>
                <td className="px-3 py-4 text-right align-top">
                  {formatCurrency(item.unitPrice, currency)}
                </td>
                <td className="px-3 py-4 text-right align-top font-medium">
                  {formatCurrency(item.amount, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal, currency)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Discount</span>
                <span>-{formatCurrency(invoice.discount, currency)}</span>
              </div>
            )}
            {invoice.taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Tax ({invoice.taxRate}%)</span>
                <span>{formatCurrency(invoice.taxAmount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between border-t-2 border-slate-900 pt-3 text-base font-bold">
              <span>Total</span>
              <span>{formatCurrency(invoice.total, currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {(invoice.notes || invoice.terms) && (
        <div className="grid grid-cols-2 gap-8 border-t border-slate-200 bg-slate-50 px-10 py-8 text-sm">
          {invoice.notes && (
            <div>
              <p className="mb-2 font-semibold uppercase tracking-wider text-slate-500">
                Notes
              </p>
              <p className="whitespace-pre-line text-slate-700">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <p className="mb-2 font-semibold uppercase tracking-wider text-slate-500">
                Terms
              </p>
              <p className="whitespace-pre-line text-slate-700">{invoice.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
