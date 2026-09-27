import type { UserRole, User } from "@/generated/prisma/client";
import { AppError } from "@/lib/errors";
import { requireUser } from "@/lib/auth";

export type Permission =
  // Sales & Invoices
  | "sales:read"
  | "sales:create"
  | "sales:update"
  | "sales:delete"
  | "sales:approve"
  | "sales:reopen"
  | "INVOICE_READ"
  | "INVOICE_CREATE"
  | "INVOICE_UPDATE"
  | "INVOICE_DELETE"
  | "INVOICE_REOPEN"
  | "SALES_READ"
  | "SALES_CREATE"
  | "SALES_UPDATE"
  | "SALES_DELETE"
  | "SALES_APPROVE"
  | "SALES_REOPEN"
  // Inventory & Stock
  | "inventory:read"
  | "inventory:create"
  | "inventory:adjust"
  | "inventory:approve"
  | "INVENTORY_READ"
  | "INVENTORY_MANAGE"
  // Payroll & Staff
  | "payroll:read"
  | "payroll:process"
  | "payroll:approve"
  | "PAYROLL_READ"
  | "PAYROLL_MUTATE"
  // Double-Entry Accounting
  | "accounting:read"
  | "accounting:post_voucher"
  | "accounting:close_period"
  | "ACCOUNTING_READ"
  | "ACCOUNTING_MUTATE"
  // System & Compliance
  | "system:manage_users"
  | "system:view_audit_logs"
  | "system:settings"
  | "SETTINGS_MANAGE";

export type PermissionKey = Permission;

export const PERMISSIONS: Record<string, Permission> = {
  INVOICE_READ: "INVOICE_READ",
  INVOICE_CREATE: "INVOICE_CREATE",
  INVOICE_UPDATE: "INVOICE_UPDATE",
  INVOICE_DELETE: "INVOICE_DELETE",
  INVOICE_REOPEN: "INVOICE_REOPEN",
  INVENTORY_READ: "INVENTORY_READ",
  INVENTORY_MANAGE: "INVENTORY_MANAGE",
  PAYROLL_READ: "PAYROLL_READ",
  PAYROLL_MUTATE: "PAYROLL_MUTATE",
  ACCOUNTING_READ: "ACCOUNTING_READ",
  ACCOUNTING_MUTATE: "ACCOUNTING_MUTATE",
  SETTINGS_MANAGE: "SETTINGS_MANAGE",
  SALES_READ: "SALES_READ",
  SALES_CREATE: "SALES_CREATE",
  SALES_UPDATE: "SALES_UPDATE",
  SALES_DELETE: "SALES_DELETE",
  SALES_APPROVE: "SALES_APPROVE",
  SALES_REOPEN: "SALES_REOPEN",
};

const PERMISSION_MAP: Record<Permission, Permission[]> = {
  "sales:read": ["sales:read", "INVOICE_READ", "SALES_READ"],
  "INVOICE_READ": ["sales:read", "INVOICE_READ", "SALES_READ"],
  "SALES_READ": ["sales:read", "INVOICE_READ", "SALES_READ"],

  "sales:create": ["sales:create", "INVOICE_CREATE", "SALES_CREATE"],
  "INVOICE_CREATE": ["sales:create", "INVOICE_CREATE", "SALES_CREATE"],
  "SALES_CREATE": ["sales:create", "INVOICE_CREATE", "SALES_CREATE"],

  "sales:update": ["sales:update", "INVOICE_UPDATE", "SALES_UPDATE"],
  "INVOICE_UPDATE": ["sales:update", "INVOICE_UPDATE", "SALES_UPDATE"],
  "SALES_UPDATE": ["sales:update", "INVOICE_UPDATE", "SALES_UPDATE"],

  "sales:delete": ["sales:delete", "INVOICE_DELETE", "SALES_DELETE"],
  "INVOICE_DELETE": ["sales:delete", "INVOICE_DELETE", "SALES_DELETE"],
  "SALES_DELETE": ["sales:delete", "INVOICE_DELETE", "SALES_DELETE"],

  "sales:approve": ["sales:approve", "SALES_APPROVE"],
  "SALES_APPROVE": ["sales:approve", "SALES_APPROVE"],

  "sales:reopen": ["sales:reopen", "INVOICE_REOPEN", "SALES_REOPEN"],
  "INVOICE_REOPEN": ["sales:reopen", "INVOICE_REOPEN", "SALES_REOPEN"],
  "SALES_REOPEN": ["sales:reopen", "INVOICE_REOPEN", "SALES_REOPEN"],

  "inventory:read": ["inventory:read", "INVENTORY_READ"],
  "INVENTORY_READ": ["inventory:read", "INVENTORY_READ"],
  "inventory:create": ["inventory:create", "INVENTORY_MANAGE"],
  "inventory:adjust": ["inventory:adjust", "INVENTORY_MANAGE"],
  "inventory:approve": ["inventory:approve", "INVENTORY_MANAGE"],
  "INVENTORY_MANAGE": ["inventory:create", "inventory:adjust", "inventory:approve", "INVENTORY_MANAGE"],

  "payroll:read": ["payroll:read", "PAYROLL_READ"],
  "PAYROLL_READ": ["payroll:read", "PAYROLL_READ"],
  "payroll:process": ["payroll:process", "PAYROLL_MUTATE"],
  "payroll:approve": ["payroll:approve", "PAYROLL_MUTATE"],
  "PAYROLL_MUTATE": ["payroll:process", "payroll:approve", "PAYROLL_MUTATE"],

  "accounting:read": ["accounting:read", "ACCOUNTING_READ"],
  "ACCOUNTING_READ": ["accounting:read", "ACCOUNTING_READ"],
  "accounting:post_voucher": ["accounting:post_voucher", "ACCOUNTING_MUTATE"],
  "accounting:close_period": ["accounting:close_period", "ACCOUNTING_MUTATE"],
  "ACCOUNTING_MUTATE": ["accounting:post_voucher", "accounting:close_period", "ACCOUNTING_MUTATE"],

  "system:manage_users": ["system:manage_users", "SETTINGS_MANAGE"],
  "system:view_audit_logs": ["system:view_audit_logs"],
  "system:settings": ["system:settings", "SETTINGS_MANAGE"],
  "SETTINGS_MANAGE": ["system:manage_users", "system:settings", "SETTINGS_MANAGE"],
};

