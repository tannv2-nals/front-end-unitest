import { describe, it, expect, vi, beforeEach } from "vitest";
import { PaymentService } from "../../src/services/payment.service";
import { PaymentMethod } from "../../src/models/payment.model";
import { Order } from "../../src/models/order.model";

describe("PaymentService", () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService();
  });

  it('should include all payment methods if totalPrice is below thresholds', () => {
    const result = paymentService.buildPaymentMethod(100000);
    expect(result).toBe(`${PaymentMethod.CREDIT},${PaymentMethod.PAYPAY},${PaymentMethod.AUPAY}`);
  });

  it('should exclude PAYPAY if totalPrice exceeds 500,000', () => {
    const result = paymentService.buildPaymentMethod(600000);
    expect(result).toBe(PaymentMethod.CREDIT);
  });

  it('should exclude AUPAY if totalPrice exceeds 300,000', () => {
    const result = paymentService.buildPaymentMethod(400000);
    expect(result).toBe(`${PaymentMethod.CREDIT},${PaymentMethod.PAYPAY}`);
  });

  it('should exclude both PAYPAY and AUPAY if totalPrice exceeds 500,000', () => {
    const result = paymentService.buildPaymentMethod(600000);
    expect(result).toBe(`${PaymentMethod.CREDIT}`);
  });

  it("should open payment link in a new tab", () => {
    const order: Order = {
      id: "123",
      items: [{ id: "1", productId: "p1", price: 100, quantity: 1 }],
      totalPrice: 1000,
      paymentMethod: PaymentMethod.CREDIT,
    };

    const mockOpen = vi.fn();
    window.open = mockOpen;

    paymentService.payViaLink(order);

    expect(mockOpen).toHaveBeenCalledWith(
      `https://payment.example.com/pay?orderId=${order.id}`,
      "_blank"
    );
  });
});
