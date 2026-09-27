import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Plus } from "lucide-react";
import Link from "next/link";

/**
 * Universal Quick Create Menu – a floating action button (FAB) that provides shortcuts
 * to create primary entities in the ERP system.
 */
export function QuickCreateMenu() {
  const items = [
    { label: "New Invoice", href: "/invoices/new" },
    { label: "New Customer", href: "/customers" },
    { label: "New Item", href: "/items" },
    { label: "Record Payment", href: "/payments" },
    { label: "Add Expense", href: "/expenses" },
    { label: "New Purchase", href: "/purchases/new" },
    { label: "New Voucher", href: "/accounting/vouchers" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button size="icon" className="rounded-full bg-brand text-white shadow-lg hover:bg-brand/90 cursor-pointer">
              <Plus className="size-5" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
          {items.map((item) => (
            <DropdownMenuItem key={item.href} className="p-0">
              <Link href={item.href} className="flex w-full items-center px-2.5 py-1.5 text-xs font-medium">
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
