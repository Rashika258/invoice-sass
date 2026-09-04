"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  MessageCircle,
  Package,
  Plus,
  Share2,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { getStoreCatalog, publishAllItemsToStore } from "@/actions/online-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OnlineStorePage() {
  const [storeData, setStoreData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    getStoreCatalog().then((data) => {
      setStoreData(data);
      if (data?.items?.some((it: any) => it.isPublic)) {
        setPublished(true);
      }
    });
  }, []);

  const storeSlug = storeData?.organizationId || "demo-store";
  const storeUrl = typeof window !== "undefined" ? `${window.location.origin}/store/${storeSlug}` : `/store/${storeSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = async () => {
    await publishAllItemsToStore();
    setPublished(true);
    // Refresh catalog
    const refreshed = await getStoreCatalog();
    setStoreData(refreshed);
  };

  const hasItems = storeData?.items && storeData.items.length > 0;

  return (
    <div className="space-y-6">
      {/* Header matching media_1788511645698.png */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Store className="size-5 text-primary" />
            My Online Store
          </h1>
          <p className="text-xs text-muted-foreground">
            Launch your e-commerce digital catalog and receive orders directly on WhatsApp.
          </p>
        </div>

        {published && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-8 text-xs font-semibold rounded-xl border-border"
            >
              {copied ? <Check className="mr-1.5 size-3.5 text-emerald-500" /> : <Copy className="mr-1.5 size-3.5" />}
              {copied ? "Copied!" : "Copy Store Link"}
            </Button>
            <Button
              size="sm"
              render={
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out our online catalog and order directly on WhatsApp: ${storeUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              className="h-8 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
            >
              <MessageCircle className="mr-1.5 size-3.5" />
              Share on WhatsApp
            </Button>
          </div>
        )}
      </div>

      {/* Main Grid: Left Banner + Step Card vs Right Checklist */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Left Column matching media_1788511645698.png */}
        <div className="space-y-5">
          {/* Blue Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500/20 via-primary/15 to-purple-500/20 border border-sky-500/30 p-6 sm:p-8">
            <div className="relative z-10 max-w-md space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Ab India Karega
                <span className="block text-primary">business online</span>
              </h2>
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-500 border border-emerald-500/30">
                  <Sparkles className="size-3" />
                  1134+ Stores created today 🎉
                </span>
              </div>
            </div>

            {/* Decorative Vector Storefront Icon */}
            <div className="absolute right-4 bottom-2 opacity-30 sm:opacity-50 pointer-events-none">
              <Store className="size-32 text-primary" />
            </div>
          </div>

          {/* Action Step Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground">
                You are just one step away from creating Online Store. 🎊
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {hasItems
                  ? `You have ${storeData.items.length} items in inventory ready to be displayed in your digital store.`
                  : "Please add an item to your inventory before proceeding."}
              </p>
            </div>

            {published ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                  <CheckCircle2 className="size-4" />
                  Your Online Store is Live!
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-background p-2.5 text-xs font-mono text-foreground border border-border">
                  <span className="truncate">{storeUrl}</span>
                  <Link
                    href={`/store/${storeSlug}`}
                    target="_blank"
                    className="flex items-center gap-1 font-sans text-xs font-semibold text-primary hover:underline shrink-0"
                  >
                    <span>View Store</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>
            ) : hasItems ? (
              <Button
                onClick={handlePublish}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all active:scale-[0.98]"
              >
                Publish Online Store Now
              </Button>
            ) : (
              <Button
                render={<Link href="/items" />}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md"
              >
                <Plus className="mr-1.5 size-4" />
                Add Item
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: To make more Money matching media_1788511645698.png */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            {/* 3 Value Badges */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1.5">
                <div className="mx-auto flex size-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                  <TrendingUp className="size-4.5" />
                </div>
                <p className="text-[11px] font-bold text-foreground leading-tight">
                  Grow Income 10x
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1.5">
                <div className="mx-auto flex size-9 items-center justify-center rounded-full bg-sky-500/15 text-sky-500">
                  <Users className="size-4.5" />
                </div>
                <p className="text-[11px] font-bold text-foreground leading-tight">
                  Get new customers online
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1.5">
                <div className="mx-auto flex size-9 items-center justify-center rounded-full bg-purple-500/15 text-purple-400">
                  <ShoppingBag className="size-4.5" />
                </div>
                <p className="text-[11px] font-bold text-foreground leading-tight">
                  Get more orders
                </p>
              </div>
            </div>

            {/* Checklist from media_1788511645698.png */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                To make more Money -
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Launch your business online in just 30 Seconds:
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                    ✓
                  </span>
                  <span>Add items to inventory</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <span className={`flex size-5 items-center justify-center rounded-full ${published ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                    ✓
                  </span>
                  <span>Create Online Store</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <span className={`flex size-5 items-center justify-center rounded-full ${published ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                    ✓
                  </span>
                  <span>Share your store with customers</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/60">
            <Link
              href="/grow/whatsapp-marketing"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 hover:bg-muted py-2 text-xs font-semibold text-foreground transition-colors"
            >
              <MessageCircle className="size-3.5 text-emerald-500" />
              <span>Explore WhatsApp Marketing</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
