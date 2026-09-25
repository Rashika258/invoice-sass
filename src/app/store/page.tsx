'use client'
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Store landing page.
 *
 * The project only defines a dynamic route `store/[slug]/page.tsx` for individual
 * store pages. Accessing `/store` therefore results in a 404. This file provides a
 * top‑level store page that lists available stores (placeholder) and redirects to
 * a default store when appropriate.
 */
export default function StoreLanding() {
  const router = useRouter();

  // If you have a default slug, you could redirect automatically.
  // For now we simply render a placeholder with a link to a sample store.
  const defaultSlug = 'example'; // TODO: replace with a real store slug or fetch from API.

  useEffect(() => {
    // Optional auto‑redirect logic – uncomment if you want immediate navigation.
    // router.replace(`/store/${defaultSlug}`);
  }, [router]);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Online Store</h1>
      <p className="mb-2">Select a store to view its dashboard.</p>
      <Link
        href={`/store/${defaultSlug}`}
        className="text-blue-600 hover:underline"
      >
        Go to Example Store
      </Link>
    </main>
  );
}
