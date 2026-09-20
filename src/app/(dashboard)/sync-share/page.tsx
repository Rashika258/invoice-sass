"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  Crown,
  Download,
  HardDrive,
  Laptop,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Upload,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { createCompanyBackup, restoreCompanyBackup } from "@/actions/backup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CAROUSEL_SLIDES = [
  {
    title: "Give Access To Your Staff",
    description: "Share your company with your staff in a secure manner by assigning roles.",
    roleDemo: [
      { name: "Suresh (Biller)", role: "Sales & Billing Only", active: true },
      { name: "Anita (Accountant)", role: "Full Accounting & Tax", active: true },
      { name: "Praveen (Salesman)", role: "Mobile Orders & Collections", active: false },
    ],
  },
  {
    title: "Real-time Multi-Device Sync",
    description: "Create bills on your desktop and view updated stock immediately on your mobile app.",
    roleDemo: [
      { name: "Desktop Counter 1", role: "Primary Billing PC", active: true },
      { name: "Android Phone (Samsung)", role: "Owner Live Dashboard", active: true },
      { name: "Warehouse Tablet", role: "Dispatch & Stock Check", active: true },
    ],
  },
  {
    title: "Continuous Cloud Backup",
    description: "Your business data is backed up automatically with 256-bit AES bank-grade encryption.",
    roleDemo: [
      { name: "Daily Snapshot", role: "Auto saved at 11:59 PM", active: true },
      { name: "Offline Mode", role: "Works seamlessly without internet", active: true },
    ],
  },
];

export default function SyncSharePage() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffRole, setStaffRole] = useState("STAFF");
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [addingStaff, setAddingStaff] = useState(false);

  const slide = CAROUSEL_SLIDES[slideIndex];

  const loadTeam = async () => {
    setLoadingStaff(true);
    try {
      const { getTeamMembers } = await import("@/actions/team");
      const members = await getTeamMembers();
      setStaffList(members);
    } catch {
      // Not admin or error — show empty
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleNextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  const handleToggleStaff = (id: string) => {
    // Toggle access — future: update role or deactivate
    toast.info("Role management is available in Settings → Team Members.");
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPassword) return;
    setAddingStaff(true);
    try {
      const { createTeamMember } = await import("@/actions/team");
      const fd = new FormData();
      fd.set("name", staffName);
      fd.set("email", staffEmail);
      fd.set("password", staffPassword);
      fd.set("role", staffRole);
      const result = await createTeamMember(fd);
      if ((result as any)?.error) {
        toast.error((result as any).error);
      } else {
        toast.success(`Staff member ${staffName} added successfully!`);
        setInviteModalOpen(false);
        setStaffName("");
        setStaffEmail("");
        setStaffPassword("");
        await loadTeam();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add staff member.");
    } finally {
      setAddingStaff(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Top Header matching media_1788527544062.png */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
            <span>Sync &amp; Share</span>
            <Crown className="size-4 text-amber-500 inline" />
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/sync-share/computer"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors"
          >
            <Download className="size-3.5" />
            <span>Backup To Computer</span>
          </Link>

          <Button
            size="sm"
            onClick={() => setInviteModalOpen(true)}
            className="h-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs"
          >
            <UserCheck className="mr-1.5 size-3.5" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Main Illustration Box matching media_1788527544062.png */}
      <div className="rounded-2xl border border-border/70 bg-card p-8 text-center space-y-6 max-w-3xl mx-auto shadow-2xs">
        {/* Graphic: Staff presenting monitor with user cards */}
        <div className="relative mx-auto flex items-center justify-center size-52">
          <div className="relative flex items-center justify-center rounded-2xl border-2 border-border bg-gradient-to-br from-background to-muted/40 p-4 shadow-lg w-48 h-36">
            {/* Monitor Screen Frame */}
            <div className="w-full h-full flex flex-col justify-between">
              {/* 3 User Permission Bars inside the illustration */}
              {slide.roleDemo.slice(0, 3).map((r, idx) => (
                <div key={idx} className="flex items-center justify-between bg-muted/60 px-2 py-1 rounded border border-border/60 text-[9px]">
                  <div className="flex items-center gap-1">
                    <div className="size-3 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                      {r.name[0]}
                    </div>
                    <span className="truncate max-w-[80px] font-semibold text-foreground">{r.name}</span>
                  </div>
                  <div className={`size-3 rounded-full ${r.active ? "bg-emerald-500" : "bg-zinc-400"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Carousel Slide Text */}
        <div className="space-y-1.5 max-w-md mx-auto">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {slide.title}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {slide.description}
          </p>
        </div>

        {/* Carousel Navigation Indicators (< • - • >) */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handlePrevSlide}
            className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {CAROUSEL_SLIDES.map((_, i) => (
              <div
                key={i}
                onClick={() => setSlideIndex(i)}
                className={`cursor-pointer transition-all ${
                  i === slideIndex
                    ? "w-6 h-1.5 rounded-full bg-primary"
                    : "size-1.5 rounded-full bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleNextSlide}
            className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div>
          <Button
            onClick={() => {
              setSyncEnabled(true);
              toast.success("Real-time cloud sync is enabled and running!");
            }}
            className="h-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            {syncEnabled ? "Sync Active (Connected)" : "Enable Sync"}
          </Button>
          <p className="mt-2 text-[11px] text-muted-foreground">
            *Multi-device real-time collaboration via cloud
          </p>
        </div>
      </div>

      {/* Staff Access & Devices List */}
      <div className="max-w-3xl mx-auto space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Company Staff &amp; Access Controls ({staffList.length})
          </h3>
          <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
            <ShieldCheck className="size-3.5" />
            256-Bit Encrypted
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
          <div className="divide-y divide-border/60">
            {loadingStaff ? (
              <div className="p-6 text-center text-xs text-muted-foreground">Loading team...</div>
            ) : staffList.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No staff members yet. Click &quot;Add Staff&quot; to invite your first team member.
              </div>
            ) : (
              staffList.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3.5 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-sky-500/15 text-sky-500 font-bold text-xs">
                      {(s.name ?? "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{s.name}</h4>
                      <p className="font-mono text-[10px] text-muted-foreground">{s.email} • Role: {s.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStaff(s.id)}
                      className="px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    >
                      Access Enabled
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Invite Staff Dialog */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="size-4 text-primary" />
              Add New Staff Member
            </DialogTitle>
            <DialogDescription>
              Create a login account for your staff member. They can log in with their email and password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStaff} className="flex flex-col flex-1 overflow-hidden">
            <DialogBody className="space-y-4 text-xs">
              <div className="space-y-1">
                <Label>Staff Full Name *</Label>
                <Input
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Email Address (Login ID) *</Label>
                <Input
                  type="email"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="e.g. ramesh@yourcompany.com"
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Initial Password *</Label>
                <Input
                  type="password"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="h-8 text-xs"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-1">
                <Label>Assigned Role</Label>
                <Select value={staffRole} onValueChange={(val) => val && setStaffRole(val)}>
                  <SelectTrigger className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN" className="text-xs">Admin (Full access)</SelectItem>
                    <SelectItem value="STAFF" className="text-xs">Staff (Billing &amp; Sales)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={addingStaff} className="bg-brand hover:bg-brand/90 text-white font-bold">
                {addingStaff ? "Adding..." : "Add Staff Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
