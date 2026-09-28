"use client";

import { useEffect } from "react";
import { applyBrandTheme, getStoredBrandTheme } from "@/lib/brand-theme";

const THEME_KEY = "invoiceflow-theme";

export const themeInitScript = `
(function() {
  try {
    var themeKey = 'invoiceflow-theme';
    var savedTheme = localStorage.getItem(themeKey);
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    var brandRaw = localStorage.getItem('billora_brand_theme');
    if (brandRaw) {
      var brand = JSON.parse(brandRaw);
      if (brand && brand.primary) {
        var p = brand.primary;
        var root = document.documentElement;

        var clean = p.replace('#', '');
        if (clean.length === 3) clean = clean.split('').map(function(c){return c+c;}).join('');
        var num = parseInt(clean, 16);
        if (!isNaN(num)) {
          var r = (num >> 16) & 255;
          var g = (num >> 8) & 255;
          var b = num & 255;

          var yiq = (r * 299 + g * 587 + b * 114) / 1000;
          var contrastText = yiq >= 165 ? '#09090b' : '#ffffff';

          var hr = Math.max(0, r - 20).toString(16).padStart(2, '0');
          var hg = Math.max(0, g - 20).toString(16).padStart(2, '0');
          var hb = Math.max(0, b - 20).toString(16).padStart(2, '0');
          var hoverHex = '#' + hr + hg + hb;

          var sec = brand.secondary || hoverHex;
          var lightRgba = 'rgba(' + r + ',' + g + ',' + b + ',0.12)';
          var medRgba = 'rgba(' + r + ',' + g + ',' + b + ',0.2)';

          root.style.setProperty('--brand-primary', p);
          root.style.setProperty('--brand-hover', hoverHex);
          root.style.setProperty('--brand-light', lightRgba);
          root.style.setProperty('--brand-medium', medRgba);
          root.style.setProperty('--brand-secondary', sec);
          root.style.setProperty('--brand-foreground', contrastText);

          root.style.setProperty('--primary', p);
          root.style.setProperty('--primary-foreground', contrastText);
          root.style.setProperty('--sidebar-primary', p);
          root.style.setProperty('--sidebar-primary-foreground', contrastText);
          root.style.setProperty('--ring', p);

          if (brand.fontFamily) {
            root.style.setProperty('--brand-font', brand.fontFamily);
          }
        }
      }
    }
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return (
    <script
      id="theme-initializer"
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: themeInitScript,
      }}
    />
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", savedTheme ? savedTheme === "dark" : prefersDark);

    // Dynamic Brand Accent Color
    const storedBrand = getStoredBrandTheme();
    if (storedBrand?.primary) {
      applyBrandTheme(
        storedBrand.primary,
        storedBrand.name,
        storedBrand.secondary,
        storedBrand.fontFamily
      );
    }
  }, []);

  return children;
}

export function setDocumentTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  window.localStorage.setItem(THEME_KEY, theme);
}
