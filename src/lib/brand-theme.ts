export interface BrandThemePreset {
  id: string;
  name: string;
  primary: string; // Hex color code
  primaryHover: string;
  secondary: string;
  fontFamily: string;
  description: string;
}

export interface BrandFontOption {
  id: string;
  name: string;
  fontFamily: string;
  category: string;
  googleFont?: string;
  sampleText: string;
  description: string;
}

export interface BrandConfig {
  primary: string;
  secondary?: string;
  name: string;
  fontFamily?: string;
  logoUrl?: string;
  tagline?: string;
  headerStyle?: "MODERN_MINIMAL" | "BOLD_GRADIENT" | "CLASSIC_ELEGANT" | "INDUSTRIAL_SOLID";
}

export const BRAND_THEME_PRESETS: BrandThemePreset[] = [
  {
    id: "emerald",
    name: "Emerald Green",
    primary: "#10b981",
    primaryHover: "#059669",
    secondary: "#047857",
    fontFamily: "Inter, sans-serif",
    description: "Industrial engineering, agro-supplies & accounting (Sri Manjunatha default)",
  },
  {
    id: "blue",
    name: "Corporate Blue",
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    secondary: "#1e40af",
    fontFamily: "Inter, sans-serif",
    description: "Enterprise, tech, distribution & logistics",
  },
  {
    id: "purple",
    name: "Royal Purple",
    primary: "#8b5cf6",
    primaryHover: "#7c3aed",
    secondary: "#6d28d9",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    description: "Modern SaaS, creative agencies & luxury retail",
  },
  {
    id: "red",
    name: "Vibrant Crimson",
    primary: "#ef4444",
    primaryHover: "#dc2626",
    secondary: "#b91c1c",
    fontFamily: "Inter, sans-serif",
    description: "Retail FMCG, fast billing, grocery & hardware outlets",
  },
  {
    id: "amber",
    name: "Industrial Amber",
    primary: "#f59e0b",
    primaryHover: "#d97706",
    secondary: "#b45309",
    fontFamily: "Outfit, sans-serif",
    description: "Heavy machinery, automotive parts & construction materials",
  },
  {
    id: "teal",
    name: "Modern Teal",
    primary: "#0d9488",
    primaryHover: "#0f766e",
    secondary: "#115e59",
    fontFamily: "Inter, sans-serif",
    description: "Fintech, healthcare & chemical engineering",
  },
  {
    id: "indigo",
    name: "Midnight Indigo",
    primary: "#6366f1",
    primaryHover: "#4f46e5",
    secondary: "#3730a3",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    description: "Digital consulting, software firms & high-tech manufacturing",
  },
  {
    id: "rose",
    name: "Rose Quartz",
    primary: "#f43f5e",
    primaryHover: "#e11d48",
    secondary: "#be123c",
    fontFamily: "Outfit, sans-serif",
    description: "Apparel, jewelry, salons & lifestyle brands",
  },
  {
    id: "slate",
    name: "Graphite Slate",
    primary: "#475569",
    primaryHover: "#334155",
    secondary: "#1e293b",
    fontFamily: "Roboto, sans-serif",
    description: "Minimalist executive, consulting & legal firms",
  },
];

