"use server";

import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import type { LedgerGroupKey } from "@/actions/accounting";
import { recordAuditLog } from "@/lib/audit";

export interface TallyLedgerImport {
  name: string;
  group: string;
  openingBalance: number;
}

export interface TallyVoucherImport {
  voucherNumber: string;
  date: string;
  partyName: string;
  amount: number;
  voucherType: string;
}

export async function mapTallyGroupToLedgerGroup(tallyGroup: string): Promise<LedgerGroupKey> {
  const g = tallyGroup.trim().toLowerCase();
  if (g.includes("debtor")) return "SUNDRY_DEBTORS";
  if (g.includes("creditor")) return "SUNDRY_CREDITORS";
  if (g.includes("bank")) return "BANK_ACCOUNTS";
  if (g.includes("cash")) return "CASH_IN_HAND";
  if (g.includes("sale")) return "SALES_ACCOUNTS";
  if (g.includes("purchase")) return "PURCHASE_ACCOUNTS";
  if (g.includes("direct exp")) return "DIRECT_EXPENSES";
  if (g.includes("indirect exp") || g.includes("expense")) return "INDIRECT_EXPENSES";
  if (g.includes("tax") || g.includes("duty") || g.includes("duties")) return "DUTIES_TAXES";
  if (g.includes("capital")) return "CAPITAL_ACCOUNT";
  if (g.includes("fixed asset")) return "FIXED_ASSETS";
  return "CURRENT_ASSETS";
}

export async function importTallyXmlData(xmlText: string) {
  const org = await requireOrganization();

  // Basic regex parser for server environment without browser DOMParser
  const ledgerMatches = xmlText.match(/<LEDGER[\s\S]*?<\/LEDGER>/gi) || [];
  const voucherMatches = xmlText.match(/<VOUCHER[\s\S]*?<\/VOUCHER>/gi) || [];

  const parsedLedgers: TallyLedgerImport[] = [];
  for (const block of ledgerMatches) {
    const nameMatch = block.match(/NAME="([^"]+)"/i) || block.match(/<NAME>([^<]+)<\/NAME>/i);
    const groupMatch = block.match(/<PARENT>([^<]+)<\/PARENT>/i);
    const balMatch = block.match(/<OPENINGBALANCE>([^<]+)<\/OPENINGBALANCE>/i);

    if (nameMatch) {
      parsedLedgers.push({
        name: nameMatch[1].trim(),
        group: groupMatch ? groupMatch[1].trim() : "Current Assets",
        openingBalance: balMatch ? Math.abs(parseFloat(balMatch[1])) : 0,
      });
    }
  }

  const parsedVouchers: TallyVoucherImport[] = [];
  for (const block of voucherMatches) {
    const vNoMatch = block.match(/<VOUCHERNUMBER>([^<]+)<\/VOUCHERNUMBER>/i);
    const dateMatch = block.match(/<DATE>([^<]+)<\/DATE>/i);
    const partyMatch = block.match(/<PARTYLEDGERNAME>([^<]+)<\/PARTYLEDGERNAME>/i);
    const amountMatch = block.match(/<AMOUNT>([^<]+)<\/AMOUNT>/i);
    const typeMatch = block.match(/VCHTYPE="([^"]+)"/i);

    if (vNoMatch && partyMatch && amountMatch) {
      parsedVouchers.push({
        voucherNumber: vNoMatch[1].trim(),
        date: dateMatch ? dateMatch[1].trim() : new Date().toISOString().slice(0, 10),
        partyName: partyMatch[1].trim(),
        amount: Math.abs(parseFloat(amountMatch[1])),
        voucherType: typeMatch ? typeMatch[1].trim() : "Sales",
      });
    }
  }

  // Import Ledgers into database
  let createdLedgers = 0;
  for (const l of parsedLedgers) {
    const mappedGroup = await mapTallyGroupToLedgerGroup(l.group);
    try {
      await db.ledger.upsert({
        where: {
          organizationId_name: {
            organizationId: org.id,
            name: l.name,
          },
        },
        create: {
          organizationId: org.id,
          name: l.name,
          group: mappedGroup as any,
          openingBalance: l.openingBalance,
          openingType: mappedGroup === "SUNDRY_CREDITORS" ? "CR" : "DR",
        },
        update: {
          openingBalance: l.openingBalance,
        },
      });
      createdLedgers++;
    } catch {
      // Continue on duplicate name edge cases
    }
  }

  await recordAuditLog({
    organizationId: org.id,
    action: "IMPORT",
    entity: "Tally",
    entityId: org.id,
    changes: {
      ledgersImported: createdLedgers,
      vouchersFound: parsedVouchers.length,
    },
  });

  return {
    success: true,
    ledgersImported: createdLedgers,
    vouchersFound: parsedVouchers.length,
  };
}