const ROLE_PERMISSIONS: Record<UserRole, Set<Permission>> = {
  ADMIN: new Set<Permission>([
    "sales:read", "INVOICE_READ", "SALES_READ",
    "sales:create", "INVOICE_CREATE", "SALES_CREATE",
    "sales:update", "INVOICE_UPDATE", "SALES_UPDATE",
    "sales:delete", "INVOICE_DELETE", "SALES_DELETE",
    "sales:approve", "SALES_APPROVE",
    "sales:reopen", "INVOICE_REOPEN", "SALES_REOPEN",
    "inventory:read", "INVENTORY_READ",
    "inventory:create", "inventory:adjust", "inventory:approve", "INVENTORY_MANAGE",
    "payroll:read", "PAYROLL_READ",
    "payroll:process", "payroll:approve", "PAYROLL_MUTATE",
    "accounting:read", "ACCOUNTING_READ",
    "accounting:post_voucher", "accounting:close_period", "ACCOUNTING_MUTATE",
    "system:manage_users", "system:view_audit_logs", "system:settings", "SETTINGS_MANAGE",
  ]),
  STAFF: new Set<Permission>([
    "sales:read", "INVOICE_READ", "SALES_READ",
    "sales:create", "INVOICE_CREATE", "SALES_CREATE",
    "sales:update", "INVOICE_UPDATE", "SALES_UPDATE",
    "inventory:read", "INVENTORY_READ",
    "inventory:create",
    "payroll:read", "PAYROLL_READ",
    "accounting:read", "ACCOUNTING_READ",
  ]),
  WAREHOUSE_CLERK: new Set<Permission>([
    "inventory:read", "INVENTORY_READ",
    "inventory:create", "inventory:adjust", "INVENTORY_MANAGE",
    "sales:read", "INVOICE_READ", "SALES_READ",
  ]),
  CA_AUDITOR: new Set<Permission>([
    "sales:read", "INVOICE_READ", "SALES_READ",
    "inventory:read", "INVENTORY_READ",
    "payroll:read", "PAYROLL_READ",
    "accounting:read", "ACCOUNTING_READ",
    "accounting:post_voucher", "ACCOUNTING_MUTATE",
    "system:view_audit_logs",
  ]),
  SALES_OPERATOR: new Set<Permission>([
    "sales:read", "INVOICE_READ", "SALES_READ",
    "sales:create", "INVOICE_CREATE", "SALES_CREATE",
    "sales:update", "INVOICE_UPDATE", "SALES_UPDATE",
    "inventory:read", "INVENTORY_READ",
  ]),
};

/**
 * Check if a given UserRole possesses a granular permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const roleSet = ROLE_PERMISSIONS[role];
  if (!roleSet) return false;

  const equivalents = PERMISSION_MAP[permission] || [permission];
  return equivalents.some((p) => roleSet.has(p));
}

/**
 * Assert that a user role possesses a specific permission, throwing AppError if unauthorized
 */
export function assertPermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new AppError(
      "FORBIDDEN",
      `Permission denied: Role '${role}' lacks mandatory permission '${permission}'.`,
      403,
    );
  }
}

/**
 * Server action / service helper to get active user and verify permission
 */
export async function requirePermission(permission: Permission): Promise<User> {
  const user = await requireUser();
  assertPermission(user.role, permission);
  return user;
}
