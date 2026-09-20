"use client";

import { useState } from "react";
import { ShieldCheck, Lock, Smartphone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { setupTwoFactor, verifyAndEnableTwoFactor, disableTwoFactor } from "@/actions/two-factor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getQrCodeSvgUrl } from "@/lib/qr-code";

export function TwoFactorSetupDialog({ enabled }: { enabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totpData, setTotpData] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleStartSetup = async () => {
    setLoading(true);
    try {
      const data = await setupTwoFactor();
      setTotpData(data);
      setOpen(true);
    } catch (err) {
      toast.error("Could not initiate 2FA setup");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpData) return;
    setVerifying(true);
    try {
      const res = await verifyAndEnableTwoFactor(code);
      if (res.success) {
        toast.success("Two-Factor Authentication Enabled!");
        setOpen(false);
      } else {
        toast.error("Invalid 6-digit code");
      }
    } catch {
      toast.error("Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm("Are you sure you want to disable 2FA security?")) return;
    try {
      await disableTwoFactor();
      toast.success("2FA disabled");
    } catch {
      toast.error("Could not disable 2FA");
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <h4 className="text-sm font-bold text-foreground">Two-Factor Authentication (2FA)</h4>
          {enabled ? (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
              ACTIVE
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground text-[10px]">
              DISABLED
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Protect your account with Google Authenticator or Microsoft Authenticator OTPs.
        </p>
      </div>

      {enabled ? (
        <Button variant="outline" size="sm" onClick={handleDisable} className="h-8 text-xs font-semibold text-destructive hover:bg-destructive/10">
          Disable 2FA
        </Button>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button size="sm" onClick={handleStartSetup} disabled={loading} className="h-8 text-xs font-bold bg-primary text-primary-foreground">
                {loading ? "Loading..." : "Enable 2FA"}
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md p-0">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Smartphone className="size-4 text-primary" />
                <span>Setup Two-Factor Authenticator</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Scan the QR code using Google Authenticator, Authy, or Microsoft Authenticator.
              </DialogDescription>
            </DialogHeader>

            {totpData && (
              <form onSubmit={handleVerify} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <DialogBody>
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-xl border border-border">
                    <img
                      src={getQrCodeSvgUrl(totpData.uri)}
                      alt="2FA QR Code"
                      className="size-40 rounded-lg shadow-2xs border border-border"
                    />
                    <p className="text-[10px] font-mono text-muted-foreground mt-2 select-all">
                      Key: {totpData.secret}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="totpCode" className="text-xs font-semibold">Enter 6-Digit Authenticator Code</Label>
                    <Input
                      id="totpCode"
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      className="h-10 text-center font-mono font-bold text-lg tracking-widest"
                    />
                  </div>
                </DialogBody>

                <DialogFooter>
                  <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="h-8 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={verifying} className="h-8 text-xs font-bold bg-primary text-primary-foreground">
                    {verifying ? "Verifying..." : "Verify & Activate 2FA"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
