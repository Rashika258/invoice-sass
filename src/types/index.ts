export type {
  DocumentType,
  InvoiceStatus,
  PartyType,
  ItemType,
  PaymentMode,
  PaymentDirection,
  UserRole,
} from "@/generated/prisma/client";

export type {
  InvoiceInput,
  CustomerInput,
  ItemInput,
} from "@/lib/validations";

export type {
  LedgerGroupKey,
  VoucherTypeKey,
  LedgerInput,
  VoucherInput,
  VoucherEntryLine,
  GetVouchersOptions,
} from "@/services/accounting-service";

export type {
  GeneratePayrollInput,
} from "@/services/payroll-service";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