export const BRAND_FONTS: BrandFontOption[] = [
  {
    id: "inter",
    name: "Inter",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    category: "Modern Sans",
    sampleText: "Invoice #INV-2026-0048 · Sri Manjunatha Engineering",
    description: "Clean, neutral, and highly legible for billing tables and numbers.",
  },
  {
    id: "plus-jakarta-sans",
    name: "Plus Jakarta Sans",
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    category: "Geometric Sans",
    googleFont: "Plus+Jakarta+Sans:wght@400;500;600;700;800",
    sampleText: "Modern ERP & Financial Management Suite",
    description: "Fresh, geometric, and contemporary tech aesthetic.",
  },
  {
    id: "outfit",
    name: "Outfit",
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
    category: "Clean Display",
    googleFont: "Outfit:wght@400;500;600;700",
    sampleText: "GST Invoicing & Inventory Control",
    description: "Bold headings and friendly, approachable typography.",
  },
  {
    id: "roboto",
    name: "Roboto",
    fontFamily: "'Roboto', sans-serif",
    category: "Corporate Sans",
    googleFont: "Roboto:wght@400;500;700",
    sampleText: "Tax Invoice / Delivery Challan Report",
    description: "Reliable, standard corporate font with clear distinction.",
  },
  {
    id: "playfair",
    name: "Playfair Display",
    fontFamily: "'Playfair Display', Georgia, serif",
    category: "Luxury Serif",
    googleFont: "Playfair+Display:wght@500;600;700",
    sampleText: "Certificate of Supply & Quality Assurance",
    description: "Elegant serif for premium, artisanal, and luxury enterprises.",
  },
  {
    id: "jetbrains-mono",
    name: "JetBrains Mono",
    fontFamily: "'JetBrains Mono', monospace",
    category: "Technical Mono",
    googleFont: "JetBrains+Mono:wght@400;500;600;700",
    sampleText: "HSN: 8483 · GSTIN: 29AEZPC6364C1Z5",
    description: "Precision tabular monospace for engineering & tech companies.",
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

export function loadGoogleFont(fontOption?: BrandFontOption) {
  if (typeof document === "undefined" || !fontOption?.googleFont) return;
  const linkId = `google-font-${fontOption.id}`;
  if (!document.getElementById(linkId)) {
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontOption.googleFont}&display=swap`;
    document.head.appendChild(link);
  }
}

export function getContrastTextColor(hexColor: string): string {
  let hex = hexColor.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  const num = parseInt(hex, 16);
  if (isNaN(num)) return "#ffffff";
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 165 ? "#09090b" : "#ffffff";
}

export function applyBrandTheme(primaryHex: string, presetName?: string, secondaryHex?: string, fontFamily?: string) {
  if (typeof document === "undefined") return;

  const hoverHex = adjustBrightness(primaryHex, -20);
  const lightRgba = hexToRgba(primaryHex, 0.12);
  const mediumRgba = hexToRgba(primaryHex, 0.2);
  const secHex = secondaryHex || adjustBrightness(primaryHex, -35);
  const contrastText = getContrastTextColor(primaryHex);

  const root = document.documentElement;
  root.style.setProperty("--brand-primary", primaryHex);
  root.style.setProperty("--brand-hover", hoverHex);
  root.style.setProperty("--brand-light", lightRgba);
  root.style.setProperty("--brand-medium", mediumRgba);
  root.style.setProperty("--brand-secondary", secHex);
  root.style.setProperty("--brand-foreground", contrastText);

  // Sync shadcn / base variables with dynamic high-contrast text
  root.style.setProperty("--primary", primaryHex);
  root.style.setProperty("--primary-foreground", contrastText);
  root.style.setProperty("--sidebar-primary", primaryHex);
  root.style.setProperty("--sidebar-primary-foreground", contrastText);
  root.style.setProperty("--ring", primaryHex);

  // Apply Font if provided
  if (fontFamily) {
    root.style.setProperty("--brand-font", fontFamily);
    document.body.style.fontFamily = fontFamily;
    const matchedFont = BRAND_FONTS.find((f) => f.fontFamily === fontFamily || fontFamily.includes(f.name));
    if (matchedFont) {
      loadGoogleFont(matchedFont);
    }
  }

  try {
    const current = getStoredBrandTheme();
    const toSave: BrandConfig = {
      ...current,
      primary: primaryHex,
      secondary: secHex,
      name: presetName || current.name || "Custom Brand",
      fontFamily: fontFamily || current.fontFamily || "Inter, sans-serif",
    };
    window.localStorage.setItem(BRAND_THEME_STORAGE_KEY, JSON.stringify(toSave));
    document.cookie = `billora_theme_color=${encodeURIComponent(primaryHex)}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // ignore local storage errors
  }
}

export function applyFullBrandConfig(config: Partial<BrandConfig>) {
  if (typeof document === "undefined") return;

  const primary = config.primary || "#10b981";
  const name = config.name || "Custom Brand";
  const secondary = config.secondary || adjustBrightness(primary, -35);
  const font = config.fontFamily || "Inter, sans-serif";

  applyBrandTheme(primary, name, secondary, font);

  if (config.logoUrl) {
    try {
      const root = document.documentElement;
      root.style.setProperty("--brand-logo", `url(${config.logoUrl})`);
    } catch {
      // ignore
    }
  }

  try {
    const current = getStoredBrandTheme();
    const updated = { ...current, ...config, primary, name, secondary, fontFamily: font };
    window.localStorage.setItem(BRAND_THEME_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getStoredBrandTheme(): BrandConfig {
  const fallback: BrandConfig = {
    primary: "#10b981",
    secondary: "#047857",
    name: "Emerald Green",
    fontFamily: "Inter, sans-serif",
    tagline: "Precision Engineering & Manufacturing",
    headerStyle: "MODERN_MINIMAL",
  };

  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(BRAND_THEME_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.primary) return { ...fallback, ...parsed };
    }
  } catch {
    // fallback
  }

  return fallback;
}
