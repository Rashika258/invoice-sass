import type { UserRole } from "@/generated/prisma/client";
import { requireUser } from "./auth";


export const PERMISSIONS = {
  // Sales & Invoicing
  INVOICE_READ: ["ADMIN", "STAFF", "SALES_OPERATOR", "CA_AUDITOR", "WAREHOUSE_CLERK"] as UserRole[],
  INVOICE_CREATE: ["ADMIN", "STAFF", "SALES_OPERATOR"] as UserRole[],
  INVOICE_UPDATE: ["ADMIN", "STAFF", "SALES_OPERATOR"] as UserRole[],
  INVOICE_DELETE: ["ADMIN"] as UserRole[],

  // Inventory & Warehouse
  INVENTORY_READ: ["ADMIN", "STAFF", "SALES_OPERATOR", "WAREHOUSE_CLERK", "CA_AUDITOR"] as UserRole[],
  INVENTORY_MANAGE: ["ADMIN", "WAREHOUSE_CLERK", "STAFF"] as UserRole[],

  // Accounting & Vouchers
  ACCOUNTING_READ: ["ADMIN", "CA_AUDITOR", "STAFF"] as UserRole[],
  ACCOUNTING_MUTATE: ["ADMIN", "CA_AUDITOR"] as UserRole[],

  // Payroll & Staff
  PAYROLL_READ: ["ADMIN", "CA_AUDITOR"] as UserRole[],
  PAYROLL_MUTATE: ["ADMIN"] as UserRole[],

  // Settings & System Config
  SETTINGS_MANAGE: ["ADMIN"] as UserRole[],
};

export type PermissionKey = keyof typeof PERMISSIONS;

export function hasPermission(role: UserRole, permission: PermissionKey): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles ? allowedRoles.includes(role) : false;
}

export async function requirePermission(permission: PermissionKey) {
  const user = await requireUser();
  if (!hasPermission(user.role, permission)) {
    throw new Error(`Unauthorized: User role '${user.role}' lacks '${permission}' permission.`);
  }
  return user;
}
