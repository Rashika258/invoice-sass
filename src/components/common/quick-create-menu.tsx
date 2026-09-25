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
    { label: "New Invoice", href: "/invoices/create" },
    { label: "New Customer", href: "/customers/create" },
    { label: "New Item", href: "/items/create" },
    { label: "Record Payment", href: "/payments/create" },
    { label: "Add Expense", href: "/expenses/create" },
    { label: "New Purchase", href: "/purchases/create" },
    { label: "New Voucher", href: "/vouchers/create" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button size="icon" className="rounded-full bg-brand text-white shadow-lg hover:bg-brand/90">
            <Plus className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {items.map((item) => (
            <DropdownMenuItem key={item.href} className="p-0">
              <Link href={item.href} className="flex w-full items-center px-2 py-1.5">
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
