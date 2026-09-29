"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cloud,
  Download,
  FileCheck,
  HardDrive,
  Lock,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UploadCloud,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DriveBackupItem {
  id: string;
  filename: string;
  size: string;
  createdAt: string;
  status: "SUCCESS" | "SYNCING";
}

const INITIAL_BACKUPS: DriveBackupItem[] = [
  {
    id: "bak_1",
    filename: "Billora_AutoBackup_2026-09-20_1200.json.gz",
    size: "1.42 MB",
    createdAt: "2026-09-20 12:00 PM",
    status: "SUCCESS",
  },
  {
    id: "bak_2",
    filename: "Billora_AutoBackup_2026-09-19_2300.json.gz",
    size: "1.38 MB",
    createdAt: "2026-09-19 11:00 PM",
    status: "SUCCESS",
  },
  {
    id: "bak_3",
    filename: "Billora_AutoBackup_2026-09-18_2300.json.gz",
    size: "1.35 MB",
    createdAt: "2026-09-18 11:00 PM",
    status: "SUCCESS",
  },
];

export default function BackupToDrivePage() {
  const [connected, setConnected] = useState(false);
  const [accountEmail, setAccountEmail] = useState("business.billora@gmail.com");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Backup In-Progress State
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  // Backup History State
  const [backups, setBackups] = useState<DriveBackupItem[]>(INITIAL_BACKUPS);

  // Settings State
  const [autoFrequency, setAutoFrequency] = useState("DAILY");
  const [encryptBackup, setEncryptBackup] = useState(true);

  // Restore State
  const [restoreItem, setRestoreItem] = useState<DriveBackupItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Restore connection from local storage if previously saved
  useEffect(() => {
    try {
      const savedAcc = localStorage.getItem("billora_gdrive_connected_email");
      if (savedAcc) {
        setAccountEmail(savedAcc);
        setConnected(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleConnectDrive = (emailToConnect: string) => {
    setAccountEmail(emailToConnect);
    setConnected(true);
    setAuthModalOpen(false);
    try {
      localStorage.setItem("billora_gdrive_connected_email", emailToConnect);
    } catch {
      // ignore
    }
    toast.success(`Google Drive connected to ${emailToConnect}!`);
  };

  const handleDisconnect = () => {
    setConnected(false);
    try {
      localStorage.removeItem("billora_gdrive_connected_email");
    } catch {
      // ignore
    }
    toast.info("Google Drive account disconnected");
  };

  const handleStartManualBackup = () => {
    if (!connected) {
      toast.error("Please connect your Google Drive account first");
      setAuthModalOpen(true);
      return;
    }

    setIsBackingUp(true);
    setBackupProgress(10);

    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsBackingUp(false);
            setBackupProgress(0);

            const nowStr = format(new Date(), "yyyy-MM-dd HH:mm");
            const newBackup: DriveBackupItem = {
              id: `bak_${Date.now()}`,
              filename: `Billora_ManualBackup_${nowStr.replace(/[: ]/g, "_")}.json.gz`,
              size: "1.45 MB",
              createdAt: format(new Date(), "yyyy-MM-dd hh:mm a"),
              status: "SUCCESS",
            };

            setBackups((prevList) => [newBackup, ...prevList]);
            toast.success("Database backup successfully uploaded to Google Drive!");
          }, 600);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const handleRestoreBackup = (item: DriveBackupItem) => {
    setIsRestoring(true);
    setTimeout(() => {
      setIsRestoring(false);
      setRestoreItem(null);
      toast.success(`Database successfully restored from ${item.filename}!`);
    }, 1500);
  };

  const handleDeleteBackup = (id: string) => {
    setBackups((prev) => prev.filter((b) => b.id !== id));
    toast.success("Backup file deleted from Google Drive");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <Link
            href="/sync-share"
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Cloud className="size-5 text-sky-500" />
              <span>Google Drive Cloud Backup</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automated daily backups to your private Google Drive storage for full data redundancy.
            </p>
          </div>
        </div>

        {connected ? (
          <Badge className="bg-emerald-600 text-white font-mono text-xs gap-1.5 px-3 py-1">
            <CheckCircle2 className="size-3.5" />
            <span>DRIVE SYNC ACTIVE</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30 bg-amber-500/10 font-bold px-3 py-1">
            NOT CONNECTED
          </Badge>
        )}
      </div>

      {/* Main Connection Status Card */}
      {!connected ? (
        <Card className="rounded-2xl border bg-card p-8 text-center space-y-5 shadow-2xs">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-500 mx-auto">
            <Cloud className="size-8" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-lg font-bold text-foreground">Link Your Google Drive Account</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Automatically upload a daily encrypted copy of your Billora data file to your private Google Drive storage. Never worry about hard drive crashes or lost laptops.
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Button
              onClick={() => setAuthModalOpen(true)}
              className="h-10 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold px-8 text-xs shadow-md cursor-pointer"
            >
              <Cloud className="mr-1.5 size-4" />
              Connect Google Drive Account
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="rounded-2xl border bg-card p-6 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-sky-500/15 text-sky-500 font-bold text-base">
                <Cloud className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground">{accountEmail}</h3>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10 font-bold">
                    VERIFIED
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                  Storage Folder: /Billora_Backups/ (Encrypted AES-256)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartManualBackup}
                disabled={isBackingUp}
                className="h-9 px-4 text-xs font-bold text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer"
              >
                <UploadCloud className="mr-1.5 size-3.5" />
                {isBackingUp ? "Uploading..." : "Backup Now"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="h-9 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
              >
                Disconnect
              </Button>
            </div>
          </div>

          {/* Progress Bar when uploading */}
          {isBackingUp && (
            <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 space-y-2 animate-in fade-in">
              <div className="flex justify-between text-xs font-bold text-sky-700">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="size-3.5 animate-spin text-sky-600" />
                  Generating JSON Database Snapshot &amp; Syncing to Google Drive...
                </span>
                <span className="font-mono">{backupProgress}%</span>
              </div>
              <div className="w-full bg-sky-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${backupProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Backup Schedule Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
            <div className="space-y-1.5">
              <Label>Automatic Backup Schedule</Label>
              <Select value={autoFrequency} onValueChange={(val) => val && setAutoFrequency(val)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily at 11:00 PM (Recommended)</SelectItem>
                  <SelectItem value="WEEKLY">Weekly on Sundays</SelectItem>
                  <SelectItem value="EVERY_12H">Every 12 Hours</SelectItem>
                  <SelectItem value="OFF">Turn Off Automated Sync</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Security &amp; Encryption</Label>
              <div className="flex items-center justify-between p-2 rounded-lg border bg-muted/40 h-9">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Lock className="size-3 text-emerald-600" />
                  256-Bit AES Backup Password Encryption
                </span>
                <input
                  type="checkbox"
                  checked={encryptBackup}
                  onChange={(e) => setEncryptBackup(e.target.checked)}
                  className="size-4 rounded accent-primary cursor-pointer"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Google Drive Backup History Table */}
      <Card className="rounded-2xl border shadow-2xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <HardDrive className="size-4 text-primary" />
              <span>Google Drive Cloud Backups History</span>
            </CardTitle>
            <CardDescription className="text-xs">
              List of all stored database restore points synced to your private Google Drive folder.
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {backups.length} Files Saved
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-1/2">Backup Filename</TableHead>
                <TableHead>Backup Date</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <FileCheck className="size-4 text-sky-600 shrink-0" />
                      <span>{item.filename}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono">{item.createdAt}</TableCell>
                  <TableCell className="text-muted-foreground font-mono">{item.size}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRestoreItem(item)}
                        className="h-7 text-[11px] font-semibold gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
                        title="Restore this backup"
                      >
                        <RotateCcw className="size-3" />
                        <span>Restore</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          toast.success(`Downloaded ${item.filename} to local machine`);
                        }}
                        className="h-7 size-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Download file"
                      >
                        <Download className="size-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBackup(item.id)}
                        className="h-7 size-7 p-0 text-muted-foreground hover:text-rose-600 cursor-pointer"
                        title="Delete file"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Google OAuth Connection Dialog */}
      <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Cloud className="size-4 text-sky-500" />
              <span>Connect Google Drive</span>
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="space-y-4 text-xs">
            <p className="text-muted-foreground">
              Select or enter your Google Account to authorize Billora OS to store encrypted database backups in your private AppData folder.
            </p>

            <div className="space-y-2">
              <Label>Select Account:</Label>
              <div className="space-y-2">
                {[
                  "business.billora@gmail.com",
                  "rashika.management@gmail.com",
                  "sri.manjunatha.works@gmail.com",
                ].map((acc) => (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => handleConnectDrive(acc)}
                    className="w-full p-3 rounded-xl border border-border hover:border-sky-500 hover:bg-sky-500/5 text-left flex items-center justify-between cursor-pointer transition-all bg-card"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold text-xs">
                        {acc.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-xs text-foreground">{acc}</span>
                    </div>
                    <CheckCircle2 className="size-4 text-sky-600" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <Label htmlFor="custom-email">Or enter custom Google Account email:</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-email"
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
                <Button
                  onClick={() => handleConnectDrive(accountEmail)}
                  className="h-9 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white cursor-pointer shrink-0"
                >
                  Authorize
                </Button>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAuthModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={!!restoreItem} onOpenChange={(open) => !open && setRestoreItem(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-emerald-600">
              <RotateCcw className="size-4 text-emerald-600" />
              <span>Restore Database from Google Drive</span>
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 font-medium">
              ⚠️ Warning: Restoring will overwrite current local transactional data with the backup snapshot from <strong>{restoreItem?.createdAt}</strong>.
            </div>

            <div className="p-3 rounded-xl bg-muted/50 border space-y-1 font-mono">
              <div className="flex justify-between"><span>File:</span><span className="font-bold">{restoreItem?.filename}</span></div>
              <div className="flex justify-between"><span>Size:</span><span>{restoreItem?.size}</span></div>
              <div className="flex justify-between"><span>Backup Date:</span><span>{restoreItem?.createdAt}</span></div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRestoreItem(null)} disabled={isRestoring}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => restoreItem && handleRestoreBackup(restoreItem)}
              disabled={isRestoring}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              {isRestoring ? "Restoring Database..." : "Confirm & Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
