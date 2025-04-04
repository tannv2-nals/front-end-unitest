# Test Case Checklist

## main.test.ts
- [x] renders the Vite + TypeScript template.
- [x] initializeApp: Should call `setupCounter` with the counter button.

## counter.test.ts
- [x] initializes the button with "count is 0".
- [x] increments the counter when the button is clicked.
- [x] increments the counter cumulatively on multiple clicks.

## order.service.test.ts
- [x] should throw an error for invalid order items price.
- [x] should throw an error for invalid order items quantity.
- [x] should throw an error for empty order items.
- [x] should calculate the total price correctly.
- [x] should throw an error for invalid coupon.
- [x] should calculate total price without a coupon.
- [x] should apply coupon discount correctly.
- [x] should set total price to 0 if coupon discount exceeds total price.

## payment.service.test.ts
- [x] should include all payment methods if totalPrice is below thresholds.
- [x] should exclude PAYPAY if totalPrice exceeds 500,000.
- [x] should exclude AUPAY if totalPrice exceeds 300,000.
- [x] should exclude both PAYPAY and AUPAY if totalPrice exceeds 500,000.
- [x] should open payment link in a new tab.