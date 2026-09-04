"use client";

import { useState } from "react";
import { Building2, CreditCard, FileText, Save } from "lucide-react";
import { toast } from "sonner";
import type { CompanyProfile } from "@/generated/prisma/client";
import { updateCompanyProfile } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SettingsForm({ profile }: { profile: CompanyProfile | null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      companyName: String(formData.get("companyName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      address: String(formData.get("address") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      zipCode: String(formData.get("zipCode") ?? ""),
      country: String(formData.get("country") ?? "India"),
      website: String(formData.get("website") ?? ""),
      taxId: String(formData.get("taxId") ?? ""),
      bankName: String(formData.get("bankName") ?? ""),
      accountNumber: String(formData.get("accountNumber") ?? ""),
      routingNumber: String(formData.get("routingNumber") ?? ""),
      paymentTerms: String(formData.get("paymentTerms") ?? ""),
      invoicePrefix: String(formData.get("invoicePrefix") ?? "INV"),
      currency: String(formData.get("currency") ?? "INR"),
      defaultTaxRate: Number(formData.get("defaultTaxRate") ?? 18),
    };

    try {
      await updateCompanyProfile(data);
      toast.success("Business profile & settings saved successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Business Profile & Settings</h1>
          <p className="text-xs text-muted-foreground">
            Configure your business details, GSTIN, bank accounts, and invoice templates.
          </p>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold h-9 px-5 gap-1.5 shadow-xs"
        >
          <Save className="size-4" />
          <span>{isSubmitting ? "Saving..." : "Save Settings"}</span>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Company Profile Card */}
        <Card className="rounded-xl shadow-xs">
          <CardHeader className="p-4 pb-2 border-b bg-muted/20">
            <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <Building2 className="size-4 text-[#D32F2F]" />
              <span>Company Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="text-xs font-bold text-muted-foreground">
                Company / Trade Name *
              </Label>
              <Input
                id="companyName"
                name="companyName"
                defaultValue={profile?.companyName ?? ""}
                required
                placeholder="E.g. Sharma Enterprises"
                className="h-9 text-xs font-semibold"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="taxId" className="text-xs font-bold text-muted-foreground">
                  GSTIN (Tax ID)
                </Label>
                <Input
                  id="taxId"
                  name="taxId"
                  defaultValue={profile?.taxId ?? ""}
                  placeholder="27AAAAA0000A1Z5"
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-bold text-muted-foreground">
                  Business Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={profile?.phone ?? ""}
                  placeholder="+91 98765 43210"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={profile?.email ?? ""}
                  placeholder="billing@company.com"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="website" className="text-xs font-bold text-muted-foreground">
                  Website / UPI ID
                </Label>
                <Input
                  id="website"
                  name="website"
                  defaultValue={profile?.website ?? ""}
                  placeholder="company@upi"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-bold text-muted-foreground">
                Business Address
              </Label>
              <Input
                id="address"
                name="address"
                defaultValue={profile?.address ?? ""}
                placeholder="Shop No. 12, Market Complex"
                className="h-9 text-xs"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-bold text-muted-foreground">
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={profile?.city ?? ""}
                  placeholder="Mumbai"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-xs font-bold text-muted-foreground">
                  State
                </Label>
                <Input
                  id="state"
                  name="state"
                  defaultValue={profile?.state ?? ""}
                  placeholder="Maharashtra"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="zipCode" className="text-xs font-bold text-muted-foreground">
                  Pincode
                </Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  defaultValue={profile?.zipCode ?? ""}
                  placeholder="400001"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank & Payment Details */}
        <div className="space-y-6">
          <Card className="rounded-xl shadow-xs">
            <CardHeader className="p-4 pb-2 border-b bg-muted/20">
              <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="size-4 text-[#1976D2]" />
                <span>Bank & UPI Details (For Invoices)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="bankName" className="text-xs font-bold text-muted-foreground">
                  Bank Name
                </Label>
                <Input
                  id="bankName"
                  name="bankName"
                  defaultValue={profile?.bankName ?? ""}
                  placeholder="State Bank of India / HDFC Bank"
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="accountNumber" className="text-xs font-bold text-muted-foreground">
                    Bank Account Number
                  </Label>
                  <Input
                    id="accountNumber"
                    name="accountNumber"
                    defaultValue={profile?.accountNumber ?? ""}
                    placeholder="9876543210123"
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="routingNumber" className="text-xs font-bold text-muted-foreground">
                    IFSC Code / UPI ID
                  </Label>
                  <Input
                    id="routingNumber"
                    name="routingNumber"
                    defaultValue={profile?.routingNumber ?? ""}
                    placeholder="SBIN0001234 or yourname@upi"
                    className="h-9 text-xs font-mono uppercase"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Defaults */}
          <Card className="rounded-xl shadow-xs">
            <CardHeader className="p-4 pb-2 border-b bg-muted/20">
              <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <FileText className="size-4 text-emerald-600" />
                <span>Invoice Defaults</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="invoicePrefix" className="text-xs font-bold text-muted-foreground">
                    Bill Prefix
                  </Label>
                  <Input
                    id="invoicePrefix"
                    name="invoicePrefix"
                    defaultValue={profile?.invoicePrefix ?? "INV"}
                    placeholder="INV"
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="currency" className="text-xs font-bold text-muted-foreground">
                    Currency Code
                  </Label>
                  <Input
                    id="currency"
                    name="currency"
                    defaultValue={profile?.currency ?? "INR"}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="defaultTaxRate" className="text-xs font-bold text-muted-foreground">
                    Default GST Rate (%)
                  </Label>
                  <Input
                    id="defaultTaxRate"
                    name="defaultTaxRate"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={profile?.defaultTaxRate ?? 18}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentTerms" className="text-xs font-bold text-muted-foreground">
                  Default Payment Terms & Notice
                </Label>
                <Textarea
                  id="paymentTerms"
                  name="paymentTerms"
                  defaultValue={
                    profile?.paymentTerms ??
                    "Payment is due within 30 days. Goods once sold will not be returned."
                  }
                  rows={2}
                  className="text-xs resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
