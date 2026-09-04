export interface BrandThemePreset {
  id: string;
  name: string;
  primary: string; // Hex color code
  primaryHover: string;
  description: string;
}

export const BRAND_THEME_PRESETS: BrandThemePreset[] = [
  {
    id: "emerald",
    name: "Emerald Green",
    primary: "#10b981",
    primaryHover: "#059669",
    description: "Industrial engineering, agro-supplies & accounting (Sri Manjunatha default)",
  },
  {
    id: "blue",
    name: "Corporate Blue",
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    description: "Enterprise, tech, distribution & logistics",
  },
  {
    id: "purple",
    name: "Royal Purple",
    primary: "#8b5cf6",
    primaryHover: "#7c3aed",
    description: "Modern SaaS, creative agencies & luxury retail",
  },
  {
    id: "red",
    name: "Vibrant Crimson",
    primary: "#ef4444",
    primaryHover: "#dc2626",
    description: "Retail FMCG, fast billing, grocery & hardware outlets",
  },
  {
    id: "amber",
    name: "Industrial Amber",
    primary: "#f59e0b",
    primaryHover: "#d97706",
    description: "Heavy machinery, automotive parts & construction materials",
  },
  {
    id: "teal",
    name: "Modern Teal",
    primary: "#0d9488",
    primaryHover: "#0f766e",
    description: "Fintech, healthcare & chemical engineering",
  },
  {
    id: "slate",
    name: "Graphite Slate",
    primary: "#475569",
    primaryHover: "#334155",
    description: "Minimalist executive, consulting & legal firms",
  },
];

export const BRAND_THEME_STORAGE_KEY = "billora_brand_theme";

export function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(16, 185, 129, ${alpha})`;
}

export function adjustBrightness(hex: string, percent: number): string {
  const cleanHex = hex.replace("#", "");
  let num = parseInt(cleanHex, 16);
  if (isNaN(num)) return hex;

  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0x00ff) + percent;
  let b = (num & 0x0000ff) + percent;

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function applyBrandTheme(primaryHex: string, presetName?: string) {
  if (typeof document === "undefined") return;

  const hoverHex = adjustBrightness(primaryHex, -20);
  const lightRgba = hexToRgba(primaryHex, 0.12);
  const mediumRgba = hexToRgba(primaryHex, 0.2);

  const root = document.documentElement;
  root.style.setProperty("--brand-primary", primaryHex);
  root.style.setProperty("--brand-hover", hoverHex);
  root.style.setProperty("--brand-light", lightRgba);
  root.style.setProperty("--brand-medium", mediumRgba);

  // Sync shadcn / base variables
  root.style.setProperty("--primary", primaryHex);
  root.style.setProperty("--sidebar-primary", primaryHex);
  root.style.setProperty("--ring", primaryHex);

  try {
    const toSave = {
      primary: primaryHex,
      name: presetName || "Custom Brand",
    };
    window.localStorage.setItem(BRAND_THEME_STORAGE_KEY, JSON.stringify(toSave));
    // Set cookie so server or subsequent page renders can read it
    document.cookie = `billora_theme_color=${encodeURIComponent(primaryHex)}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // ignore local storage errors
  }
}

export function getStoredBrandTheme(): { primary: string; name: string } {
  if (typeof window === "undefined") {
    return { primary: "#10b981", name: "Emerald Green" };
  }

  try {
    const raw = window.localStorage.getItem(BRAND_THEME_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.primary) return parsed;
    }
  } catch {
    // fallback
  }

  return { primary: "#10b981", name: "Emerald Green" };
}
