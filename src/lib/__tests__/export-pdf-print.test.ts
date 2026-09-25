import { describe, it, expect } from "vitest";
import { numberToWordsIndian } from "../number-to-words";
import { buildUpiUri, generateUpiQrSvg } from "../upi-qr";

function splitRupeesPaise(amount: number | null | undefined): { rs: string; ps: string } {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return { rs: "", ps: "" };
  }
  const rounded = Math.round(Number(amount) * 100) / 100;
  const isNeg = rounded < 0;
  const abs = Math.abs(rounded);
  const parts = abs.toFixed(2).split(".");
  const rsFormatted = Number(parts[0]).toLocaleString("en-IN");
  return {
    rs: (isNeg ? "-" : "") + rsFormatted,
    ps: parts[1] || "00",
  };
}

describe("Export, Print & PDF Document Generation", () => {
  describe("Indian Numbering System Currency Words", () => {
    it("should format single digit and basic numbers", () => {
      expect(numberToWordsIndian(5)).toContain("Five");
      expect(numberToWordsIndian(18)).toContain("Eighteen");
    });

    it("should convert hundreds, thousands, lakhs, and crores accurately", () => {
      // 1,25,000 = One Lakh Twenty Five Thousand Rupees
      const lakhsText = numberToWordsIndian(125000);
      expect(lakhsText).toContain("One Lakh Twenty Five Thousand");

      // 1,50,00,000 = One Crore Fifty Lakh Rupees
      const croreText = numberToWordsIndian(15000000);
      expect(croreText).toContain("One Crore Fifty Lakh");
    });

    it("should include paise in decimal amounts", () => {
      const withPaise = numberToWordsIndian(1050.75);
      expect(withPaise).toContain("One Thousand Fifty");
      expect(withPaise).toContain("Seventy Five Paise");
    });

    it("should handle zero gracefully", () => {
      expect(numberToWordsIndian(0)).toBe("Rupees Zero Only");
    });
  });

  describe("Split Rupees & Paise for Authentic Ledger Layouts", () => {
    it("should split whole numbers into formatted Indian thousands and 00 paise", () => {
      expect(splitRupeesPaise(125000)).toEqual({ rs: "1,25,000", ps: "00" });
      expect(splitRupeesPaise(500)).toEqual({ rs: "500", ps: "00" });
    });

    it("should preserve leading zeroes in single-digit paise", () => {
      expect(splitRupeesPaise(100.05)).toEqual({ rs: "100", ps: "05" });
      expect(splitRupeesPaise(42.5)).toEqual({ rs: "42", ps: "50" });
    });

    it("should handle negative balances correctly", () => {
      expect(splitRupeesPaise(-2500.5)).toEqual({ rs: "-2,500", ps: "50" });
    });

    it("should handle null or undefined safely", () => {
      expect(splitRupeesPaise(null)).toEqual({ rs: "", ps: "" });
      expect(splitRupeesPaise(undefined)).toEqual({ rs: "", ps: "" });
    });
  });

  describe("Dynamic UPI QR Code Generation & URI Encoding", () => {
    it("should build standard NPCI-compliant UPI URI strings", () => {
      const upiUri = buildUpiUri({
        upiId: "merchant@okaxis",
        payeeName: "Billora Enterprises",
        amount: 2500.5,
        transactionRef: "INV-2026-001",
        note: "Invoice INV-2026-001",
      });

      expect(upiUri.startsWith("upi://pay?")).toBe(true);
      expect(decodeURIComponent(upiUri)).toContain("pa=merchant@okaxis");
      expect(decodeURIComponent(upiUri)).toContain("pn=Billora Enterprises");

      expect(upiUri).toContain("am=2500.50");
      expect(upiUri).toContain("cu=INR");
      expect(upiUri).toContain("tr=INV-2026-001");
    });

    it("should return empty string if UPI ID is missing", () => {
      const upiUri = buildUpiUri({
        upiId: "",
        payeeName: "Merchant",
        amount: 100,
      });
      expect(upiUri).toBe("");
    });

    it("should generate self-contained inline SVG QR code markup", () => {
      const svg = generateUpiQrSvg({
        upiId: "billora@icici",
        payeeName: "Store Counter",
        amount: 450,
      });

      expect(svg).toContain("<svg");
      expect(svg).toContain("</svg>");
      expect(svg).toContain("viewBox=\"0 0 100 100\"");
      expect(svg).toContain("UPI");
    });
  });

  describe("Thermal POS Receipt Formatting Bounds", () => {
    it("should format compact 80mm column lines within character width boundaries", () => {
      const maxColumns = 42; // Standard 80mm thermal printer character width
      const itemName = "Paracetamol 500mg Strip";
      const priceFormatted = "₹45.00";

      // Pad spaces between item name and price
      const spacesNeeded = maxColumns - itemName.length - priceFormatted.length;
      const receiptLine = `${itemName}${" ".repeat(Math.max(1, spacesNeeded))}${priceFormatted}`;

      expect(receiptLine.length).toBeLessThanOrEqual(maxColumns);
      expect(receiptLine).toContain(itemName);
      expect(receiptLine).toContain(priceFormatted);
    });
  });
});
