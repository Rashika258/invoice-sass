import fs from "fs";
import path from "path";
import { getAppSettings } from "@/lib/settings-store";

export interface StoreProduct {
  id: string;
  name: string;
  sku: string;
  hsn: string;
  category: string;
  onlinePrice: number;
  withoutTaxPrice: number;
  gstRate: number;
  discountPercent: number;
  onlineStock: number; // Independent online stock!
  unit: string;
  isPublic: boolean;
  linkedItemId?: string;
}

export interface StoreBillItem {
  id: string;
  name: string;
  hsn: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  amount: number;
  taxAmount: number;
}

export interface StoreBill {
  id: string;
  billNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: StoreBillItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  paymentMode: string;
  paymentStatus: "PAID" | "UNPAID" | "COD_PENDING";
  fulfillmentStatus: "NEW" | "CONFIRMED" | "DISPATCHED" | "DELIVERED";
}

interface StoreDatabase {
  products: StoreProduct[];
  bills: StoreBill[];
  nextBillSeq: number;
}

const STORE_DB_FILE = path.join(process.cwd(), "prisma", "store_db.json");

const INITIAL_STORE_PRODUCTS: StoreProduct[] = [
  {
    id: "sp-1",
    name: "M10 SS Hex Bolt 50mm (Grade 304)",
    sku: "BLT-M10-SS",
    hsn: "7318",
    category: "Hardware & Fasteners",
    onlinePrice: 18,
    withoutTaxPrice: 15.25,
    gstRate: 18,
    discountPercent: 5,
    onlineStock: 150, // Dedicated separate online stock
    unit: "PCS",
    isPublic: true,
  },
  {
    id: "sp-2",
    name: "MS Heavy Flange 2 Inch (Class 150)",
    sku: "FLG-MS-2IN",
    hsn: "7307",
    category: "Pipes & Fittings",
    onlinePrice: 420,
    withoutTaxPrice: 355.93,
    gstRate: 18,
    discountPercent: 10,
    onlineStock: 45,
    unit: "PCS",
    isPublic: true,
  },
  {
    id: "sp-3",
    name: "Teflon Thread Seal Tape 12mm x 10m",
    sku: "TAPE-TEF-12",
    hsn: "3920",
    category: "Plumbing Supplies",
    onlinePrice: 25,
    withoutTaxPrice: 21.19,
    gstRate: 18,
    discountPercent: 0,
    onlineStock: 300,
    unit: "PCS",
    isPublic: true,
  },
  {
    id: "sp-4",
    name: "Industrial Ball Valve 1 Inch SS 316",
    sku: "VLV-BL-1IN",
    hsn: "8481",
    category: "Valves & Controls",
    onlinePrice: 850,
    withoutTaxPrice: 720.34,
    gstRate: 18,
    discountPercent: 8,
    onlineStock: 25,
    unit: "PCS",
    isPublic: true,
  },
  {
    id: "sp-5",
    name: "Carbon Steel Seamless Pipe 1.5 Inch (Sch 40)",
    sku: "PIP-CS-15",
    hsn: "7304",
    category: "Pipes & Fittings",
    onlinePrice: 650,
    withoutTaxPrice: 550.85,
    gstRate: 18,
    discountPercent: 5,
    onlineStock: 60,
    unit: "MTR",
    isPublic: true,
  },
];

const INITIAL_STORE_BILLS: StoreBill[] = [
  {
    id: "sb-1001",
    billNumber: "OS-1001",
    date: new Date(Date.now() - 86400000).toISOString(),
    customerName: "Karthik Builders & Co",
    customerPhone: "9845123456",
    customerAddress: "Plot 14, Peenya Industrial Area, Bengaluru",
    items: [
      {
        id: "sbi-1",
        name: "M10 SS Hex Bolt 50mm (Grade 304)",
        hsn: "7318",
        quantity: 20,
        unitPrice: 18,
        gstRate: 18,
        amount: 360,
        taxAmount: 54.92,
      },
      {
        id: "sbi-2",
        name: "Teflon Thread Seal Tape 12mm x 10m",
        hsn: "3920",
        quantity: 4,
        unitPrice: 25,
        gstRate: 18,
        amount: 100,
        taxAmount: 15.25,
      },
    ],
    subtotal: 389.83,
    cgst: 35.08,
    sgst: 35.08,
    igst: 0,
    total: 460,
    paymentMode: "UPI",
    paymentStatus: "PAID",
    fulfillmentStatus: "DELIVERED",
  },
];

