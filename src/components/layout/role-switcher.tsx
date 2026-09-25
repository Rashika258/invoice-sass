"use client";

import { useState } from "react";
import { UserCheck, Shield, Store, BookOpen, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface RoleSwitcherProps {
  currentRole: string;
}

const ROLES = [
  { id: "ADMIN", label: "Admin / Owner", icon: Shield, desc: "Full executive control & setup" },
  { id: "SALES", label: "Sales Operator / Billing", icon: Store, desc: "POS, fast invoicing & collection" },
  { id: "ACCOUNTANT", label: "Accountant / CA", icon: BookOpen, desc: "Journal vouchers & GST returns" },
  { id: "WAREHOUSE", label: "Warehouse Clerk", icon: Package, desc: "Stock movement & godown transfers" },
];

export function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  const [activeRole, setActiveRole] = useState(currentRole);

  const handleSwitchRole = (roleId: string, roleLabel: string) => {
    setActiveRole(roleId);
    toast.success(`Switched active view perspective to ${roleLabel}`);
  };

  const activeObj = ROLES.find((r) => r.id === activeRole.toUpperCase()) || ROLES[0];
  const ActiveIcon = activeObj.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold gap-1.5 border-border/80 bg-muted/30 select-none"
          >
            <ActiveIcon className="size-3.5 text-brand" />
            <span className="hidden sm:inline font-bold">{activeObj.label}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-64 text-xs select-none">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
          Role Perspective View
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((r) => {
          const Icon = r.icon;
          const isSelected = activeRole.toUpperCase() === r.id;
          return (
            <DropdownMenuItem
              key={r.id}
              onClick={() => handleSwitchRole(r.id, r.label)}
              className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer ${
                isSelected ? "bg-brand-light text-brand font-bold" : ""
              }`}
            >
              <Icon className="size-4 shrink-0 mt-0.5" />
              <div>
                <div className="leading-tight">{r.label}</div>
                <div className="text-[10px] text-muted-foreground font-normal">{r.desc}</div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
