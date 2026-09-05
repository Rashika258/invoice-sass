"use client";

import { useState } from "react";
import { format } from "date-fns";
import { UserPlus, Shield, User, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  createTeamMember,
  deleteTeamMember,
  updateTeamMemberRole,
} from "@/actions/team";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  createdAt: Date;
};

export function TeamManagement({
  members,
  currentUserId,
  isAdmin,
}: {
  members: TeamMember[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<"ADMIN" | "STAFF">("STAFF");

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    formData.set("role", role);

    try {
      const res = await createTeamMember(formData);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Team member added successfully");
      setOpen(false);
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "STAFF") => {
    try {
      await updateTeamMemberRole(userId, newRole);
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the organization?`)) return;

    try {
      await deleteTeamMember(userId);
      toast.success("Team member removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    }
  };

  return (
    <Card className="rounded-xl shadow-xs border">
      <CardHeader className="border-b bg-card/60 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              Team Members &amp; Roles
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control permissions: Admins manage entire company &amp; billing; Staff log attendance and generate salary slips.
            </p>
          </div>

          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                render={
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs gap-1.5 font-semibold shadow-xs">
                    <UserPlus className="size-3.5" />
                    Add Team Member
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base font-semibold">Add New User to Organization</DialogTitle>
                  <DialogDescription>
                    Invite team members to manage attendance, billing, and GST reports.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="memberName" className="text-xs font-semibold">Full Name *</Label>
                    <Input id="memberName" name="name" placeholder="e.g. Priya Sharma" required className="h-9 text-sm" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="memberEmail" className="text-xs font-semibold">Email Address *</Label>
                    <Input id="memberEmail" name="email" type="email" placeholder="priya@company.com" required className="h-9 text-sm" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="memberPassword" className="text-xs font-semibold">Initial Password *</Label>
                    <Input id="memberPassword" name="password" type="password" placeholder="At least 6 characters" required minLength={6} className="h-9 text-sm" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Assigned Role</Label>
                    <Select value={role} onValueChange={(val) => setRole(val as "ADMIN" | "STAFF")}>
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STAFF">Staff / Operator (Attendance, OT &amp; Salary Slips)</SelectItem>
                        <SelectItem value="ADMIN">Admin (Full Access &amp; Company Settings)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-2.5 text-[11px] text-muted-foreground">
                    <p className="font-semibold text-foreground">Role Permissions:</p>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      <li><b>Admin</b>: Access all billing, inventory, banking, reports, and settings.</li>
                      <li><b>Staff</b>: Log employee attendance, calculate overtime (OT), and print monthly salary slips.</li>
                    </ul>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="h-8 text-xs">
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs font-semibold">
                      {isSubmitting ? "Creating..." : "Create User"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="text-xs font-bold">User</TableHead>
              <TableHead className="text-xs font-bold">Email</TableHead>
              <TableHead className="text-xs font-bold">Role</TableHead>
              <TableHead className="text-xs font-bold">Member Since</TableHead>
              {isAdmin && <TableHead className="text-xs font-bold text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        {member.name}
                        {member.id === currentUserId && (
                          <span className="text-[10px] text-muted-foreground font-normal">(You)</span>
                        )}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">
                  {member.email}
                </TableCell>
                <TableCell>
                  {isAdmin && member.id !== currentUserId ? (
                    <Select
                      value={member.role}
                      onValueChange={(val) => handleRoleChange(member.id, val as "ADMIN" | "STAFF")}
                    >
                      <SelectTrigger className="h-7 w-28 text-xs font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="STAFF">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant="outline"
                      className={
                        member.role === "ADMIN"
                          ? "border-primary/40 bg-primary/10 text-primary font-semibold text-[10px]"
                          : "border-border bg-muted/60 text-muted-foreground font-medium text-[10px]"
                      }
                    >
                      {member.role}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {format(new Date(member.createdAt), "MMM dd, yyyy")}
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    {member.id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(member.id, member.name)}
                        className="size-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Remove member"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
