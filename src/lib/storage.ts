const KEY = "invoice_sass_invoices_v1";

import type { Invoice } from "./invoices";

export function loadInvoices(): Invoice[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Invoice[];
  } catch (e) {
    console.error("Failed to load invoices", e);
    return [];
  }
}

export function saveInvoices(invoices: Invoice[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(invoices));
  } catch (e) {
    console.error("Failed to save invoices", e);
  }
}

export function saveInvoice(invoice: Invoice) {
  const invoices = loadInvoices();
  const existing = invoices.find((i) => i.id === invoice.id);
  if (existing) {
    const updated = invoices.map((i) => (i.id === invoice.id ? invoice : i));
    saveInvoices(updated);
  } else {
    invoices.push(invoice);
    saveInvoices(invoices);
  }
}

export function deleteInvoice(id: string) {
  const invoices = loadInvoices().filter((i) => i.id !== id);
  saveInvoices(invoices);
}

export function getInvoice(id: string) {
  return loadInvoices().find((i) => i.id === id) || null;
}
