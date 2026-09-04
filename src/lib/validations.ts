import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

export const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  hsn: z.string().optional(),
  unitPrice: z.coerce.number().min(0, "Price must be positive"),
  unit: z.string().optional(),
  isPublic: z.coerce.boolean().optional().default(false),
});

export const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  position: z.string().optional(),
  hourlyRate: z.coerce.number().min(0, "Hourly rate must be positive"),
  overtimeRate: z.coerce.number().min(0, "Overtime rate must be positive"),
});

export const attendanceSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  date: z.string().min(1, "Date is required"),
  hoursWorked: z.coerce
    .number()
    .min(0, "Hours must be positive")
    .max(24, "Cannot exceed 24 hours"),
  notes: z.string().optional(),
});

export const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  hsn: z.string().optional(),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  unitPrice: z.coerce.number().min(0, "Price must be positive"),
});

export const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  issueDate: z.string().min(1),
  dueDate: z.string().min(1),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]),
  taxRate: z.coerce.number().min(0).max(100),
  discount: z.coerce.number().min(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(lineItemSchema).min(1, "Add at least one line item"),
});

export const companyProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  website: z.string().optional(),
  taxId: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  paymentTerms: z.string().optional(),
  invoicePrefix: z.string().min(1),
  currency: z.string().min(1),
  defaultTaxRate: z.coerce.number().min(0).max(100),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type ItemInput = z.infer<typeof itemSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
