import Link from 'next/link';
import { listCustomers } from '@/actions/customers';

export default async function Page() {
  const customers = await listCustomers();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Customers</h2>
        <Link href="/management/customers/new" className="px-3 py-2 bg-blue-600 text-white rounded">
          New Customer
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="p-6 bg-white rounded shadow text-center">No customers yet. Create one.</div>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <div key={c.id} className="p-4 bg-white rounded shadow flex items-center justify-between">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-zinc-600">{c.gstin || ''}</div>
              </div>
              <div className="text-sm">{c.state}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
