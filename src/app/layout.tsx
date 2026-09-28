import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider, ThemeScript } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const fontSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

import { getAppName } from "@/lib/app-config";

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const appName = getAppName();

export const metadata: Metadata = {
  title: `${appName} — Business OS for Indian SMBs`,
  description:
    "The complete Operating System for Indian SMBs. Run sales, purchases, inventory, double-entry accounting, GST, payments, staff attendance, and AI business insights in one unified platform.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: `${appName} OS`,
  },
};

import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} font-sans h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body suppressHydrationWarning className="flex min-h-full flex-col">
        <ThemeProvider>
          <TooltipProvider delay={250}>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
