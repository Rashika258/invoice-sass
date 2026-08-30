"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewItemPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [hsn, setHsn] = useState('');
  const [unit, setUnit] = useState('');
  const [rate, setRate] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, hsn, unit, rate: Number(rate) || 0 }),
    });
    if (res.ok) {
      router.push('/management/items');
    } else {
      const text = await res.text();
      alert('Failed to save: ' + text);
    }
    setSaving(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">New Item</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <input className="w-full border p-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="w-full border p-2" placeholder="HSN" value={hsn} onChange={(e) => setHsn(e.target.value)} />
        <input className="w-full border p-2" placeholder="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
        <input className="w-full border p-2" placeholder="Rate" type="number" value={rate as any} onChange={(e) => setRate(e.target.value === '' ? '' : Number(e.target.value))} />
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => router.push('/management/items')} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
