"use client";

import { useEffect } from "react";
import { updateBrowserFavicon } from "@/lib/brand-theme";

/**
 * BrandFaviconSync synchronizes the active company profile's logo
 * with the browser tab favicon and touch icons dynamically.
 * When the user switches companies or updates their logo, the tab icon updates immediately.
 */
export function BrandFaviconSync({ logoUrl }: { logoUrl?: string | null }) {
  useEffect(() => {
    updateBrowserFavicon(logoUrl);
  }, [logoUrl]);

  return null;
}
