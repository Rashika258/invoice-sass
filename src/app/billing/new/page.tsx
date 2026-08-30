"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [dueDate, setDueDate] = useState<string>('');
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [lines, setLines] = useState<any[]>([{ description: '', hsn: '', quantity: 1, rate: 0 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/customers').then((r) => r.json()).then(setCustomers).catch(console.error);
    fetch('/api/items').then((r) => r.json()).then(setItems).catch(console.error);
  }, []);

  function updateLine(index: number, patch: any) {
    setLines((prev) => prev.map((l, i) => i === index ? { ...l, ...patch } : l));
  }

  function addLine() {
    setLines((prev) => [...prev, { description: '', hsn: '', quantity: 1, rate: 0 }]);
  }

  function removeLine(i: number) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  function calculateSubtotal() {
    return lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.rate) || 0), 0);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      customerId,
      issueDate,
      dueDate: dueDate || undefined,
      taxPercent,
      lines,
    };

    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const created = await res.json();
      router.push(`/billing/${created.id}`);
    } else {
      const txt = await res.text();
      alert('Failed to create invoice: ' + txt);
    }
    setSaving(false);
  }

  const subtotal = calculateSubtotal();
  const tax = (subtotal * (Number(taxPercent) || 0)) / 100;
  const total = subtotal + tax;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">New Invoice</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <select value={customerId ?? ''} onChange={(e) => setCustomerId(e.target.value || null)} className="border p-2">
            <option value="">Select customer</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="border p-2" />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="border p-2" />
        </div>

        <div>
          <h3 className="font-semibold mb-2">Items</h3>
          <div className="space-y-2">
            {lines.map((l, i) => (
              <div key={i} className="flex gap-2">
                <select value={l.itemId || ''} onChange={(e) => {
                  const item = items.find(it => it.id === e.target.value);
                  updateLine(i, { itemId: e.target.value, description: item ? item.name : '', hsn: item?.hsn || '', rate: item?.rate || 0 });
                }} className="border p-2 w-48">
                  <option value="">Select item (or leave blank)</option>
                  {items.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
                </select>
                <input className="flex-1 border p-2" placeholder="Description" value={l.description} onChange={(e) => updateLine(i, { description: e.target.value })} />
                <input className="w-24 border p-2" placeholder="HSN" value={l.hsn} onChange={(e) => updateLine(i, { hsn: e.target.value })} />
                <input type="number" className="w-24 border p-2" value={l.quantity} onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })} />
                <input type="number" className="w-32 border p-2" value={l.rate} onChange={(e) => updateLine(i, { rate: Number(e.target.value) })} />
                <button type="button" onClick={() => removeLine(i)} className="px-2 py-1 bg-red-500 text-white rounded">Remove</button>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <button type="button" onClick={addLine} className="px-3 py-1 bg-green-600 text-white rounded">Add item</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">Tax % <input type="number" value={taxPercent} onChange={(e) => setTaxPercent(Number(e.target.value))} className="w-24 border p-2" /></label>
          <div className="ml-auto text-right">
            <div>Subtotal: {subtotal.toFixed(2)}</div>
            <div>Tax: {tax.toFixed(2)}</div>
            <div className="font-semibold">Total: {total.toFixed(2)}</div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => router.push('/billing')} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={saving}>{saving ? 'Saving...' : 'Save Invoice'}</button>
        </div>
      </form>
    </div>
  );
}
