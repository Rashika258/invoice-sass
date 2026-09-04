"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, FileText, Phone, Plus, Search, Users } from "lucide-react";
import { CustomerFormDialog, DeleteCustomerButton } from "@/components/customers/customer-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/invoice-utils";

type PartyItem = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  taxId?: string | null;
  notes?: string | null;
  partyType: "CUSTOMER" | "SUPPLIER" | "BOTH";
  openingBalance: number;
  receivable: number;
  payable: number;
  balance: number;
};

export function PartiesView({
  parties,
  currency = "INR",
}: {
  parties: PartyItem[];
  currency?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "CUSTOMER" | "SUPPLIER">("ALL");

  const totalReceivable = parties.reduce((sum, p) => sum + p.receivable, 0);
  const totalPayable = parties.reduce((sum, p) => sum + p.payable, 0);

  const filteredParties = parties.filter((party) => {
    const matchesTab =
      activeTab === "ALL"
        ? true
        : activeTab === "CUSTOMER"
          ? party.partyType === "CUSTOMER" || party.partyType === "BOTH"
          : party.partyType === "SUPPLIER" || party.partyType === "BOTH";

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      party.name.toLowerCase().includes(q) ||
      (party.phone && party.phone.includes(q)) ||
      (party.taxId && party.taxId.toLowerCase().includes(q)) ||
      (party.city && party.city.toLowerCase().includes(q));

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Parties Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Customers and suppliers with running balances, receivables, and payables.
          </p>
        </div>
        <CustomerFormDialog
          trigger={
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-8 px-3.5 gap-1.5 rounded-lg text-xs shadow-xs transition-all active:scale-[0.98]">
              <Plus className="size-3.5" />
              <span>Add New Party</span>
            </Button>
          }
        />
      </div>

      {/* 3 Summary Cards */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <Card className="border-border/60 border-l-4 border-l-emerald-600 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06] shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Total to Receive (You&apos;ll Get)
              </span>
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-600/15 text-emerald-700 dark:text-emerald-400">
                <ArrowDownLeft className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-emerald-700 dark:text-emerald-400">
              {formatCurrency(totalReceivable, currency)}
            </p>
            <p className="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
              From {parties.filter((p) => p.receivable > 0).length} parties with pending dues
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 border-l-4 border-l-rose-600 bg-rose-500/[0.03] dark:bg-rose-500/[0.06] shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                Total to Pay (You&apos;ll Give)
              </span>
              <span className="flex size-7 items-center justify-center rounded-lg bg-rose-600/15 text-rose-700 dark:text-rose-400">
                <ArrowUpRight className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-rose-700 dark:text-rose-400">
              {formatCurrency(totalPayable, currency)}
            </p>
            <p className="mt-1 text-[11px] text-rose-700/80 dark:text-rose-400/80">
              To {parties.filter((p) => p.payable > 0).length} suppliers with outstanding bills
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 border-l-4 border-l-primary shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                All Parties Count
              </span>
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
              {parties.length}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {parties.filter((p) => p.partyType === "CUSTOMER").length} Customers ·{" "}
              {parties.filter((p) => p.partyType === "SUPPLIER").length} Suppliers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card with search and filters */}
      <Card className="rounded-xl border border-border/60 shadow-xs">
        <div className="p-3.5 border-b border-border/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="inline-flex h-8 items-center rounded-lg bg-muted/60 p-0.5 text-xs text-muted-foreground border border-border/50">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "hover:text-foreground font-medium"
              }`}
            >
              <span>All Parties</span>
              <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
                {parties.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("CUSTOMER")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all cursor-pointer ${
                activeTab === "CUSTOMER"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "hover:text-foreground font-medium"
              }`}
            >
              <span>Customers</span>
              <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
                {parties.filter((p) => p.partyType === "CUSTOMER" || p.partyType === "BOTH").length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("SUPPLIER")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all cursor-pointer ${
                activeTab === "SUPPLIER"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "hover:text-foreground font-medium"
              }`}
            >
              <span>Suppliers</span>
              <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
                {parties.filter((p) => p.partyType === "SUPPLIER" || p.partyType === "BOTH").length}
              </span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by party name, phone, GSTIN..."
              className="pl-8 h-8 text-xs rounded-lg border-border/70"
            />
          </div>
        </div>

        <CardContent className="p-0">
          {filteredParties.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              {searchQuery ? "No parties matched your search." : "No parties added yet. Click 'Add New Party' to start."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Party Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Phone / Contact</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead className="text-right">To Receive</TableHead>
                  <TableHead className="text-right">To Pay</TableHead>
                  <TableHead className="text-right w-44">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParties.map((party) => (
                  <TableRow key={party.id} className="group hover:bg-muted/40 transition-colors">
                    <TableCell className="font-bold text-sm">
                      <div className="flex items-center gap-2">
                        <span>{party.name}</span>
                        {party.city && (
                          <span className="text-[11px] font-normal text-muted-foreground">
                            ({party.city})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          party.partyType === "CUSTOMER"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300"
                            : party.partyType === "SUPPLIER"
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300"
                              : "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300"
                        }
                      >
                        {party.partyType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {party.phone ? (
                        <span className="flex items-center gap-1 text-muted-foreground font-mono">
                          <Phone className="size-3" />
                          {party.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {party.taxId || "Unregistered"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs">
                      {party.receivable > 0 ? (
                        <span className="text-emerald-600">
                          {formatCurrency(party.receivable, currency)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">₹ 0.00</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs">
                      {party.payable > 0 ? (
                        <span className="text-rose-600">
                          {formatCurrency(party.payable, currency)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">₹ 0.00</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/invoices/new?customerId=${party.id}`}
                          className="inline-flex items-center justify-center rounded-md border border-border h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                        >
                          <FileText className="size-3 mr-1" />
                          + Bill
                        </Link>
                        <CustomerFormDialog
                          customer={party as any}
                          trigger={
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                              Edit
                            </Button>
                          }
                        />
                        <DeleteCustomerButton customerId={party.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
