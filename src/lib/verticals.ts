import type { BusinessVertical } from "@/generated/prisma/enums";

export interface VerticalMeta {
  key: BusinessVertical;
  label: string;
  badge: string;
  description: string;
  iconName: string;
  defaultInvoicePrefix: string;
  defaultUnit: string;
  defaultItemType: "PRODUCT" | "SERVICE";
  units: string[];
  categories: string[];
  features: {
    enableBatchExpiry: boolean;
    enableBarcodes: boolean;
    enableStaffCommission: boolean;
    enableAppointments: boolean;
    enablePrescriptions: boolean;
    enableLeaseTracking: boolean;
    enableStudentBatches: boolean;
  };
  navigationItems: {
    href: string;
    label: string;
    badge?: string;
    icon: string;
  }[];
}

export const VERTICAL_CONFIGS: Record<BusinessVertical, VerticalMeta> = {
  RETAIL_WHOLESALE: {
    key: "RETAIL_WHOLESALE",
    label: "Retail & Wholesale",
    badge: "Counter POS & ERP",
    description: "General retail shop, distributor, trading, and inventory sales",
    iconName: "ShoppingBag",
    defaultInvoicePrefix: "INV",
    defaultUnit: "PCS",
    defaultItemType: "PRODUCT",
    units: ["PCS", "BOX", "KGS", "NOS", "SET", "MTR", "PAC", "LTR", "BAG", "ROLL", "DOZ", "BDL", "GM"],
    categories: [
      "General",
      "Groceries & FMCG",
      "Hardware & Fasteners",
      "Electronics & Appliances",
      "Clothing & Apparel",
      "Home & Kitchen",
      "Raw Material",
      "Tools & Equipment",
    ],
    features: {
      enableBatchExpiry: false,
      enableBarcodes: true,
      enableStaffCommission: false,
      enableAppointments: false,
      enablePrescriptions: false,
      enableLeaseTracking: false,
      enableStudentBatches: false,
    },
    navigationItems: [
      { href: "/pos", label: "POS Express Billing", badge: "EXPRESS", icon: "Zap" },
      { href: "/items", label: "Inventory & Barcodes", badge: "SCAN", icon: "Package" },
      { href: "/items/stock-transfer", label: "Godowns & Transfer", icon: "ArrowRightLeft" },
      { href: "/challans", label: "Delivery Challans", icon: "FileCheck" },
    ],
  },
  PHARMACY: {
    key: "PHARMACY",
    label: "Pharmacy & Medical Store",
    badge: "Rx & FEFO Batch",
    description: "Chemist shop with batch, expiry date, HSN, and doctor prescription tracking",
    iconName: "Pill",
    defaultInvoicePrefix: "MED",
    defaultUnit: "STRIPS",
    defaultItemType: "PRODUCT",
    units: ["STRIPS", "TABLETS", "BOTTLES", "VIALS", "TUBES", "BOX", "PCS", "PACK", "SYRUP", "AMPOULE"],
    categories: [
      "Tablets & Capsules",
      "Syrups & Suspensions",
      "Injections & Vaccines",
      "Ointments & Creams",
      "Medical Devices & Kits",
      "Surgical & Wound Care",
      "Ayurvedic & Herbal",
      "Baby & Mother Care",
      "Personal Hygiene",
    ],
    features: {
      enableBatchExpiry: true,
      enableBarcodes: true,
      enableStaffCommission: false,
      enableAppointments: false,
      enablePrescriptions: true,
      enableLeaseTracking: false,
      enableStudentBatches: false,
    },
    navigationItems: [
      { href: "/items", label: "Drug Inventory & Expiry", badge: "FEFO", icon: "Pill" },
      { href: "/invoices/new", label: "Chemist Fast Billing", badge: "RX", icon: "FileText" },
      { href: "/alerts", label: "Expiry & Low Stock Alerts", badge: "LIVE", icon: "Bell" },
      { href: "/utilities/barcode-generator", label: "Medicine Barcodes", icon: "Barcode" },
    ],
  },
  SALON_CLINIC: {
    key: "SALON_CLINIC",
    label: "Salon, Spa & Clinic",
    badge: "Appointments & Staff",
    description: "Appointments, consultation fees, stylist commissions, and patient records",
    iconName: "Scissors",
    defaultInvoicePrefix: "CLN",
    defaultUnit: "SESSION",
    defaultItemType: "SERVICE",
    units: ["SESSION", "SERVICE", "VISIT", "HOURS", "SITTING", "TREATMENT", "PACKAGE", "PCS"],
    categories: [
      "Hair Services & Styling",
      "Skin Care & Facials",
      "Spa & Massage Therapy",
      "Nails & Manicure",
      "Bridal & Groom Packages",
      "Consultation Fees",
      "Diagnostics & Tests",
      "Clinical Treatment",
      "Retail Beauty Products",
    ],
    features: {
      enableBatchExpiry: false,
      enableBarcodes: false,
      enableStaffCommission: true,
      enableAppointments: true,
      enablePrescriptions: true,
      enableLeaseTracking: false,
      enableStudentBatches: false,
    },
    navigationItems: [
      { href: "/appointments", label: "Appointments & Bookings", badge: "BOOKINGS", icon: "CalendarDays" },
      { href: "/invoices/new", label: "Service Bill & Checkout", icon: "Receipt" },
      { href: "/employees", label: "Stylist Commissions", badge: "COMMISSION", icon: "Users" },
      { href: "/attendance", label: "Staff Shifts & Overtime", icon: "CalendarClock" },
    ],
  },
  REAL_ESTATE: {
    key: "REAL_ESTATE",
    label: "Real Estate & Rentals",
    badge: "Rent & Lease Billing",
    description: "Rent collection, tenant lease agreements, security deposits, and maintenance charges",
    iconName: "Building",
    defaultInvoicePrefix: "RNT",
    defaultUnit: "MONTH",
    defaultItemType: "SERVICE",
    units: ["MONTH", "SQFT", "SQYD", "UNIT", "FLAT", "YEAR", "DAY", "NOS"],
    categories: [
      "Residential Rent",
      "Commercial Lease",
      "Maintenance & CAM Charges",
      "Security Deposit",
      "Electricity & Water Charges",
      "Parking Slot Rental",
      "Brokerage & Consulting",
      "Property Management Fee",
    ],
    features: {
      enableBatchExpiry: false,
      enableBarcodes: false,
      enableStaffCommission: true,
      enableAppointments: false,
      enablePrescriptions: false,
      enableLeaseTracking: true,
      enableStudentBatches: false,
    },
    navigationItems: [
      { href: "/invoices", label: "Property Rent Invoices", badge: "RENT", icon: "Building2" },
      { href: "/customers", label: "Tenants & Landlords", badge: "PARTIES", icon: "Users" },
      { href: "/estimates", label: "Lease Agreements & Quotes", icon: "FileSpreadsheet" },
      { href: "/payments", label: "Security Deposits & CAM", icon: "Wallet" },
    ],
  },
  EDUCATION: {
    key: "EDUCATION",
    label: "Education & Coaching",
    badge: "Student Fees & Terms",
    description: "Student course fees, installment billing, exam fees, and teacher attendance payroll",
    iconName: "GraduationCap",
    defaultInvoicePrefix: "FEE",
    defaultUnit: "TERM",
    defaultItemType: "SERVICE",
    units: ["TERM", "COURSE", "MONTH", "SEMESTER", "SESSION", "HOUR", "BATCH", "NOS"],
    categories: [
      "Tuition & Course Fees",
      "Admission & Registration",
      "Examination Fees",
      "Study Material & Books",
      "Lab & Computer Fees",
      "Library Subscription",
      "Transport / Bus Fees",
      "Extracurricular Activities",
    ],
    features: {
      enableBatchExpiry: false,
      enableBarcodes: false,
      enableStaffCommission: false,
      enableAppointments: true,
      enablePrescriptions: false,
      enableLeaseTracking: false,
      enableStudentBatches: true,
    },
    navigationItems: [
      { href: "/invoices", label: "Student Fee Receipts", badge: "FEES", icon: "GraduationCap" },
      { href: "/customers", label: "Students & Parents", badge: "STUDENTS", icon: "Users" },
      { href: "/items", label: "Courses & Fee Structures", icon: "Package" },
      { href: "/appointments", label: "Parent / Student Consultations", icon: "CalendarDays" },
      { href: "/attendance", label: "Teacher & Staff Attendance", icon: "CalendarClock" },
    ],
  },
  RESTAURANT: {
    key: "RESTAURANT",
    label: "Restaurant & Cafe",
    badge: "Dining & Quick POS",
    description: "Dine-in POS billing, table orders, KOT printing, and recipe inventory",
    iconName: "Utensils",
    defaultInvoicePrefix: "KOT",
    defaultUnit: "PLATE",
    defaultItemType: "PRODUCT",
    units: ["PLATE", "PORTION", "SERVE", "BOWL", "CUP", "PCS", "GLASS", "KG", "PACK"],
    categories: [
      "Starters & Appetizers",
      "Main Course",
      "Breads & Roti",
      "Rice & Biryani",
      "Soups & Salads",
      "Desserts & Sweets",
      "Beverages & Mocktails",
      "Snacks & Fast Food",
      "Combos & Thalis",
    ],
    features: {
      enableBatchExpiry: true,
      enableBarcodes: false,
      enableStaffCommission: false,
      enableAppointments: false,
      enablePrescriptions: false,
      enableLeaseTracking: false,
      enableStudentBatches: false,
    },
    navigationItems: [
      { href: "/pos", label: "Dining POS Counter", badge: "COUNTER", icon: "Zap" },
      { href: "/items", label: "Food Menu & Recipes", icon: "Utensils" },
      { href: "/sale-orders", label: "Table Orders & KOT", badge: "KOT", icon: "ShoppingBag" },
      { href: "/expenses", label: "Kitchen Daily Expenses", icon: "Banknote" },
      { href: "/cash-bank/cash", label: "Cash Drawer Register", icon: "Wallet" },
    ],
  },
  GENERAL_SERVICES: {
    key: "GENERAL_SERVICES",
    label: "Professional Services",
    badge: "GST Time & Retainer",
    description: "Consulting, IT services, agencies, time & expense billing, retainers",
    iconName: "Briefcase",
    defaultInvoicePrefix: "SER",
    defaultUnit: "HRS",
    defaultItemType: "SERVICE",
    units: ["HRS", "DAYS", "PROJECT", "SESSION", "MONTH", "NOS", "VISIT", "JOB"],
    categories: [
      "Consulting & Advisory",
      "IT & Software Development",
      "Legal & Compliance",
      "Design & Creative",
      "Marketing & SEO",
      "Maintenance & AMC",
      "Hourly Retainer",
      "Project Milestone",
    ],
    features: {
      enableBatchExpiry: false,
      enableBarcodes: false,
      enableStaffCommission: true,
      enableAppointments: true,
      enablePrescriptions: false,
      enableLeaseTracking: false,
      enableStudentBatches: false,
    },
    navigationItems: [
      { href: "/appointments", label: "Client Bookings & Meetings", badge: "MEETINGS", icon: "CalendarDays" },
      { href: "/estimates", label: "Proposals & Quotations", badge: "PROPOSAL", icon: "FileSpreadsheet" },
      { href: "/invoices/new", label: "Service Bill & Retainer", icon: "FileText" },
      { href: "/proforma", label: "Proforma Invoices", icon: "FileText" },
      { href: "/payment-in", label: "Client Retainers", icon: "Wallet" },
    ],
  },
  OTHER: {
    key: "OTHER",
    label: "Custom / Other Enterprise",
    badge: "Flexible Enterprise",
    description: "Flexible ERP configuration tailored for custom business workflows",
    iconName: "Layers",
    defaultInvoicePrefix: "INV",
    defaultUnit: "NOS",
    defaultItemType: "PRODUCT",
    units: ["NOS", "PCS", "HRS", "SET", "UNIT", "BOX", "KG", "MTR", "JOB"],
    categories: [
      "General Products",
      "General Services",
      "Consumables",
      "Raw Materials",
      "Operations",
      "Miscellaneous",
    ],
    features: {
      enableBatchExpiry: false,
      enableBarcodes: true,
      enableStaffCommission: false,
      enableAppointments: false,
      enablePrescriptions: false,
      enableLeaseTracking: false,
      enableStudentBatches: false,
    },
    navigationItems: [
      { href: "/invoices/new", label: "Create Invoice", badge: "F8", icon: "FileText" },
      { href: "/items", label: "Items & Inventory", icon: "Package" },
      { href: "/customers", label: "Parties Directory", icon: "Users" },
    ],
  },
};

/**
 * Safely resolves vertical metadata for any given vertical key, falling back to RETAIL_WHOLESALE
 */
export function getVerticalConfig(vertical?: BusinessVertical | string | null): VerticalMeta {
  if (vertical && vertical in VERTICAL_CONFIGS) {
    return VERTICAL_CONFIGS[vertical as BusinessVertical];
  }
  return VERTICAL_CONFIGS.RETAIL_WHOLESALE;
}

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
