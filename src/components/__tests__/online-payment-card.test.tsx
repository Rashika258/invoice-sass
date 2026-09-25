// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { OnlinePaymentCard } from "../invoices/online-payment-card";

vi.mock("@/actions/payment-gateway", () => ({
  getInvoicePaymentLinkAction: vi.fn().mockResolvedValue({
    success: true,
    upiUrl: "upi://pay?pa=test@okaxis&am=1500",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=test",
    payLink: "/api/v1/payments/pay-invoice/inv-123",
  }),
}));

describe("OnlinePaymentCard Component (React Testing Library)", () => {
  it("renders payment settled notification when status is PAID", async () => {
    render(
      <OnlinePaymentCard
        invoiceId="inv-101"
        amount={2500}
        customerName="Apex Traders"
        status="PAID"
      />
    );

    await waitFor(() => {
      expect(screen.getByText("PAYMENT RECEIVED")).toBeInTheDocument();
      expect(screen.getByText("SETTLED")).toBeInTheDocument();
      expect(screen.getByText(/Payment of ₹ 2,500 was received and verified!/i)).toBeInTheDocument();
    });
  });

  it("renders QR code and payment link actions when invoice is UNPAID", async () => {
    render(
      <OnlinePaymentCard
        invoiceId="inv-102"
        amount={1500}
        customerName="Zenith Tech"
        status="SENT"
      />
    );

    expect(screen.getByText("READY FOR PAYMENT")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByAltText("Invoice UPI Payment QR")).toBeInTheDocument();
      expect(screen.getByText("Copy Payment Link")).toBeInTheDocument();
      expect(screen.getByText("Open Payment Portal")).toBeInTheDocument();
    });
  });
});
