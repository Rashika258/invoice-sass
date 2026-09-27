"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  ChevronRight,
  Image,
  Package,
  Rocket,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ONBOARDING_KEY = "billora_onboarding_complete";

export function OnboardingWizard() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return !localStorage.getItem(ONBOARDING_KEY);
    } catch {
      return false;
    }
  });
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const steps = [
    { icon: Sparkles, label: "Welcome" },
    { icon: Building2, label: "Business" },
    { icon: Image, label: "Logo" },
    { icon: Package, label: "First Item" },
    { icon: Rocket, label: "Done" },
  ];

  const complete = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, "1");
    } catch { /* ignore */ }
    setIsOpen(false);
  };

  const handleSaveSettings = async () => {
    if (!businessName.trim()) {
      toast.error("Please enter your business name");
      return;
    }
    setIsSaving(true);
    try {
      const { updateCompanyProfile } = await import("@/actions/settings");
      await updateCompanyProfile({ businessName, taxId: gstNumber } as any);
      toast.success("Business details saved!");
      setStep(2);
    } catch {
      // still advance even if save fails partially
      setStep(2);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between px-6 pt-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone ? "bg-emerald-500 text-white" :
                  isActive ? "bg-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {isDone ? <Check className="size-4" /> : <Icon className="size-4" />}
                </div>
                <span className={`text-[10px] font-medium ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-4">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-4 py-4">
              <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Sparkles className="size-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">Welcome to Billora! 🎉</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  India's smartest billing &amp; accounting app. Let's set up your business in 2 minutes.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs text-center">
                {["GST Invoicing", "POS Billing", "Smart Reports"].map(f => (
                  <div key={f} className="p-3 rounded-xl bg-muted/50 border border-border/60 font-medium">{f}</div>
                ))}
              </div>
              <Button onClick={() => setStep(1)} className="w-full font-bold gap-2">
                Get Started <ChevronRight className="size-4" />
              </Button>
            </div>
          )}

          {/* Step 1: Business Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-foreground">Your Business Details</h2>
                <p className="text-xs text-muted-foreground">This appears on every invoice you send.</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Business / Shop Name *</Label>
                  <Input
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="e.g. Sharma Electronics, Green Pharmacy"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">GST Number (optional)</Label>
                  <Input
                    value={gstNumber}
                    onChange={e => setGstNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 29AABCU9603R1ZX"
                    className="text-sm font-mono"
                    maxLength={15}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1 text-xs">Back</Button>
                <Button onClick={handleSaveSettings} disabled={isSaving} className="flex-1 font-bold text-xs">
                  {isSaving ? "Saving..." : "Save & Continue"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Logo */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-foreground">Business Logo</h2>
                <p className="text-xs text-muted-foreground">Your logo appears on invoices. You can skip this and add it from Settings later.</p>
              </div>
              <div className="p-6 rounded-xl border-2 border-dashed border-border/60 text-center space-y-2">
                <Image className="size-8 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">Logo upload is available in Settings → Business Profile</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 text-xs">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1 font-bold text-xs">Skip for Now</Button>
              </div>
            </div>
          )}

          {/* Step 3: First Item */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-foreground">Add Your First Product</h2>
                <p className="text-xs text-muted-foreground">Skip if you want to add items later from the Items menu.</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Product / Service Name</Label>
                  <Input placeholder="e.g. Laptop Repair, 1kg Sugar, Consulting Hour" className="text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Selling Price (₹)</Label>
                  <Input type="number" placeholder="e.g. 500" className="text-sm" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 text-xs">Back</Button>
                <Button onClick={() => setStep(4)} className="flex-1 font-bold text-xs">Skip / Continue</Button>
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <div className="text-center space-y-4 py-4">
              <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                <Check className="size-8 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">You're all set! 🚀</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Your business is configured. Create your first invoice now.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    complete();
                    router.push("/invoices/new");
                  }}
                  className="w-full font-bold gap-2"
                >
                  <Rocket className="size-4" /> Create First Invoice
                </Button>
                <Button variant="outline" onClick={complete} className="w-full text-xs">
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Skip button */}
        {step < 4 && (
          <div className="px-6 pb-4 flex justify-end">
            <button
              type="button"
              onClick={complete}
              className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <X className="size-3" /> Skip setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
