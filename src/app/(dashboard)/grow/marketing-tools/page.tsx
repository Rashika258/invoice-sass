"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Gift,
  Megaphone,
  MessageCircle,
  Percent,
  Send,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function MarketingToolsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/grow/online-store"
            className="flex size-8 items-center justify-center rounded-lg border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Megaphone className="size-5 text-primary" />
              Marketing &amp; Promotional Campaigns
            </h1>
            <p className="text-xs text-muted-foreground">
              Run automated customer retention, festive greetings, Google My Business promotion, and WhatsApp store broadcasts.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-primary/50 transition-all cursor-pointer">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit">
            <MessageCircle className="size-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">WhatsApp Broadcasts</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Send bulk catalogue items, new stock alerts &amp; payment reminders directly to customer phones.
          </p>
          <Link
            href="/grow/whatsapp-marketing"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 hover:underline pt-2"
          >
            Open WhatsApp Studio &rarr;
          </Link>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-primary/50 transition-all cursor-pointer">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 w-fit">
            <Sparkles className="size-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Google My Business Profile</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Boost local SEO search visibility, collect 5-star customer reviews, and display product catalogs on Google Maps.
          </p>
          <Link
            href="/grow/google-profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:underline pt-2"
          >
            Manage Google Profile &rarr;
          </Link>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-primary/50 transition-all cursor-pointer">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 w-fit">
            <Gift className="size-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Digital Storefront</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Share your e-commerce URL with QR code flyers to accept self-orders and UPI payments online 24/7.
          </p>
          <Link
            href="/grow/online-store"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-500 hover:underline pt-2"
          >
            Open Digital Store &rarr;
          </Link>
        </Card>
      </div>
    </div>
  );
}
