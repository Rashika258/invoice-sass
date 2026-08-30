import { redirect } from 'next/navigation';

export default function Page() {
  // Server-side redirect from /invoices to /billing
  redirect('/billing');
}
