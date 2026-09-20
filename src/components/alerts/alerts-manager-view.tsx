"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Package,
  Plus,
  Receipt,
  Repeat,
  Save,
  Settings2,
  ShieldAlert,
  Sparkles,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  createCustomAlertAction,
  deleteCustomAlertAction,
  dismissAlertAction,
  updateAlertSettingsAction,
  getLiveAlertsDataAction,
} from "@/actions/alerts";
import type {
  AlertCategory,
  AlertPriority,
  AlertSettings,
  CustomAlert,
  LiveAlertItem,
} from "@/lib/alerts-engine";
import {
  ALERTS_CHANGE_EVENT,
  emitAlertsChange,
  type AlertsChangeEventDetail,
} from "@/lib/alerts-events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AlertsManagerViewProps {
  initialAlerts: LiveAlertItem[];
  initialSettings: AlertSettings;
  initialCustomAlerts: CustomAlert[];
}

export function AlertsManagerView({
  initialAlerts,
  initialSettings,
  initialCustomAlerts,
}: AlertsManagerViewProps) {
  const [alerts, setAlerts] = useState<LiveAlertItem[]>(initialAlerts);
  const [settings, setSettings] = useState<AlertSettings>(initialSettings);
  const [customAlerts, setCustomAlerts] = useState<CustomAlert[]>(initialCustomAlerts);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // New Custom Alert Form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<AlertCategory>("CUSTOM");
  const [newPriority, setNewPriority] = useState<AlertPriority>("HIGH");
  const [newRecurrence, setNewRecurrence] = useState<"ONCE" | "DAILY" | "WEEKLY" | "MONTHLY">("MONTHLY");
  const [newMonthlyDay, setNewMonthlyDay] = useState<number>(1);
  const [newActionHref, setNewActionHref] = useState("");
  const [newActionLabel, setNewActionLabel] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const handleExternalAlertsChange = (e: Event) => {
      const customEvent = e as CustomEvent<AlertsChangeEventDetail>;
      const detail = customEvent.detail;
      if (detail?.alertId && (detail.action === "dismiss" || detail.action === "delete")) {
        setAlerts((prev) => prev.filter((a) => a.id !== detail.alertId));
        setCustomAlerts((prev) => prev.filter((a) => a.id !== detail.alertId));
      } else if (detail?.action === "create" || detail?.action === "refresh") {
        getLiveAlertsDataAction().then((data) => {
          setAlerts(data.alerts);
          setCustomAlerts(data.customAlerts);
        }).catch(() => {});
      }
    };

    window.addEventListener(ALERTS_CHANGE_EVENT, handleExternalAlertsChange);
    return () => {
      window.removeEventListener(ALERTS_CHANGE_EVENT, handleExternalAlertsChange);
    };
  }, []);

  const handleDismiss = async (id: string, isSystem: boolean) => {
    // 1. Immediately remove from local alerts array (card vanishes, active count decrements)
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    // 2. Broadcast immediately so Bell icon in AppTopHeader updates instantaneously!
    emitAlertsChange({ action: "dismiss", alertId: id, isSystem });
    toast.success("Alert marked as done");

    try {
      await dismissAlertAction(id, isSystem);
    } catch {
      toast.error("Failed to dismiss alert");
      emitAlertsChange({ action: "refresh" });
    }
  };

  const handleDeleteCustom = async (id: string) => {
    // 1. Immediately remove from local custom alerts array
    setCustomAlerts((prev) => prev.filter((a) => a.id !== id));
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    // 2. Broadcast immediately to top bell
    emitAlertsChange({ action: "delete", alertId: id });
    toast.success("Custom alert deleted");

    try {
      await deleteCustomAlertAction(id);
    } catch {
      toast.error("Failed to delete alert");
      emitAlertsChange({ action: "refresh" });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateAlertSettingsAction(settings);
      emitAlertsChange({ action: "refresh" });
      toast.success("Alert preferences saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Alert title is required");
      return;
    }

    setCreating(true);
    try {
      const res = await createCustomAlertAction({
        title: newTitle.trim(),
        description: newDesc.trim(),
        category: newCategory,
        priority: newPriority,
        recurrence: newRecurrence,
        monthlyDay: newRecurrence === "MONTHLY" ? Number(newMonthlyDay) : undefined,
        actionHref: newActionHref.trim() || undefined,
        actionLabel: newActionLabel.trim() || undefined,
        notifyWhatsApp: true,
      });

      setCustomAlerts((prev) => [res.alert, ...prev]);
      setAlerts((prev) => [
        {
          id: res.alert.id,
          title: res.alert.title,
          description: res.alert.description,
          category: res.alert.category,
          priority: res.alert.priority,
          actionHref: res.alert.actionHref,
          actionLabel: res.alert.actionLabel,
          isSystem: false,
          createdAt: res.alert.createdAt,
          dueInfo: `Every ${newMonthlyDay}th`,
        },
        ...prev,
      ]);

      emitAlertsChange({ action: "create", alertId: res.alert.id });
      toast.success("Custom business alert created!");
      setIsCreateOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewActionHref("");
      setNewActionLabel("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create alert");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-light text-brand">
              <Bell className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                <span>Alerts &amp; Business Reminders</span>
                <Badge className="bg-brand-light text-brand border-none text-[10px] font-bold">
                  LIVE ENGINE
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configurable pay day reminders, low stock buffers, tax return deadlines &amp; scheduled tasks
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="h-8 text-xs font-bold gap-1.5 bg-brand text-white shadow-xs">
                  <Plus className="size-3.5" />
                  <span>Set Custom Alert</span>
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md p-0">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <Bell className="size-4 text-brand" />
                  <span>Set Custom Business Alert</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Create a custom reminder for procurement, vendor bills, rent, licenses, or factory maintenance.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateAlert} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <DialogBody>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Alert Title *</Label>
                    <Input
                      placeholder="e.g. Order raw steel plates from Jindal"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Details / Instructions</Label>
                    <Input
                      placeholder="e.g. Check fabrication floor inventory and place bulk advance order"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Category</Label>
                      <Select
                        value={newCategory}
                        onValueChange={(val) => {
                          if (val) setNewCategory(val as AlertCategory);
                        }}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PAYDAY">💰 Staff Pay Day / Salary</SelectItem>
                          <SelectItem value="STOCK">📦 Stock &amp; Inventory</SelectItem>
                          <SelectItem value="PAYMENT">⏳ Payment Collection</SelectItem>
                          <SelectItem value="GST_TAX">🏛️ GST / Tax Deadline</SelectItem>
                          <SelectItem value="CUSTOM">🔔 General Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Priority</Label>
                      <Select
                        value={newPriority}
                        onValueChange={(val) => {
                          if (val) setNewPriority(val as AlertPriority);
                        }}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CRITICAL">Critical (Immediate)</SelectItem>
                          <SelectItem value="HIGH">High Priority</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Frequency</Label>
                      <Select
                        value={newRecurrence}
                        onValueChange={(val) => {
                          if (val) setNewRecurrence(val as any);
                        }}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ONCE">One-Time Only</SelectItem>
                          <SelectItem value="DAILY">Daily Reminder</SelectItem>
                          <SelectItem value="WEEKLY">Weekly</SelectItem>
                          <SelectItem value="MONTHLY">Monthly on Day X</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newRecurrence === "MONTHLY" && (
                      <div className="space-y-1">
                        <Label className="text-xs">Day of Month (1 - 31)</Label>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          value={newMonthlyDay}
                          onChange={(e) => setNewMonthlyDay(Number(e.target.value))}
                          className="h-9 text-xs font-mono"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Direct Link / Route (Optional)</Label>
                      <Input
                        placeholder="e.g. /items or /attendance"
                        value={newActionHref}
                        onChange={(e) => setNewActionHref(e.target.value)}
                        className="h-9 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Action Button Label</Label>
                      <Input
                        placeholder="e.g. View Items"
                        value={newActionLabel}
                        onChange={(e) => setNewActionLabel(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                </DialogBody>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={creating}
                    className="text-xs font-bold bg-brand text-white"
                  >
                    {creating ? "Scheduling..." : "Save Alert"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Active Alerts */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Alerts
            </CardTitle>
            <Bell className="size-4 text-brand" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-black font-mono text-foreground">
              {alerts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring attention or scheduled this month
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Staff Pay Day Status */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Staff Pay Day
            </CardTitle>
            <DollarSign className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-black font-mono text-emerald-600">
              {settings.payDayOfMonth}st / mo
            </div>
            <p className="text-xs text-muted-foreground">
              {settings.enablePayDayAlert ? "Automated 3-day reminder active" : "Reminder disabled"}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Stock Buffer */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Stock Buffer Alert
            </CardTitle>
            <Package className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-black font-mono text-foreground">
              {settings.enableLowStockAlert ? "Active (<10)" : "Off"}
            </div>
            <p className="text-xs text-muted-foreground">
              Reorder alert on warehouse depletion
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Custom Alerts Count */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Custom Reminders
            </CardTitle>
            <Repeat className="size-4 text-brand" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-black font-mono text-brand">
              {customAlerts.length} set
            </div>
            <p className="text-xs text-muted-foreground">
              Recurring merchant alerts configured
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="active" className="text-xs font-semibold gap-1.5">
            <Bell className="size-3.5" />
            <span>Live Alerts ({alerts.length})</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="text-xs font-semibold gap-1.5">
            <Settings2 className="size-3.5" />
            <span>General Reminders (Pay Day, Stock, GST)</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-xs font-semibold gap-1.5">
            <Calendar className="size-3.5" />
            <span>Custom Scheduled Reminders ({customAlerts.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Live Active Alerts */}
        <TabsContent value="active" className="space-y-3">
          {alerts.length === 0 ? (
            <Card className="p-8 text-center space-y-2">
              <CheckCircle2 className="mx-auto size-12 text-emerald-500/80" />
              <h3 className="text-sm font-bold text-foreground">No Pending Alerts!</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Staff payroll, inventory stock buffers, and customer collections are up to date.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {alerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`rounded-2xl p-4 shadow-xs space-y-3 border transition-all ${
                    alert.priority === "CRITICAL"
                      ? "border-rose-500/30 bg-rose-500/[0.03]"
                      : alert.priority === "HIGH"
                      ? "border-amber-500/30 bg-amber-500/[0.03]"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{alert.title}</h4>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Category: {alert.category} • {alert.isSystem ? "Automated System Alert" : "Custom Alert"}
                      </span>
                    </div>

                    {alert.dueInfo && (
                      <Badge variant="outline" className="text-[10px] font-mono shrink-0 font-bold">
                        {alert.dueInfo}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    {alert.actionHref ? (
                      <Link
                        href={alert.actionHref}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-bold shadow-2xs hover:opacity-90 transition-opacity"
                      >
                        <span>{alert.actionLabel || "Take Action"}</span>
                        <ChevronRight className="size-3" />
                      </Link>
                    ) : (
                      <span />
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismiss(alert.id, alert.isSystem)}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Check className="size-3 mr-1" />
                      <span>Mark as Done</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: General Reminders Configuration */}
        <TabsContent value="config" className="space-y-4">
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Settings2 className="size-4 text-brand" />
                <span>General Automated Business Reminders</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Configure when you want Billora to automatically alert you for payroll, stock levels, and tax dates.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                {/* 1. Pay Day / Salary Reminder */}
                <div className="flex items-start justify-between p-3.5 rounded-xl border border-border bg-card gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">
                        Staff Pay Day / Monthly Salary Reminder
                      </span>
                      <Badge variant="secondary" className="text-[9px]">
                        PAYROLL
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Receive an alert 3 days prior and on the day to compute shift attendance, calculate overtime (OT), and distribute payslips.
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-xs text-muted-foreground">Salary Day of Month:</span>
                      <Select
                        value={String(settings.payDayOfMonth)}
                        onValueChange={(v) => {
                          if (v) setSettings((prev) => ({ ...prev, payDayOfMonth: Number(v) }));
                        }}
                      >
                        <SelectTrigger className="h-8 w-28 text-xs font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st of Month</SelectItem>
                          <SelectItem value="5">5th of Month</SelectItem>
                          <SelectItem value="7">7th of Month</SelectItem>
                          <SelectItem value="10">10th of Month</SelectItem>
                          <SelectItem value="15">15th of Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Switch
                    checked={settings.enablePayDayAlert}
                    onCheckedChange={(checked: boolean) =>
                      setSettings((prev) => ({ ...prev, enablePayDayAlert: checked }))
                    }
                  />
                </div>

                {/* 2. Low Stock Buffer Alert */}
                <div className="flex items-start justify-between p-3.5 rounded-xl border border-border bg-card gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">
                        Low Stock Reorder Alert
                      </span>
                      <Badge variant="secondary" className="text-[9px]">
                        INVENTORY
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Automatically alert when hardware, bolts, flanges or products drop below safe warehouse threshold (&lt; 10 units or minStock).
                    </p>
                  </div>

                  <Switch
                    checked={settings.enableLowStockAlert}
                    onCheckedChange={(checked: boolean) =>
                      setSettings((prev) => ({ ...prev, enableLowStockAlert: checked }))
                    }
                  />
                </div>

                {/* 3. Customer Overdue Payment Collection */}
                <div className="flex items-start justify-between p-3.5 rounded-xl border border-border bg-card gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">
                        Customer Overdue Invoices Alert
                      </span>
                      <Badge variant="secondary" className="text-[9px]">
                        COLLECTIONS
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Flags client bills exceeding payment credit days for 1-click WhatsApp payment reminders with UPI QR codes.
                    </p>
                  </div>

                  <Switch
                    checked={settings.enableOverduePaymentAlert}
                    onCheckedChange={(checked: boolean) =>
                      setSettings((prev) => ({ ...prev, enableOverduePaymentAlert: checked }))
                    }
                  />
                </div>

                {/* 4. GST Return Filing Deadlines */}
                <div className="flex items-start justify-between p-3.5 rounded-xl border border-border bg-card gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">
                        GST Return Filing Deadlines (GSTR-1 &amp; GSTR-3B)
                      </span>
                      <Badge variant="secondary" className="text-[9px]">
                        GOVT TAX
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Reminds you on the 7th-11th for GSTR-1 and 15th-20th for GSTR-3B monthly tax summary reconciliation.
                    </p>
                  </div>

                  <Switch
                    checked={settings.enableGstDeadlineAlert}
                    onCheckedChange={(checked: boolean) =>
                      setSettings((prev) => ({ ...prev, enableGstDeadlineAlert: checked }))
                    }
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={savingSettings}
                    className="h-8 text-xs font-bold gap-1.5 bg-brand text-white shadow-xs"
                  >
                    <Save className="size-3.5" />
                    <span>{savingSettings ? "Saving..." : "Save Preferences"}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Custom Scheduled Reminders */}
        <TabsContent value="custom" className="space-y-4">
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold">Custom Business Reminders</CardTitle>
                  <CardDescription className="text-xs">
                    Your scheduled tasks, vendor procurement deadlines, rent payments &amp; utility renewals.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="h-7 text-xs font-bold bg-brand text-white"
                >
                  <Plus className="size-3 mr-1" />
                  <span>Add Alert</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {customAlerts.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No custom reminders scheduled. Click &quot;Set Custom Alert&quot; to add one.
                </p>
              ) : (
                customAlerts.map((ca) => (
                  <div
                    key={ca.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-card text-xs gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground truncate">{ca.title}</span>
                        <Badge variant="outline" className="text-[9px] font-mono">
                          {ca.category}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`text-[9px] ${
                            ca.priority === "CRITICAL"
                              ? "text-rose-600 bg-rose-500/10"
                              : ca.priority === "HIGH"
                              ? "text-amber-600 bg-amber-500/10"
                              : ""
                          }`}
                        >
                          {ca.priority}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{ca.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                        <span>Recurrence: {ca.recurrence}</span>
                        {ca.monthlyDay && <span>• Every {ca.monthlyDay}th</span>}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCustom(ca.id)}
                      className="size-8 text-muted-foreground hover:text-rose-600 shrink-0"
                      title="Delete Reminder"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
