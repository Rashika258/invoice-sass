"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, Key, RefreshCw, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getPaymentSettingsAction,
  savePaymentSettingsAction,
} from "@/actions/payment-gateway";

export function PaymentSettingsView() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [upiId, setUpiId] = useState("9448673532@okaxis");
  const [autoReconcile, setAutoReconcile] = useState(true);
  const [sandboxMode, setSandboxMode] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPaymentSettingsAction()
      .then((settings) => {
        setRazorpayKeyId(settings.razorpayKeyId || "");
        setRazorpayKeySecret(settings.razorpayKeySecret || "");
        setWebhookSecret(settings.webhookSecret || "");
        setUpiId(settings.upiId || "9448673532@okaxis");
        setAutoReconcile(settings.autoReconcile ?? true);
        setSandboxMode(settings.sandboxMode ?? true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await savePaymentSettingsAction({
        razorpayKeyId,
        razorpayKeySecret,
        webhookSecret,
        upiId,
        autoReconcile,
        sandboxMode,
      });

      if (res.success) {
        toast.success("Payment Gateway settings saved successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
        <RefreshCw className="size-4 animate-spin" />
        <span>Loading Payment Gateway Settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none max-w-4xl">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CreditCard className="size-5 text-primary" />
            <span>Payment Gateway &amp; Merchant Settings</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure online payment collection for customer invoices &amp; platform subscriptions.
          </p>
        </div>
        <Badge variant={sandboxMode ? "outline" : "default"} className="font-mono text-xs">
          {sandboxMode ? "TEST / SANDBOX MODE" : "PRODUCTION LIVE"}
        </Badge>
      </div>

      {/* Gateway API Credentials Card */}
      <Card className="rounded-2xl border shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Key className="size-4 text-amber-500" />
            <span>Razorpay Gateway API Credentials</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Enter your Razorpay API Keys from dashboard.razorpay.com to enable direct online card and UPI checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="key-id">Razorpay Key ID</Label>
              <Input
                id="key-id"
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                placeholder="rzp_test_..."
                className="h-9 font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="key-secret">Razorpay Key Secret</Label>
              <Input
                id="key-secret"
                type="password"
                value={razorpayKeySecret}
                onChange={(e) => setRazorpayKeySecret(e.target.value)}
                placeholder="••••••••••••••••"
                className="h-9 font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="webhook-secret">Webhook Secret Signature</Label>
            <Input
              id="webhook-secret"
              type="password"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="whsec_..."
              className="h-9 font-mono text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
              Configure Webhook URL in Razorpay Dashboard: <code className="bg-muted px-1.5 py-0.5 rounded font-mono">https://yourdomain.com/api/v1/payments/webhook</code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* UPI QR Settings Card */}
      <Card className="rounded-2xl border shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span>Business UPI QR &amp; Auto-Reconciliation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="upi-id">Merchant / Business UPI ID (VPA)</Label>
            <Input
              id="upi-id"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. 9448673532@okaxis"
              className="h-9 font-mono text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
              This UPI ID will be encoded into printable invoice QR codes and customer payment links.
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-foreground">Auto-reconcile customer payments via Webhook</span>
              <input
                type="checkbox"
                checked={autoReconcile}
                onChange={(e) => setAutoReconcile(e.target.checked)}
                className="size-4 rounded accent-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-foreground">Enable Sandbox / Test Mode</span>
              <input
                type="checkbox"
                checked={sandboxMode}
                onChange={(e) => setSandboxMode(e.target.checked)}
                className="size-4 rounded accent-primary cursor-pointer"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-9 px-6 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-md"
        >
          {saving ? "Saving Configuration..." : "Save Payment Gateway Settings"}
        </Button>
      </div>
    </div>
  );
}
