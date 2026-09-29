"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Banknote, Save } from "lucide-react";
import { toast } from "sonner";
import { createExpense } from "@/actions/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ExpenseFormPageClient({
  bankAccounts,
  currency,
}: {
  bankAccounts: any[];
  currency: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("Rent & Utilities");
  const [bankAccountId, setBankAccountId] = useState(bankAccounts[0]?.id || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const amount = parseFloat(formData.get("amount") as string) || 0;
      const taxAmount = parseFloat(formData.get("taxAmount") as string) || 0;
      const description = (formData.get("description") as string) || "";

      await createExpense({
        category,
        amount,
        gstRate: amount > 0 ? (taxAmount / amount) * 100 : 0,
        date: new Date().toISOString(),
        bankAccountId,
        description,
      });
      toast.success("Expense recorded successfully!");
      router.push("/expenses");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to record expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-4">
      <div className="flex items-center gap-3 border-b border-border/80 pb-4">
        <Link
          href="/expenses"
          className="flex size-8 items-center justify-center rounded-lg border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Banknote className="size-5 text-emerald-600 dark:text-emerald-400" />
            Record Operating Expense
          </h1>
          <p className="text-xs text-muted-foreground">
            Log shop rent, electricity, maintenance, tea &amp; snacks, or office supplies.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Expense Category *</Label>
          <Select value={category} onValueChange={(val) => setCategory(val || "Rent & Utilities")}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Rent & Utilities">Rent &amp; Utilities</SelectItem>
              <SelectItem value="Electricity & Water">Electricity &amp; Water</SelectItem>
              <SelectItem value="Tea & Refreshments">Tea &amp; Refreshments</SelectItem>
              <SelectItem value="Office Supplies">Office Supplies &amp; Stationery</SelectItem>
              <SelectItem value="Logistics & Delivery">Logistics &amp; Delivery</SelectItem>
              <SelectItem value="Staff Welfare">Staff Welfare</SelectItem>
              <SelectItem value="Software & Internet">Software &amp; Internet</SelectItem>
              <SelectItem value="Misc Expense">Misc Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Expense Amount ({currency}) *</Label>
            <Input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              className="h-9 font-mono text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">GST Amount ({currency})</Label>
            <Input
              name="taxAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="h-9 font-mono text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Paid From Account *</Label>
          <Select value={bankAccountId} onValueChange={(val) => setBankAccountId(val || "")}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select bank or cash account" />
            </SelectTrigger>
            <SelectContent>
              {bankAccounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.name} ({acc.accountType})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Description / Merchant Notes</Label>
          <Textarea
            name="description"
            placeholder="e.g. Shop electricity bill for Sept 2026 paid via GPay"
            rows={3}
            className="text-xs"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Link href="/expenses">
            <Button type="button" variant="outline" size="sm" className="text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="sm"
            disabled={loading}
            className="text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 px-5 shadow-xs"
          >
            <Save className="size-3.5" />
            <span>{loading ? "Saving Expense..." : "Save Expense"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
