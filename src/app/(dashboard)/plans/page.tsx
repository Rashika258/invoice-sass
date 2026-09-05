"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Check,
  ChevronDown,
  Crown,
  HelpCircle,
  MoreVertical,
  Shield,
  Sparkles,
  Users,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);

  // Bulk license calculator state
  const [bulkPlan, setBulkPlan] = useState<"SILVER" | "GOLD">("GOLD");
  const [licenseCount, setLicenseCount] = useState<number>(5);
  const [companyName, setCompanyName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const is3Year = tenure === "3_YEAR";
  const silverPriceNum = is3Year ? 10999 : 4399;
  const silverPrice = is3Year ? "10,999" : "4,399";
  const silverOldPrice = is3Year ? "18,999" : "7,499";
  const silverPerMonth = is3Year ? "305.52" : "366.58";

  const goldPriceNum = is3Year ? 11999 : 4799;
  const goldPrice = is3Year ? "11,999" : "4,799";
  const goldOldPrice = is3Year ? "22,999" : "9,099";
  const goldPerMonth = is3Year ? "333.30" : "399.92";

  // Bulk pricing calculations (25% volume discount for 5+ licenses)
  const basePricePerLicense = bulkPlan === "GOLD" ? goldPriceNum : silverPriceNum;
  const rawSubtotal = basePricePerLicense * licenseCount;
  const bulkDiscount = Math.round(rawSubtotal * 0.25);
  const bulkTotal = rawSubtotal - bulkDiscount;

  return (
    <div className="relative min-h-[calc(100vh-5rem)] pb-16 space-y-6 select-none">
      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <span>Plans &amp; Pricing</span>
          <Badge variant="outline" className="text-[10px] text-brand border-brand/20 bg-brand-light font-bold">
            BUSINESS OS
          </Badge>
        </h1>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkModalOpen(true)}
            className="h-8 text-xs font-semibold rounded-lg text-primary border-primary/40 bg-primary/5 hover:bg-primary/10 cursor-pointer"
          >
            Buy Multiple Licenses
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
                  <MoreVertical className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56 z-[100]">
              <DropdownMenuItem onClick={() => setCompareModalOpen(true)}>
                Compare All Features
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setBulkModalOpen(true)}>
                Buy Multiple Licenses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("License Key Status: Active & Valid")}>
                Verify License Key
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Opening enterprise support desk...")}>
                Contact Sales Desk
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dropdown Filters */}
      <div className="flex items-center justify-center gap-3">
        <Select value={deviceType} onValueChange={(val) => setDeviceType(val as any)}>
          <SelectTrigger className="h-8 px-3 rounded-full border border-border bg-card text-xs font-semibold text-foreground shadow-2xs w-44">
            <SelectValue placeholder="Device">
              {deviceType === "DESKTOP_MOBILE" ? "Desktop + Mobile" : "Desktop Only"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DESKTOP_MOBILE">Desktop + Mobile</SelectItem>
            <SelectItem value="DESKTOP">Desktop Only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tenure} onValueChange={(val) => setTenure(val as any)}>
          <SelectTrigger className="h-8 px-3 rounded-full border border-border bg-card text-xs font-semibold text-foreground shadow-2xs w-48">
            <SelectValue placeholder="Tenure">
              {tenure === "1_YEAR" ? "1 Year" : "3 Years (Save 20% Extra)"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1_YEAR">1 Year</SelectItem>
            <SelectItem value="3_YEAR">3 Years (Save 20% Extra)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 2 Plan Cards Grid */}
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

            {/* Get Billora Silver Button */}
            <Button
              variant="outline"
              onClick={() => setCheckoutPlan("Silver")}
              className="w-full h-10 rounded-full border-2 border-brand text-brand hover:bg-brand-light font-bold text-xs shadow-xs cursor-pointer"
            >
              Get Billora Silver
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
                  <span className={feat.included ? "text-foreground font-medium" : "text-muted-foreground"}>
                    {feat.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GOLD CARD */}
        <div className="relative rounded-2xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-500/[0.04] to-card p-6 shadow-md flex flex-col justify-between space-y-6">
          <div className="absolute -top-3.5 right-6 bg-brand text-white px-3 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-xs">
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

            {/* Get Billora Gold Button */}
            <Button
              onClick={() => setCheckoutPlan("Gold")}
              className="w-full h-10 rounded-full bg-brand hover:opacity-90 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              Get Billora Gold
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
          className="h-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 text-xs shadow-lg shadow-primary/20 cursor-pointer"
        >
          Compare All Features
        </Button>
      </div>

      {/* Compare Features Modal */}
      <Dialog open={compareModalOpen} onOpenChange={setCompareModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center justify-between border-b pb-3">
              <span>Silver vs Gold Feature Comparison</span>
            </DialogTitle>
          </DialogHeader>

          <Table className="mt-2">
            <TableHeader className="bg-muted/70">
              <TableRow>
                <TableHead className="w-1/2">Capability</TableHead>
                <TableHead className="text-center font-bold">Silver (₹{silverPrice})</TableHead>
                <TableHead className="text-center font-bold text-amber-600 dark:text-amber-400">Gold (₹{goldPrice})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {GOLD_FEATURES.map((gf, i) => {
                const sf = SILVER_FEATURES[i];
                return (
                  <TableRow key={i} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">{gf.text}</TableCell>
                    <TableCell className="text-center">
                      {sf.included ? (
                        <Check className="size-4 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="size-4 text-rose-500 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="size-4 text-emerald-500 mx-auto" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      {/* Buy Multiple Licenses Modal */}
      <Dialog open={bulkModalOpen} onOpenChange={setBulkModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              <span>Buy Multiple Licenses (Corporate / Multi-Branch)</span>
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success(`Order placed for ${licenseCount} Billora ${bulkPlan} Licenses! Our team will contact ${contactPhone || "you"} shortly.`);
              setBulkModalOpen(false);
            }}
            className="space-y-4 pt-2 text-xs"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Select Tier</Label>
                <Select value={bulkPlan} onValueChange={(val) => setBulkPlan(val as any)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Tier">
                      {bulkPlan === "GOLD" ? "Gold Tier (Full Features)" : "Silver Tier"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOLD">Gold Tier (Full Features)</SelectItem>
                    <SelectItem value="SILVER">Silver Tier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Number of Licenses</Label>
                <Select value={String(licenseCount)} onValueChange={(val) => setLicenseCount(Number(val))}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Quantity">
                      {licenseCount} Licenses (25% Bulk Disc.)
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Licenses</SelectItem>
                    <SelectItem value="5">5 Licenses (Save 25%)</SelectItem>
                    <SelectItem value="10">10 Licenses (Save 25%)</SelectItem>
                    <SelectItem value="25">25 Licenses (Save 30%)</SelectItem>
                    <SelectItem value="50">50+ Enterprise Licenses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company / Business Name *</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Sri Manjunatha Enterprises"
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contactPhone">Contact Phone Number *</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
                className="h-9 text-xs"
              />
            </div>

            {/* Calculated Pricing Summary Card */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Standard Rate ({licenseCount} × ₹{basePricePerLicense.toLocaleString()}):</span>
                <span className="font-mono text-muted-foreground line-through">₹{rawSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-emerald-600 font-semibold">
                <span>Corporate Volume Discount (25% OFF):</span>
                <span className="font-mono">- ₹{bulkDiscount.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-primary/20 flex justify-between items-center font-bold text-sm">
                <span>Total Payable Amount:</span>
                <span className="font-mono text-primary text-base">₹{bulkTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setBulkModalOpen(false)} className="h-9 text-xs">
                Cancel
              </Button>
              <Button type="submit" className="h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
                Proceed to Bulk Checkout
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Single Checkout Modal */}
      <Dialog open={!!checkoutPlan} onOpenChange={(open) => !open && setCheckoutPlan(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Crown className="size-4 text-amber-500" />
              <span>Upgrade to Billora {checkoutPlan}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2 text-xs">
            <div className="rounded-xl bg-muted/40 p-3 space-y-1">
              <div className="flex justify-between font-bold text-sm">
                <span>Total Payable ({is3Year ? "3 Years" : "Annual"})</span>
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
                    toast.success(`License activated for Billora ${checkoutPlan}! Thank you.`);
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
                    toast.success(`License activated for Billora ${checkoutPlan}! Thank you.`);
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
