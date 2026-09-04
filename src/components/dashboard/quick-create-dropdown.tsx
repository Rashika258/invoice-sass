"use client";

import Link from "next/link";
import {
  CalendarClock,
  ChevronDown,
  CreditCard,
  FileSpreadsheet,
  FileText,
  Package,
  Plus,
  PlusCircle,
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button className="h-9 rounded-full bg-white text-zinc-950 hover:bg-zinc-100 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-semibold px-4 text-xs shadow-xs border border-zinc-200 dark:border-white/20 transition-all flex items-center gap-1.5 cursor-pointer">
          <PlusCircle className="size-4" />
          <span>Quick Create</span>
          <ChevronDown className="size-3 opacity-60 ml-0.5" />
        </Button>
      } />
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-xl border border-zinc-800 bg-zinc-950/95 p-1.5 text-zinc-200 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950"
      >
        <DropdownMenuLabel className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Fast Actions
        </DropdownMenuLabel>

        <DropdownMenuGroup>
          <DropdownMenuItem render={
            <Link
              href="/invoices/new"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              <span className="flex size-6 items-center justify-center rounded-md bg-purple-500/20 text-purple-400">
                <FileText className="size-3.5" />
              </span>
              <div className="flex flex-col">
                <span className="font-semibold">Sale Invoice</span>
                <span className="text-[10px] text-zinc-400">Press F8 anywhere</span>
              </div>
            </Link>
          } />

          <DropdownMenuItem render={
            <Link
              href="/purchases/new"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              <span className="flex size-6 items-center justify-center rounded-md bg-sky-500/20 text-sky-400">
                <ShoppingBag className="size-3.5" />
              </span>
              <div className="flex flex-col">
                <span className="font-semibold">Purchase Bill</span>
                <span className="text-[10px] text-zinc-400">Press F9 anywhere</span>
              </div>
            </Link>
          } />

          <DropdownMenuItem render={
            <Link
              href="/attendance"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              <span className="flex size-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400">
                <CalendarClock className="size-3.5" />
              </span>
              <div className="flex flex-col">
                <span className="font-semibold">Staff Attendance</span>
                <span className="text-[10px] text-zinc-400">8h shift + 1h OT</span>
              </div>
            </Link>
          } />
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-zinc-800" />

        <DropdownMenuGroup>
          <DropdownMenuItem render={
            <Link
              href="/customers"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              <Users className="size-3.5 text-zinc-400" />
              <span>Add Customer / Party</span>
            </Link>
          } />

          <DropdownMenuItem render={
            <Link
              href="/items"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              <Package className="size-3.5 text-zinc-400" />
              <span>Add Product / Item</span>
            </Link>
          } />

          <DropdownMenuItem render={
            <Link
              href="/payments"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              <CreditCard className="size-3.5 text-zinc-400" />
              <span>Record Payment In / Out</span>
            </Link>
          } />

          <DropdownMenuItem render={
            <Link
              href="/expenses"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              <Receipt className="size-3.5 text-zinc-400" />
              <span>Add Direct Expense</span>
            </Link>
          } />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
