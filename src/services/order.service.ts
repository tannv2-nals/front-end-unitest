import { Order } from '../models/order.model';
import { PaymentService } from './payment.service';

export class OrderService {
  constructor(private readonly paymentService: PaymentService) {}

  async process(order: Partial<Order>) {
    this.validateOrder(order);

    let totalPrice = await this.calculateFinalPrice(order);

    const orderPayload = this.buildOrderPayload(order, totalPrice);

    const createdOrder = await this.createOrder(orderPayload);

    this.paymentService.payViaLink(createdOrder);
  }

  private async calculateFinalPrice(order: Partial<Order>): Promise<number> {
    let totalPrice = this.calculateTotalPrice(order);

    if (order.couponId) {
      totalPrice = await this.applyCouponDiscount(order.couponId, totalPrice);
    }

    return totalPrice;
  }

  private validateOrder(order: Partial<Order>) {
    if (!order.items?.length) {
      throw new Error('Order items are required');
    }

    if (order.items.some(item => item.price <= 0 || item.quantity <= 0)) {
      throw new Error('Order items are invalid');
    }
  }

  private calculateTotalPrice(order: Partial<Order>): number {
    return order.items!.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  private async applyCouponDiscount(couponId: string, totalPrice: number): Promise<number> {
    const response = await fetch(`https://67eb7353aa794fb3222a4c0e.mockapi.io/coupons/${couponId}`);
    const coupon = await response.json();

    if (!coupon) {
      throw new Error('Invalid coupon');
    }

    totalPrice -= coupon.discount;

    return Math.max(totalPrice, 0);
  }

  private buildOrderPayload(order: Partial<Order>, totalPrice: number) {
    return {
      ...order,
      totalPrice,
      paymentMethod: this.paymentService.buildPaymentMethod(totalPrice),
    };
  }

  private async createOrder(orderPayload: any) {
    const response = await fetch('https://67eb7353aa794fb3222a4c0e.mockapi.io/order', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
      headers: { 'Content-Type': 'application/json' },
    });

    return response.json();
  }
}
