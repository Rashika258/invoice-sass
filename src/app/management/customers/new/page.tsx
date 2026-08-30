"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCustomerPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, gstin, address, state, phone }),
    });
    if (res.ok) {
      router.push('/management/customers');
    } else {
      const text = await res.text();
      alert('Failed to save: ' + text);
    }
    setSaving(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">New Customer</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <input className="w-full border p-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="w-full border p-2" placeholder="GSTIN" value={gstin} onChange={(e) => setGstin(e.target.value)} />
        <input className="w-full border p-2" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
        <textarea className="w-full border p-2" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <input className="w-full border p-2" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => router.push('/management/customers')} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
