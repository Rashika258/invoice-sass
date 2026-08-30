"use client";

import { useState } from "react";
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
      country: String(formData.get("country") ?? ""),
      website: String(formData.get("website") ?? ""),
      taxId: String(formData.get("taxId") ?? ""),
      bankName: String(formData.get("bankName") ?? ""),
      accountNumber: String(formData.get("accountNumber") ?? ""),
      routingNumber: String(formData.get("routingNumber") ?? ""),
      paymentTerms: String(formData.get("paymentTerms") ?? ""),
      invoicePrefix: String(formData.get("invoicePrefix") ?? "INV"),
      currency: String(formData.get("currency") ?? "USD"),
      defaultTaxRate: Number(formData.get("defaultTaxRate") ?? 0),
    };

    try {
      await updateCompanyProfile(data);
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              name="companyName"
              defaultValue={profile?.companyName ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={profile?.email ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              defaultValue={profile?.address ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={profile?.city ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" defaultValue={profile?.state ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input
              id="zipCode"
              name="zipCode"
              defaultValue={profile?.zipCode ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              defaultValue={profile?.country ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              defaultValue={profile?.website ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID</Label>
            <Input id="taxId" name="taxId" defaultValue={profile?.taxId ?? ""} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Defaults</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
            <Input
              id="invoicePrefix"
              name="invoicePrefix"
              defaultValue={profile?.invoicePrefix ?? "INV"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              name="currency"
              defaultValue={profile?.currency ?? "USD"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
            <Input
              id="defaultTaxRate"
              name="defaultTaxRate"
              type="number"
              min="0"
              step="0.01"
              defaultValue={profile?.defaultTaxRate ?? 0}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="paymentTerms">Default Payment Terms</Label>
            <Textarea
              id="paymentTerms"
              name="paymentTerms"
              defaultValue={profile?.paymentTerms ?? "Net 30"}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              name="bankName"
              defaultValue={profile?.bankName ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              name="accountNumber"
              defaultValue={profile?.accountNumber ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="routingNumber">Routing Number</Label>
            <Input
              id="routingNumber"
              name="routingNumber"
              defaultValue={profile?.routingNumber ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
