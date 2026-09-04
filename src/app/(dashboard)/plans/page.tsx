"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  Crown,
  HelpCircle,
  MoreVertical,
  Shield,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SILVER_FEATURES = [
  { text: "Sync data across devices", included: true },
  { text: "Create multiple companies (3 companies)", included: true },
  { text: "Generate E-way Bills (10 per month)", included: true },
  { text: "Remove advertisement on invoices", included: true },
  { text: "Set multiple pricing for items", included: true },
  { text: "Update Items in bulk", included: true },
  { text: "Export data to Tally", included: false },
  { text: "Restore deleted transactions (2 transactions)", included: true },
  { text: "Combine multiple orders/challans into one sale", included: false },
  { text: "Accounting Module", included: false },
  { text: "Partywise Profit and Loss Report", included: false },
  { text: "WhatsApp Connect", included: false },
];

const GOLD_FEATURES = [
  { text: "Sync data across devices", included: true },
  { text: "Create multiple companies (5 companies)", included: true },
  { text: "Generate E-way Bills (unlimited)", included: true },
  { text: "Remove advertisement on invoices", included: true },
  { text: "Set multiple pricing for items", included: true },
  { text: "Update Items in bulk", included: true },
  { text: "Export data to Tally", included: true },
  { text: "Restore deleted transactions (unlimited)", included: true },
  { text: "Combine multiple orders/challans into one sale", included: true },
  { text: "Accounting Module", included: true },
  { text: "Partywise Profit and Loss Report", included: true },
  { text: "WhatsApp Connect", included: true },
];

