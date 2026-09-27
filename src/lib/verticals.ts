import type { BusinessVertical } from "@/generated/prisma/client";

export interface VerticalMeta {
  key: BusinessVertical;
  label: string;
  description: string;
  iconName: string;
  defaultInvoicePrefix: string;
  defaultUnit: string;
  features: {
    enableBatchExpiry: boolean;
    enableBarcodes: boolean;
    enableStaffCommission: boolean;
    enableAppointments: boolean;
    enablePrescriptions: boolean;
    enableLeaseTracking: boolean;
    enableStudentBatches: boolean;
  };
}

export const VERTICAL_CONFIGS: Record<BusinessVertical, VerticalMeta> = {
  RETAIL_WHOLESALE: {
    key: "RETAIL_WHOLESALE",
    label: "Retail & Wholesale",
    description: "General retail shop, distributor, trading, and inventory sales",
    iconName: "ShoppingBag",
    defaultInvoicePrefix: "INV",
    defaultUnit: "pcs",
    features: {
      enableBatchExpiry: false,
      enableBarcodes: true,
      enableStaffCommission: false,
      enableAppointments: false,
      enablePrescriptions: false,
      enableLeaseTracking: false,
      enableStudentBatches: false,
    },
  },
  PHARMACY: {
    key: "PHARMACY",
    label: "Pharmacy & Medical Store",
    description: "Chemist shop with batch, expiry date, HSN, and doctor prescription tracking",
    iconName: "Pill",
    defaultInvoicePrefix: "MED",
    defaultUnit: "strips",
    features: {
      enableBatchExpiry: true,
      enableBarcodes: true,
      enableStaffCommission: false,
      enableAppointments: false,
      enablePrescriptions: true,
      enableLeaseTracking: false,
      enableStudentBatches: false,
    },
  },
  SALON_CLINIC: {
    key: "SALON_CLINIC",
    label: "Salon, Spa & Clinic",
    description: "Appointments, consultation fees, staff commissions, and patient records",
    iconName: "Stethoscope",
    defaultInvoicePrefix: "CLN",
    defaultUnit: "session",
    features: {
      enableBatchExpiry: false,
      enableBarcodes: false,
      enableStaffCommission: true,
      enableAppointments: true,
      enablePrescriptions: true,
      enableLeaseTracking: false,
      enableStudentBatches: false,
    },
  },
  REAL_ESTATE: {
    key: "REAL_ESTATE",
    label: "Real Estate & Property Management",
    description: "Rent collection, tenant lease agreements, security deposits, and maintenance charges",
    iconName: "Building",
    defaultInvoicePrefix: "RNT",
    defaultUnit: "month",
    features: {
      enableBatchExpiry: false,
      enableBarcodes: false,
      enableStaffCommission: true,
      enableAppointments: false,
      enablePrescriptions: false,
      enableLeaseTracking: true,
      enableStudentBatches: false,
    },
  },
  EDUCATION: {
    key: "EDUCATION",
    label: "Education & Coaching Institutes",
    description: "Student course fees, installment billing, exam fees, and teacher attendance payroll",
    iconName: "GraduationCap",
    defaultInvoicePrefix: "FEE",
    defaultUnit: "term",
    features: {
      enableBatchExpiry: false,
      enableBarcodes: false,
      enableStaffCommission: false,
      enableAppointments: true,
      enablePrescriptions: false,
      enableLeaseTracking: false,
      enableStudentBatches: true,
    },
  },
  RESTAURANT: {
    key: "RESTAURANT",
    label: "Restaurant & Food Outlet",
    description: "Dine-in POS billing, table orders, KOT printing, and recipe inventory",
    iconName: "Utensils",
    defaultInvoicePrefix: "KOT",
    defaultUnit: "plate",
    features: {
      enableBatchExpiry: true,
      enableBarcodes: false,
      enableStaffCommission: false,
      enableAppointments: false,
      enablePrescriptions: false,
      enableLeaseTracking: false,
      enableStudentBatches: false,
    },
  },
  GENERAL_SERVICES: {
    key: "GENERAL_SERVICES",
    label: "Professional & General Services",
    description: "Consulting, IT services, agencies, time & expense billing, retainers",
    iconName: "Briefcase",
    defaultInvoicePrefix: "SER",
    defaultUnit: "hrs",
    features: {
      enableBatchExpiry: false,
      enableBarcodes: false,
      enableStaffCommission: true,
      enableAppointments: true,
      enablePrescriptions: false,
      enableLeaseTracking: false,
      enableStudentBatches: false,
    },
  },
  OTHER: {
    key: "OTHER",
    label: "Custom / Other Business",
    description: "Flexible ERP configuration tailored for custom business workflows",
    iconName: "Layers",
    defaultInvoicePrefix: "INV",
    defaultUnit: "nos",
    features: {
      enableBatchExpiry: false,
      enableBarcodes: true,
      enableStaffCommission: false,
      enableAppointments: false,
      enablePrescriptions: false,
      enableLeaseTracking: false,
      enableStudentBatches: false,
    },
  },
};

/**
 * Generate Real Estate Rent Invoice Line Item Preset
 */
export function buildRealEstateRentLine(unitName: string, monthlyRent: number, monthYear: string) {
  return {
    description: `Monthly Property Rent — ${unitName} (${monthYear})`,
    hsn: "997211", // GST SAC code for Residential/Commercial Rent
    unit: "month",
    quantity: 1,
    unitPrice: monthlyRent,
    gstRate: 0, // Exempt for residential rent or 18% for commercial
  };
}

/**
 * Generate Real Estate Maintenance Charge Line Item Preset
 */
export function buildRealEstateMaintenanceLine(unitName: string, chargeAmount: number) {
  return {
    description: `Common Area Maintenance & Facility Fee — ${unitName}`,
    hsn: "999599",
    unit: "month",
    quantity: 1,
    unitPrice: chargeAmount,
    gstRate: 18,
  };
}

/**
 * Generate Education Course Installment Line Item Preset
 */
export function buildEducationCourseFeeLine(courseName: string, installmentNo: number, feeAmount: number) {
  return {
    description: `Course Fee Installments (#${installmentNo}) — ${courseName}`,
    hsn: "999293", // GST SAC code for Coaching / Educational Services
    unit: "term",
    quantity: 1,
    unitPrice: feeAmount,
    gstRate: 0, // Educational services exempt under GST Notification 12/2017
  };
}
