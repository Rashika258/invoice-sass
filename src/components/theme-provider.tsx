"use client";

import { useEffect } from "react";
import { applyBrandTheme, getStoredBrandTheme } from "@/lib/brand-theme";

const THEME_KEY = "invoiceflow-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", savedTheme ? savedTheme === "dark" : prefersDark);

    // Dynamic Brand Accent Color
    const storedBrand = getStoredBrandTheme();
    if (storedBrand?.primary) {
      applyBrandTheme(storedBrand.primary, storedBrand.name);
    }
  }, []);

  return children;
}

export function setDocumentTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  window.localStorage.setItem(THEME_KEY, theme);
}