export default function PlansPricingPage() {
  const [deviceType, setDeviceType] = useState<"DESKTOP_MOBILE" | "DESKTOP">("DESKTOP_MOBILE");
  const [tenure, setTenure] = useState<"1_YEAR" | "3_YEAR">("1_YEAR");
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);

  const is3Year = tenure === "3_YEAR";
  const silverPrice = is3Year ? "10,999" : "4,399";
  const silverOldPrice = is3Year ? "18,999" : "7,499";
  const silverPerMonth = is3Year ? "305.52" : "366.58";

  const goldPrice = is3Year ? "11,999" : "4,799";
  const goldOldPrice = is3Year ? "22,999" : "9,099";
  const goldPerMonth = is3Year ? "333.30" : "399.92";

  return (
    <div className="relative min-h-[calc(100vh-5rem)] pb-16 space-y-6">
      {/* Top Header Row matching media_1788527632317.png */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Plans &amp; Pricing
        </h1>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Contacting corporate enterprise sales team...")}
            className="h-8 text-xs font-semibold rounded-lg text-primary border-primary/40 bg-primary/5 hover:bg-primary/10"
          >
            Buy Multiple Licenses
          </Button>
          <button type="button" className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer">
            <MoreVertical className="size-4" />
          </button>
        </div>
      </div>

      {/* Dropdown Filters matching media_1788527632317.png */}
      <div className="flex items-center justify-center gap-3 select-none">
        <select
          value={deviceType}
          onChange={(e) => setDeviceType(e.target.value as any)}
          className="h-8 px-3 rounded-full border border-border bg-card text-xs font-semibold text-foreground cursor-pointer outline-hidden shadow-2xs"
        >
          <option value="DESKTOP_MOBILE">Desktop + Mobile</option>
          <option value="DESKTOP">Desktop Only</option>
        </select>

        <select
          value={tenure}
          onChange={(e) => setTenure(e.target.value as any)}
          className="h-8 px-3 rounded-full border border-border bg-card text-xs font-semibold text-foreground cursor-pointer outline-hidden shadow-2xs"
        >
          <option value="1_YEAR">1 Year</option>
          <option value="3_YEAR">3 Years (Save 20% Extra)</option>
        </select>
      </div>

      {/* 2 Plan Cards Grid matching media_1788527632317.png */}
      <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto items-stretch pt-2">
        {/* SILVER CARD */}
        <div className="relative rounded-2xl border border-border/80 bg-card p-6 shadow-2xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Header: Icon & Plan Name */}
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-zinc-400 text-white font-bold text-xs">
                ▼
              </div>
              <h3 className="text-lg font-bold text-foreground">Silver</h3>
            </div>

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-muted-foreground line-through font-mono">
                  ₹{silverOldPrice}
                </span>
                <span className="text-2xl font-black text-foreground font-mono">
                  ₹{silverPrice}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                Only ₹{silverPerMonth} per month
              </p>
            </div>

            {/* Get Vyapar Silver Button */}
            <Button
              variant="outline"
              onClick={() => setCheckoutPlan("Silver")}
              className="w-full h-10 rounded-full border-2 border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/10 font-bold text-xs shadow-xs cursor-pointer"
            >
              Get Vyapar Silver
            </Button>

            {/* Features Checklist */}
            <div className="space-y-2.5 pt-3 border-t border-border/60 text-xs">
              {SILVER_FEATURES.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  {feat.included ? (
                    <Check className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                  ) : (
                    <X className="size-4 shrink-0 text-rose-500 mt-0.5" />
                  )}
                  <span className={feat.included ? "text-foreground" : "text-muted-foreground"}>
                    {feat.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GOLD CARD (With "Most Popular" Ribbon) */}
        <div className="relative rounded-2xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-500/[0.04] to-card p-6 shadow-md flex flex-col justify-between space-y-6">
          {/* Most Popular Ribbon */}
          <div className="absolute -top-3.5 right-6 bg-[#ef4444] text-white px-3 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-xs">
            Most Popular
          </div>

          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-xs">
                ▼
              </div>
              <h3 className="text-lg font-bold text-foreground">Gold</h3>
            </div>

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-muted-foreground line-through font-mono">
                  ₹{goldOldPrice}
                </span>
                <span className="text-2xl font-black text-foreground font-mono">
                  ₹{goldPrice}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                Only ₹{goldPerMonth} per month
              </p>
            </div>

            {/* Get Vyapar Gold Button */}
            <Button
              onClick={() => setCheckoutPlan("Gold")}
              className="w-full h-10 rounded-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              Get Vyapar Gold
            </Button>

            {/* Features Checklist */}
            <div className="space-y-2.5 pt-3 border-t border-border/60 text-xs">
              {GOLD_FEATURES.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <Check className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span className="text-foreground font-medium">{feat.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Pill: Compare All Features */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <Button
          onClick={() => setCompareModalOpen(true)}
          className="h-9 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 text-xs shadow-lg shadow-sky-600/30 cursor-pointer"
        >
          Compare All Features
        </Button>
      </div>

      {/* Compare Features Modal */}
      <Dialog open={compareModalOpen} onOpenChange={setCompareModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Silver vs Gold Feature Comparison</DialogTitle>
          </DialogHeader>
          <div className="divide-y divide-border text-xs pt-2">
            <div className="grid grid-cols-12 py-2 font-bold text-muted-foreground uppercase text-[10px]">
              <div className="col-span-6">Capability</div>
              <div className="col-span-3 text-center">Silver (₹{silverPrice})</div>
              <div className="col-span-3 text-center text-amber-500">Gold (₹{goldPrice})</div>
            </div>
            {GOLD_FEATURES.map((gf, i) => {
              const sf = SILVER_FEATURES[i];
              return (
                <div key={i} className="grid grid-cols-12 py-2.5 items-center">
                  <div className="col-span-6 font-medium text-foreground">{gf.text}</div>
                  <div className="col-span-3 text-center font-mono">
                    {sf.included ? <Check className="size-4 text-emerald-500 mx-auto" /> : <X className="size-4 text-rose-500 mx-auto" />}
                  </div>
                  <div className="col-span-3 text-center font-mono">
                    <Check className="size-4 text-emerald-500 mx-auto" />
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      <Dialog open={!!checkoutPlan} onOpenChange={(open) => !open && setCheckoutPlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Crown className="size-4 text-amber-500" />
              Upgrade to Vyapar {checkoutPlan}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2 text-xs">
            <div className="rounded-xl bg-muted/40 p-3 space-y-1">
              <div className="flex justify-between font-bold text-sm">
                <span>Total Payable (Annual)</span>
                <span className="font-mono text-primary">₹ {checkoutPlan === "Gold" ? goldPrice : silverPrice}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Includes all GST, automated cloud backup, and lifetime mobile sync.</p>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-foreground">Select Payment Method:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toast.success(`License activated for Vyapar ${checkoutPlan}! Thank you.`);
                    setCheckoutPlan(null);
                  }}
                  className="p-3 rounded-xl border border-border hover:border-primary text-left cursor-pointer transition-colors bg-card"
                >
                  <span className="font-bold block">UPI / QR Code</span>
                  <span className="text-[10px] text-muted-foreground">Instant Activation</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success(`License activated for Vyapar ${checkoutPlan}! Thank you.`);
                    setCheckoutPlan(null);
                  }}
                  className="p-3 rounded-xl border border-border hover:border-primary text-left cursor-pointer transition-colors bg-card"
                >
                  <span className="font-bold block">Net Banking / Card</span>
                  <span className="text-[10px] text-muted-foreground">Visa, MasterCard, RuPay</span>
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