function readDb(): StoreDatabase {
  try {
    if (fs.existsSync(STORE_DB_FILE)) {
      const data = fs.readFileSync(STORE_DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading store_db.json:", e);
  }

  const initialDb: StoreDatabase = {
    products: INITIAL_STORE_PRODUCTS,
    bills: INITIAL_STORE_BILLS,
    nextBillSeq: 1002,
  };
  writeDb(initialDb);
  return initialDb;
}

function writeDb(data: StoreDatabase) {
  try {
    fs.writeFileSync(STORE_DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing store_db.json:", e);
  }
}

export function getStoreProducts(): StoreProduct[] {
  const db = readDb();
  return db.products;
}

export function updateStoreProduct(id: string, updates: Partial<StoreProduct>): StoreProduct | null {
  const db = readDb();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  db.products[idx] = { ...db.products[idx], ...updates };
  writeDb(db);
  return db.products[idx];
}

export function addStoreProduct(product: Omit<StoreProduct, "id">): StoreProduct {
  const db = readDb();
  const id = `sp-${Date.now()}`;
  const newProduct: StoreProduct = { id, ...product };
  db.products.push(newProduct);
  writeDb(db);
  return newProduct;
}

export function getStoreBills(): StoreBill[] {
  const db = readDb();
  return db.bills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getStoreBill(id: string): StoreBill | null {
  const db = readDb();
  return db.bills.find((b) => b.id === id || b.billNumber === id) || null;
}

export function createStoreBill(order: {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: { productId: string; quantity: number }[];
  paymentMode: string;
  isInterState?: boolean;
}): StoreBill {
  const db = readDb();
  const settings = getAppSettings();
  const prefix = settings.storeInvoicePrefix || "OS";
  const billNumber = `${prefix}-${db.nextBillSeq}`;
  db.nextBillSeq += 1;

  let subtotal = 0;
  let totalGst = 0;
  const billItems: StoreBillItem[] = [];

  for (const it of order.items) {
    const prod = db.products.find((p) => p.id === it.productId);
    if (!prod) continue;

    const qty = it.quantity;
    const grossAmount = prod.onlinePrice * qty;
    // Calculate taxable value (reverse GST if price is inclusive)
    const gstMultiplier = 1 + prod.gstRate / 100;
    const taxableRate = prod.onlinePrice / gstMultiplier;
    const itemSubtotal = taxableRate * qty;
    const itemTax = grossAmount - itemSubtotal;

    subtotal += itemSubtotal;
    totalGst += itemTax;

    billItems.push({
      id: `sbi-${Date.now()}-${Math.random()}`,
      name: prod.name,
      hsn: prod.hsn,
      quantity: qty,
      unitPrice: prod.onlinePrice,
      gstRate: prod.gstRate,
      amount: grossAmount,
      taxAmount: Math.round(itemTax * 100) / 100,
    });

    // SEPARATE STOCK MANAGEMENT: deduct ONLY from onlineStock!
    if (settings.autoDeductStoreStock) {
      prod.onlineStock = Math.max(prod.onlineStock - qty, 0);
    }
  }

  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const roundedTax = Math.round(totalGst * 100) / 100;
  const total = Math.round((roundedSubtotal + roundedTax) * 100) / 100;

  const cgst = order.isInterState ? 0 : Math.round((roundedTax / 2) * 100) / 100;
  const sgst = order.isInterState ? 0 : Math.round((roundedTax / 2) * 100) / 100;
  const igst = order.isInterState ? roundedTax : 0;

  const newBill: StoreBill = {
    id: `sb-${Date.now()}`,
    billNumber,
    date: new Date().toISOString(),
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress || "Walk-in Online Store Customer",
    items: billItems,
    subtotal: roundedSubtotal,
    cgst,
    sgst,
    igst,
    total,
    paymentMode: order.paymentMode || "UPI",
    paymentStatus: order.paymentMode === "COD" ? "COD_PENDING" : "PAID",
    fulfillmentStatus: "CONFIRMED",
  };

  db.bills.push(newBill);
  writeDb(db);
  return newBill;
}
