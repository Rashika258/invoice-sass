import Link from 'next/link';
import { listItems } from '@/actions/items';

export default async function Page() {
  const items = await listItems();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Items</h2>
        <Link href="/management/items/new" className="px-3 py-2 bg-blue-600 text-white rounded">
          New Item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="p-6 bg-white rounded shadow text-center">No items yet. Create one.</div>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="p-4 bg-white rounded shadow flex items-center justify-between">
              <div>
                <div className="font-semibold">{it.name}</div>
                <div className="text-sm text-zinc-600">HSN: {it.hsn || '-'}</div>
              </div>
              <div className="text-sm">{it.rate.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
