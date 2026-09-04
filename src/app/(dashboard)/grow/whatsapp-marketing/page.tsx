"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Gift,
  MessageCircle,
  Percent,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function WhatsAppMarketingPage() {
  const [template, setTemplate] = useState(
    "🎉 Exclusive Festive Offer!\n\nDear Customer, thank you for being a valued client of our business. Enjoy a special 10% discount on all purchases this week!\n\nCheck our online catalog or reply to order directly. Have a great day!",
  );

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
              <MessageCircle className="size-5 text-emerald-500" />
              WhatsApp Marketing
            </h1>
            <p className="text-xs text-muted-foreground">
              Send bulk festival greetings, seasonal promotional offers &amp; payment reminders to your parties.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground">Message Campaign Composer</h3>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setTemplate(
                  "🎉 Festive Greeting & Discounts!\n\nWishing you a joyful season! Visit our store or order online to get exclusive discounts today.",
                )
              }
              className="text-xs rounded-xl h-7"
            >
              <Gift className="mr-1 size-3 text-purple-400" />
              Festive
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setTemplate(
                  "📢 New Stock Alert!\n\nFresh inventory of top products has just arrived at our store. Reply now to reserve your order before stock runs out!",
                )
              }
              className="text-xs rounded-xl h-7"
            >
              <Sparkles className="mr-1 size-3 text-amber-400" />
              New Stock
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setTemplate(
                  "⏰ Gentle Payment Reminder\n\nDear Client, kindly find attached your outstanding balance statement. Please settle at your earliest convenience via UPI.",
                )
              }
              className="text-xs rounded-xl h-7"
            >
              <Percent className="mr-1 size-3 text-sky-400" />
              Reminder
            </Button>
          </div>

          <Textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={6}
            className="rounded-xl bg-muted/30 text-xs font-sans leading-relaxed"
          />

          <a
            href={`https://wa.me/?text=${encodeURIComponent(template)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 text-xs shadow-md"
          >
            <Send className="size-3.5" />
            <span>Launch WhatsApp Campaign</span>
          </a>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground">Campaign Benefits</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 font-bold">
                98%
              </span>
              <div>
                <p className="font-bold text-foreground">Open Rate</p>
                <p className="text-muted-foreground mt-0.5">
                  WhatsApp messages have an average 98% open rate compared to 20% for email.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
                3x
              </span>
              <div>
                <p className="font-bold text-foreground">Faster Collections</p>
                <p className="text-muted-foreground mt-0.5">
                  Parties pay 3x faster when UPI QR code invoice links are delivered directly on chat.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
