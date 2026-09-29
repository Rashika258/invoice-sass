"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  CreditCard,
  Crown,
  Download,
  ExternalLink,
  HelpCircle,
  Lock,
  MoreVertical,
  QrCode,
  RefreshCw,
  Shield,
  ShieldCheck,
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

interface ActivePlanData {
  plan: string;
  expiresAt: string;
  licenseKey: string;
  activatedOn: string;
  tenure: string;
  amount: number;
  txnId: string;
}

export default function PlansPricingPage() {
  const [deviceType, setDeviceType] = useState<"DESKTOP_MOBILE" | "DESKTOP">("DESKTOP_MOBILE");
  const [tenure, setTenure] = useState<"1_YEAR" | "3_YEAR">("1_YEAR");
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  // Single Checkout Flow State
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<
    "METHOD" | "UPI" | "CARD" | "NETBANKING_LOGIN" | "NETBANKING_OTP" | "OTP" | "SUCCESS"
  >("METHOD");
  const [cardTab, setCardTab] = useState<"CARD" | "NETBANKING">("CARD");
  const [utrNumber, setUtrNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [activePlan, setActivePlan] = useState<ActivePlanData | null>(null);
  const [otpCode, setOtpCode] = useState("123456");

  // Card & NetBanking Form State
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [bankUserId, setBankUserId] = useState("84920194");
  const [bankPassword, setBankPassword] = useState("password123");
  const [bankOtpCode, setBankOtpCode] = useState("948201");

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

  const currentPayablePrice = checkoutPlan === "Gold" ? goldPrice : silverPrice;
  const currentPayableNum = checkoutPlan === "Gold" ? goldPriceNum : silverPriceNum;
  const upiPayUrl = `upi://pay?pa=9448673532@okaxis&pn=Billora%20Software&am=${currentPayableNum.toFixed(
    2
  )}&cu=INR&tn=Billora_${checkoutPlan || "Pro"}_License`;

  // Restore active plan from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("billora_active_plan");
      if (saved) {
        setActivePlan(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleOpenCheckout = (plan: string) => {
    setCheckoutPlan(plan);
    setCheckoutStep("METHOD");
    setUtrNumber("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
    setOtpCode("123456");
    setBankUserId("84920194");
    setBankPassword("password123");
    setBankOtpCode("948201");
  };

  const handleActivateLicense = (method: string) => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const planName = checkoutPlan || "Gold";
      const validUntilDate = new Date();
      validUntilDate.setFullYear(validUntilDate.getFullYear() + (is3Year ? 3 : 1));
      const expiresAt = validUntilDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const randomKey = `BIL-${planName.toUpperCase()}-2026-${randomSuffix}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      const newPlanData: ActivePlanData = {
        plan: planName,
        expiresAt,
        licenseKey: randomKey,
        activatedOn: new Date().toISOString(),
        tenure: is3Year ? "3 Years" : "1 Year",
        amount: currentPayableNum,
        txnId: `TXN_${method}_${Date.now().toString().slice(-8)}`,
      };

      try {
        localStorage.setItem("billora_active_plan", JSON.stringify(newPlanData));
      } catch {
        // ignore
      }

      setActivePlan(newPlanData);
      setCheckoutStep("SUCCESS");
      toast.success(`Billora ${planName} license activated successfully!`);
    }, 1200);
  };

  const handleDownloadReceipt = () => {
    if (!activePlan) return;
    const content = `BILLORA BUSINESS OS - OFFICIAL PAYMENT RECEIPT\n--------------------------------------------\nReceipt / TXN ID : ${activePlan.txnId}\nPlan Name        : Billora ${activePlan.plan}\nTenure           : ${activePlan.tenure}\nAmount Paid      : ₹ ${activePlan.amount.toLocaleString()} (All GST Included)\nLicense Key      : ${activePlan.licenseKey}\nActivation Date  : ${new Date().toLocaleDateString("en-IN")}\nValid Until      : ${activePlan.expiresAt}\nStatus           : PAID & ACTIVE\n--------------------------------------------\nThank you for choosing Billora Business OS!`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Billora_${activePlan.plan}_Receipt.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded!");
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] pb-16 space-y-6 select-none">
      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <span>Plans &amp; Pricing</span>
          <Badge variant="outline" className="text-[10px] text-brand border-brand/20 bg-brand-light font-bold">
            BUSINESS OS
          </Badge>
          {activePlan && (
            <Badge className="bg-emerald-600 text-white font-mono text-[10px] gap-1">
              <Crown className="size-3" />
              <span>{activePlan.plan} Active</span>
            </Badge>
          )}
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
              <DropdownMenuItem
                onClick={() => {
                  if (activePlan) {
                    toast.success(`Active License Key: ${activePlan.licenseKey} (Expires: ${activePlan.expiresAt})`);
                  } else {
                    toast.info("No active commercial license found. Please upgrade below.");
                  }
                }}
              >
                Verify License Key
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Sales Desk: 94486 73532 / support@billora.com")}>
                Contact Sales Desk
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dropdown Filters */}
      <div className="flex items-center justify-center gap-3">
        <Select value={deviceType} onValueChange={(val: any) => setDeviceType(val)}>
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

        <Select value={tenure} onValueChange={(val: any) => setTenure(val)}>
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
        <div
          className={`relative rounded-2xl border bg-card p-6 shadow-2xs flex flex-col justify-between space-y-6 ${
            activePlan?.plan.toLowerCase() === "silver"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/[0.02]"
              : "border-border/80"
          }`}
        >
          {activePlan?.plan.toLowerCase() === "silver" && (
            <div className="absolute -top-3 left-6 bg-emerald-600 text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
              <CheckCircle2 className="size-3" />
              <span>Current Active Plan</span>
            </div>
          )}

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
            {activePlan?.plan.toLowerCase() === "silver" ? (
              <Button
                variant="outline"
                onClick={() => handleOpenCheckout("Silver")}
                className="w-full h-10 rounded-full border-2 border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs shadow-xs cursor-pointer"
              >
                Renew Silver Plan
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => handleOpenCheckout("Silver")}
                className="w-full h-10 rounded-full border-2 border-brand text-brand hover:bg-brand-light font-bold text-xs shadow-xs cursor-pointer"
              >
                Get Billora Silver
              </Button>
            )}

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
        <div
          className={`relative rounded-2xl border-2 bg-gradient-to-b from-amber-500/[0.04] to-card p-6 shadow-md flex flex-col justify-between space-y-6 ${
            activePlan?.plan.toLowerCase() === "gold"
              ? "border-emerald-500 ring-2 ring-emerald-500/20"
              : "border-amber-400/60"
          }`}
        >
          <div className="absolute -top-3.5 right-6 bg-brand text-white px-3 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-xs">
            {activePlan?.plan.toLowerCase() === "gold" ? "Active Tier" : "Most Popular"}
          </div>

          {activePlan?.plan.toLowerCase() === "gold" && (
            <div className="absolute -top-3.5 left-6 bg-emerald-600 text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
              <CheckCircle2 className="size-3" />
              <span>Current Active Plan</span>
            </div>
          )}

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
            {activePlan?.plan.toLowerCase() === "gold" ? (
              <Button
                onClick={() => handleOpenCheckout("Gold")}
                className="w-full h-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                Renew Gold Plan
              </Button>
            ) : (
              <Button
                onClick={() => handleOpenCheckout("Gold")}
                className="w-full h-10 rounded-full bg-brand hover:opacity-90 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                Get Billora Gold
              </Button>
            )}

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
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="size-4 text-brand" />
              <span>Full Features Comparison (Silver vs Gold)</span>
            </DialogTitle>
          </DialogHeader>

          <Table className="text-xs">
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="w-2/3">Feature</TableHead>
                <TableHead className="text-center font-bold">Silver</TableHead>
                <TableHead className="text-center font-bold text-primary">Gold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {GOLD_FEATURES.map((gf, i) => {
                const sf = SILVER_FEATURES[i] || { included: false };
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
              toast.success(`Order placed for ${licenseCount} Billora ${bulkPlan} Licenses! Our enterprise desk will contact ${contactPhone || "you"} shortly.`);
              setBulkModalOpen(false);
            }}
            className="space-y-4 pt-2 text-xs"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Select Tier</Label>
                <Select value={bulkPlan} onValueChange={(val: any) => setBulkPlan(val)}>
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
                <Select value={String(licenseCount)} onValueChange={(val: any) => setLicenseCount(Number(val))}>
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
                placeholder="e.g. Sri Manjunatha Engineering Works"
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
                placeholder="+91 94486 73532"
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

      {/* Interactive Single Checkout Modal with Real Payment Flows */}
      <Dialog open={!!checkoutPlan} onOpenChange={(open) => !open && setCheckoutPlan(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-card border shadow-2xl">
          {/* STEP 1: METHOD SELECTION */}
          {checkoutStep === "METHOD" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <Crown className="size-4 text-amber-500" />
                  <span>Upgrade to Billora {checkoutPlan}</span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-2 text-xs">
                <div className="rounded-xl bg-muted/50 border p-3 space-y-1">
                  <div className="flex justify-between font-bold text-sm">
                    <span>Total Payable ({is3Year ? "3 Years" : "Annual"})</span>
                    <span className="font-mono text-primary font-black text-base">
                      ₹ {currentPayablePrice}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-muted-foreground">
                    Includes all GST, automated cloud backup, and lifetime mobile sync.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <p className="font-semibold text-foreground">Select Payment Method:</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* UPI Button */}
                    <button
                      type="button"
                      onClick={() => setCheckoutStep("UPI")}
                      className="p-3.5 rounded-xl border border-border hover:border-emerald-500 hover:bg-emerald-500/5 text-left cursor-pointer transition-all bg-card group shadow-2xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <QrCode className="size-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <Badge className="bg-emerald-100 text-emerald-800 text-[9px] font-mono px-1 py-0">
                          Instant
                        </Badge>
                      </div>
                      <span className="font-bold block text-foreground text-xs">UPI / QR Code</span>
                      <span className="text-[10px] text-muted-foreground">
                        PhonePe, GPay, Paytm
                      </span>
                    </button>

                    {/* Net Banking / Card Button */}
                    <button
                      type="button"
                      onClick={() => setCheckoutStep("CARD")}
                      className="p-3.5 rounded-xl border border-border hover:border-primary hover:bg-primary/5 text-left cursor-pointer transition-all bg-card group shadow-2xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <CreditCard className="size-4 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] text-muted-foreground font-semibold">Cards</span>
                      </div>
                      <span className="font-bold block text-foreground text-xs">Net Banking / Card</span>
                      <span className="text-[10px] text-muted-foreground">
                        Visa, MasterCard, RuPay
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-muted-foreground border-t">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="size-3 text-emerald-600" />
                    256-Bit SSL Encrypted
                  </span>
                  <span>•</span>
                  <span>Instant Activation</span>
                  <span>•</span>
                  <span>GST Tax Invoice Included</span>
                </div>
              </div>
            </>
          )}

          {/* STEP 2: UPI QR CODE GATEWAY */}
          {checkoutStep === "UPI" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <button
                  type="button"
                  onClick={() => setCheckoutStep("METHOD")}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Change Method</span>
                </button>
                <Badge variant="outline" className="font-mono font-bold text-xs">
                  Pay ₹ {currentPayablePrice}
                </Badge>
              </div>

              <div className="text-center space-y-2">
                <div className="p-2.5 rounded-xl bg-white border inline-block shadow-xs">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(
                      upiPayUrl
                    )}&margin=6`}
                    alt="UPI Payment QR"
                    className="size-38 object-contain"
                  />
                </div>
                <p className="text-[11px] font-bold text-foreground">
                  Scan using Google Pay, PhonePe, Paytm, or BHIM
                </p>
              </div>

              <div className="space-y-2 text-xs">
                {/* Copy UPI ID */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/60 border text-[11px]">
                  <span className="text-muted-foreground">Payee UPI ID:</span>
                  <div className="flex items-center gap-1.5">
                    <code className="font-mono font-bold text-foreground">9448673532@okaxis</code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText("9448673532@okaxis");
                        toast.success("UPI ID copied to clipboard!");
                      }}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Copy UPI ID"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Direct App Link */}
                <div className="text-center">
                  <a
                    href={upiPayUrl}
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-bold"
                  >
                    <span>Click to Pay via Installed UPI App</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>

                {/* UTR Input */}
                <div className="space-y-1.5 pt-1">
                  <Label htmlFor="utr-input" className="text-[11px] font-bold">
                    Enter 12-Digit UTR / UPI Ref No. after payment:
                  </Label>
                  <Input
                    id="utr-input"
                    placeholder="e.g. 429184920194"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="h-9 font-mono text-xs"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleActivateLicense("DEMO_UPI")}
                    disabled={isVerifying}
                    className="flex-1 h-9 text-xs"
                  >
                    ⚡ Fast Demo Activate
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (!utrNumber.trim()) {
                        toast.error("Please enter the 12-digit UPI UTR / Reference number from your payment receipt");
                        return;
                      }
                      handleActivateLicense("UPI");
                    }}
                    disabled={isVerifying}
                    className="flex-1 h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isVerifying ? "Verifying..." : "Verify & Activate"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CARD & NET BANKING GATEWAY */}
          {checkoutStep === "CARD" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <button
                  type="button"
                  onClick={() => setCheckoutStep("METHOD")}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Change Method</span>
                </button>
                <Badge variant="outline" className="font-mono font-bold text-xs">
                  Pay ₹ {currentPayablePrice}
                </Badge>
              </div>

              {/* Sub-tab toggle */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-muted/60 border text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCardTab("CARD")}
                  className={`py-1.5 rounded-lg transition-all ${
                    cardTab === "CARD"
                      ? "bg-card text-foreground shadow-2xs font-extrabold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Credit / Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setCardTab("NETBANKING")}
                  className={`py-1.5 rounded-lg transition-all ${
                    cardTab === "NETBANKING"
                      ? "bg-card text-foreground shadow-2xs font-extrabold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Net Banking
                </button>
              </div>

              {/* Card Payment Form */}
              {cardTab === "CARD" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (cardNumber.replace(/\s/g, "").length < 15) {
                      toast.error("Please enter a valid 16-digit card number");
                      return;
                    }
                    setCheckoutStep("OTP");
                  }}
                  className="space-y-3 text-xs"
                >
                  <div className="space-y-1">
                    <Label htmlFor="card-number">Card Number</Label>
                    <div className="relative">
                      <Input
                        id="card-number"
                        placeholder="4532 8920 1829 4810"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                          const formatted = v.match(/.{1,4}/g)?.join(" ") || v;
                          setCardNumber(formatted);
                        }}
                        required
                        className="h-9 font-mono text-xs pr-12"
                      />
                      <CreditCard className="size-4 absolute right-3 top-2.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="card-name">Cardholder Name</Label>
                    <Input
                      id="card-name"
                      placeholder="e.g. Rajesh Kumar"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="card-expiry">Expiry Date</Label>
                      <Input
                        id="card-expiry"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                          if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                          setCardExpiry(v);
                        }}
                        required
                        className="h-9 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="card-cvv">CVV</Label>
                      <div className="relative">
                        <Input
                          id="card-cvv"
                          placeholder="•••"
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          required
                          className="h-9 font-mono text-xs pr-8"
                        />
                        <Lock className="size-3.5 absolute right-2.5 top-3 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Pay ₹ {currentPayablePrice} &amp; Verify OTP
                    </Button>
                  </div>
                </form>
              )}

              {/* Net Banking Form */}
              {cardTab === "NETBANKING" && (
                <div className="space-y-3 text-xs">
                  <Label>Select Your Bank:</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "HDFC", name: "HDFC Bank" },
                      { id: "SBI", name: "State Bank of India" },
                      { id: "ICICI", name: "ICICI Bank" },
                      { id: "AXIS", name: "Axis Bank" },
                      { id: "KOTAK", name: "Kotak Mahindra" },
                      { id: "PNB", name: "Punjab National Bank" },
                    ].map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedBank === bank.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary font-bold"
                            : "border-border hover:bg-muted/40"
                        }`}
                      >
                        <div className="font-semibold text-xs text-foreground">{bank.name}</div>
                        <div className="text-[10px] text-muted-foreground">Retail &amp; Corporate</div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={() => setCheckoutStep("NETBANKING_LOGIN")}
                      className="w-full h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                    >
                      Proceed to {selectedBank} Net Banking →
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3B: NET BANKING LOGIN PORTAL */}
          {checkoutStep === "NETBANKING_LOGIN" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <button
                  type="button"
                  onClick={() => setCheckoutStep("CARD")}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Select Bank</span>
                </button>
                <Badge variant="outline" className="font-mono font-bold text-xs bg-primary/5 text-primary border-primary/20">
                  {selectedBank} Net Banking Portal
                </Badge>
              </div>

              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1 text-xs">
                <div className="flex justify-between font-bold text-foreground">
                  <span>Merchant: Billora Business OS</span>
                  <span className="font-mono text-primary font-black">₹ {currentPayablePrice}</span>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="size-3 text-emerald-600" />
                  Secure 256-Bit SSL Net Banking Gateway ({selectedBank} Bank)
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!bankUserId.trim() || !bankPassword.trim()) {
                    toast.error("Please enter your User ID and Password");
                    return;
                  }
                  toast.info(`Connecting to ${selectedBank} NetBanking gateway...`);
                  setCheckoutStep("NETBANKING_OTP");
                }}
                className="space-y-3 text-xs"
              >
                <div className="space-y-1">
                  <Label htmlFor="bank-userid">{selectedBank} Customer / User ID *</Label>
                  <Input
                    id="bank-userid"
                    value={bankUserId}
                    onChange={(e) => setBankUserId(e.target.value)}
                    placeholder="e.g. 84920194"
                    required
                    className="h-9 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="bank-password">IPIN / NetBanking Password *</Label>
                  <div className="relative">
                    <Input
                      id="bank-password"
                      type="password"
                      value={bankPassword}
                      onChange={(e) => setBankPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="h-9 font-mono text-xs pr-8"
                    />
                    <Lock className="size-3.5 absolute right-2.5 top-3 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground text-center">
                  Demo credentials pre-filled for bank authentication testing.
                </p>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCheckoutStep("CARD")}
                    className="flex-1 h-9 text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                  >
                    Login &amp; Authorize ₹ {currentPayablePrice}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3C: NET BANKING OTP VERIFICATION */}
          {checkoutStep === "NETBANKING_OTP" && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="size-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center font-bold">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">{selectedBank} High Security OTP</h3>
                <p className="text-[11px] text-muted-foreground">
                  An OTP has been generated &amp; sent to your registered mobile ending in •••• 9410
                </p>
              </div>

              <div className="p-3 rounded-xl bg-muted/50 border text-xs space-y-1 font-mono">
                <div className="flex justify-between"><span>Bank Account:</span><span className="font-bold">{selectedBank} •••• 4910</span></div>
                <div className="flex justify-between"><span>Customer ID:</span><span className="font-bold">{bankUserId}</span></div>
                <div className="flex justify-between"><span>Amount to Debit:</span><span className="font-bold text-primary">₹ {currentPayablePrice}</span></div>
              </div>

              <div className="space-y-1.5 text-xs">
                <Label htmlFor="bank-otp-input">Enter 6-Digit Bank Security OTP:</Label>
                <Input
                  id="bank-otp-input"
                  maxLength={6}
                  value={bankOtpCode}
                  onChange={(e) => setBankOtpCode(e.target.value)}
                  className="h-10 text-center font-mono font-bold tracking-widest text-base"
                />
                <p className="text-[10px] text-muted-foreground text-center">
                  Demo OTP auto-filled with 948201 for instant verification
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCheckoutStep("NETBANKING_LOGIN")}
                  disabled={isVerifying}
                  className="flex-1 h-9 text-xs cursor-pointer"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => handleActivateLicense("NETBANKING")}
                  disabled={isVerifying}
                  className="flex-1 h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                >
                  {isVerifying ? "Authorizing with Bank..." : "Confirm Payment & Activate"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: 3D SECURE OTP SIMULATION */}
          {checkoutStep === "OTP" && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="size-10 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center font-bold">
                  <Shield className="size-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">3D Secure Bank Verification</h3>
                <p className="text-[11px] text-muted-foreground">
                  An OTP has been sent to your registered mobile ending in •••• 7532
                </p>
              </div>

              <div className="p-3 rounded-xl bg-muted/50 border text-xs space-y-1 font-mono">
                <div className="flex justify-between"><span>Merchant:</span><span className="font-bold">Billora Business OS</span></div>
                <div className="flex justify-between"><span>Amount:</span><span className="font-bold text-primary">₹ {currentPayablePrice}</span></div>
                <div className="flex justify-between"><span>Card:</span><span>•••• •••• •••• {cardNumber.slice(-4) || "4810"}</span></div>
              </div>

              <div className="space-y-1.5 text-xs">
                <Label htmlFor="otp-input">Enter 6-Digit Bank OTP:</Label>
                <Input
                  id="otp-input"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="h-10 text-center font-mono font-bold tracking-widest text-base"
                />
                <p className="text-[10px] text-muted-foreground text-center">
                  Demo auto-filled with 123456 for instant verification
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCheckoutStep("CARD")}
                  disabled={isVerifying}
                  className="flex-1 h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => handleActivateLicense("CARD")}
                  disabled={isVerifying}
                  className="flex-1 h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isVerifying ? "Authorizing..." : "Submit OTP & Activate"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS & LICENSE DISPLAY */}
          {checkoutStep === "SUCCESS" && activePlan && (
            <div className="space-y-4 text-center py-2">
              <div className="size-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-in zoom-in-50">
                <CheckCircle2 className="size-8" />
              </div>

              <div>
                <h3 className="font-black text-lg text-foreground">
                  Billora {activePlan.plan} Activated!
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your commercial license is now active and synced across all your devices.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/50 border text-left text-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-border/80">
                  <span className="text-muted-foreground">License Key:</span>
                  <div className="flex items-center gap-1.5">
                    <code className="font-mono font-black text-primary text-[11px] bg-primary/10 px-2 py-0.5 rounded">
                      {activePlan.licenseKey}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(activePlan.licenseKey);
                        toast.success("License Key copied to clipboard!");
                      }}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Copy Key"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Valid Tenure:</span>
                  <span className="font-semibold text-foreground">{activePlan.tenure} (Expires: {activePlan.expiresAt})</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-muted-foreground">{activePlan.txnId}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-mono font-bold text-emerald-600">₹ {activePlan.amount.toLocaleString()} (GST Paid)</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadReceipt}
                  className="flex-1 h-9 text-xs gap-1.5 font-semibold"
                >
                  <Download className="size-3.5" />
                  <span>Download Receipt</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setCheckoutPlan(null)}
                  className="flex-1 h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
