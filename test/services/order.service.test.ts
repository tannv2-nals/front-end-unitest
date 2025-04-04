import { describe, it, expect, vi, beforeEach, Mock, afterEach } from "vitest";
import { OrderService } from "../../src/services/order.service";
import { PaymentService } from "../../src/services/payment.service";
import { Order } from "../../src/models/order.model";

describe("OrderService", () => {
  let orderService: OrderService;
  let paymentService: PaymentService;
  let mockFetch: Mock;

  beforeEach(() => {
    paymentService = {
      buildPaymentMethod: vi.fn().mockReturnValue("mock-payment-method"),
      payViaLink: vi.fn(),
    } as unknown as PaymentService;
    orderService = new OrderService(paymentService);
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should throw an error for invalid order items price", async () => {
    const order: Partial<Order> = {
      items: [
        { id: "1", productId: "p1", price: -100, quantity: 2 },
        { id: "2", productId: "p2", price: 50, quantity: 0 },
      ],
    };

    await expect(orderService.process(order)).rejects.toThrow(
      "Order items are invalid"
    );
  });

  it("should throw an error for invalid order items quantity", async () => {
    const order: Partial<Order> = {
      items: [
        { id: "1", productId: "p1", price: 10, quantity: -2 },
        { id: "2", productId: "p2", price: 50, quantity: 0 },
      ],
    };

    await expect(orderService.process(order)).rejects.toThrow(
      "Order items are invalid"
    );
  });

  it("should throw an error for empty order items", async () => {
    const order: Partial<Order> = {
      items: [],
    };

    await expect(orderService.process(order)).rejects.toThrow(
      "Order items are required"
    );
  });

  it("should calculate the total price correctly", async () => {
    const order: Partial<Order> = {
      items: [
        { id: "1", productId: "p1", price: 100, quantity: 2 },
        { id: "2", productId: "p2", price: 50, quantity: 1 },
      ],
    };

    (globalThis.fetch as Mock).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce({ id: "mock-order-id" }),
    });

    await orderService.process(order);

    expect(paymentService.payViaLink).toHaveBeenCalledWith({
      id: "mock-order-id",
    });
  });

  it("should throw an error for invalid coupon", async () => {
    const couponId = "in-valid-coupon-id";

    (globalThis.fetch as Mock).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(null),
    });

    const order: Partial<Order> = {
      items: [
        { id: "1", productId: "p1", price: 100, quantity: 2 },
        { id: "2", productId: "p2", price: 50, quantity: 1 },
      ],
      couponId,
    };

    await expect(orderService.process(order)).rejects.toThrow("Invalid coupon");
  });

  it("should calculate total price without a coupon", async () => {
    const order = {
      items: [{ id: "1", productId: "1", price: 100, quantity: 2 }],
    };

    const totalPrice = await orderService["calculateFinalPrice"](order);

    expect(totalPrice).toBe(200);
  });

  it("should apply coupon discount correctly", async () => {
    const couponId = "1";
    const totalPrice = 700;

    (globalThis.fetch as Mock).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce({
        code: "discount500",
        discount: 500,
        id: "1",
      }),
    });

    const priceAfterDiscount = await orderService["applyCouponDiscount"](couponId, totalPrice);
    expect(priceAfterDiscount).toBe(200);
  });

  it("should set total price to 0 if coupon discount exceeds total price", async () => {
    const couponId = "1";
    const order = {
      items: [{ id: "1", productId: "1", price: 500, quantity: 1 }],
      couponId: "valid-coupon",
    };

    (globalThis.fetch as Mock).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce({
        code: "discount500",
        discount: 500,
        id: "1",
      }),
    });

    const totalPrice = await orderService["calculateFinalPrice"](order);

    expect(totalPrice).toBe(0);
  });

});
