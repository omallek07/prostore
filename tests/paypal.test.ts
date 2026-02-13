import { paypal, generateAccessToken } from '../lib/paypal';

// Test to generate access token from paypal
test('Generate PayPal Access Token', async () => {
  const tokenResponse = await generateAccessToken();
  console.log('PayPal Access Token:', tokenResponse);
  expect(typeof tokenResponse).toBe('string');
  expect(tokenResponse.length).toBeGreaterThan(0);
});

// Test to create a paypal order
test('creates a paypal order', async () => {
  const price = 10.0; // Example price

  const orderResponse = await paypal.createOrder(price);
  console.log('PayPal Order Response:', orderResponse);

  expect(orderResponse).toHaveProperty('id');
  expect(orderResponse).toHaveProperty('status');
  expect(orderResponse.status).toBe('CREATED');
});

// Test to capture payment with a mock order
test('simulate capturing a payment from an order', async () => {
  const mockOrderId = '100';
  const mockCapturePayment = jest
    .spyOn(paypal, 'capturePayment')
    .mockResolvedValue({
      status: 'COMPLETED',
    });

  const captureResponse = await paypal.capturePayment(mockOrderId);

  expect(captureResponse).toHaveProperty('status');
  expect(captureResponse.status).toBe('COMPLETED');

  mockCapturePayment.mockRestore();
});
