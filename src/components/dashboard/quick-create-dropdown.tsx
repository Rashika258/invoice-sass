"use client";

import { useRouter } from "next/navigation";
import {
  CalendarClock,
  ChevronDown,
  CreditCard,
  FileText,
  Package,
  Plus,
  Receipt,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function QuickCreateDropdown() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="sm" className="h-9 gap-1.5 px-3.5 text-xs font-medium shadow-2xs">
            <Plus className="size-3.5" />
            <span>Quick Create</span>
            <ChevronDown className="size-3 opacity-60 ml-0.5" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56 p-1">
        <DropdownMenuLabel className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Primary Transactions
        </DropdownMenuLabel>

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.push("/invoices/new")}
            className="flex items-center gap-2.5 px-2.5 py-2 text-xs cursor-pointer"
          >
            <span className="flex size-6 items-center justify-center rounded-md bg-muted text-foreground">
              <FileText className="size-3.5" />
            </span>
            <div className="flex flex-col">
              <span className="font-semibold">Sale Invoice</span>
              <span className="text-[10px] text-muted-foreground">Shortcut: F8</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push("/purchases/new")}
            className="flex items-center gap-2.5 px-2.5 py-2 text-xs cursor-pointer"
          >
            <span className="flex size-6 items-center justify-center rounded-md bg-muted text-foreground">
              <ShoppingBag className="size-3.5" />
            </span>
            <div className="flex flex-col">
              <span className="font-semibold">Purchase Bill</span>
              <span className="text-[10px] text-muted-foreground">Shortcut: F9</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push("/attendance")}
            className="flex items-center gap-2.5 px-2.5 py-2 text-xs cursor-pointer"
          >
            <span className="flex size-6 items-center justify-center rounded-md bg-muted text-foreground">
              <CalendarClock className="size-3.5" />
            </span>
            <div className="flex flex-col">
              <span className="font-semibold">Staff Attendance</span>
              <span className="text-[10px] text-muted-foreground">8h shift + 1h OT</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.push("/customers")}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs cursor-pointer"
          >
            <Users className="size-3.5 text-muted-foreground" />
            <span>Add Customer / Party</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push("/items")}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs cursor-pointer"
          >
            <Package className="size-3.5 text-muted-foreground" />
            <span>Add Product / Item</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push("/payments")}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs cursor-pointer"
          >
            <CreditCard className="size-3.5 text-muted-foreground" />
            <span>Record Payment In / Out</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push("/expenses")}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs cursor-pointer"
          >
            <Receipt className="size-3.5 text-muted-foreground" />
            <span>Add Direct Expense</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
