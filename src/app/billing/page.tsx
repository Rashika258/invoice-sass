import { listInvoices } from '@/actions/invoices';
import Link from 'next/link';

export default async function Page() {
  const invoices = await listInvoices();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Invoices</h2>
        <Link href="/billing/new" className="px-3 py-2 bg-blue-600 text-white rounded">New Invoice</Link>
      </div>

      {invoices.length === 0 ? (
        <div className="p-6 bg-white rounded shadow text-center">No invoices yet. Create one.</div>
      ) : (
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div key={inv.id} className="p-4 bg-white rounded shadow flex items-center justify-between">
              <div>
                <div className="font-semibold">{inv.invoiceNumber ?? '#' + inv.id.slice(0,6)}</div>
                <div className="text-sm text-zinc-600">To: {inv.customer?.name ?? '—'}</div>
              </div>
              <div className="text-sm">{inv.total.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
