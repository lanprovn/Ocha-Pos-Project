import request from 'supertest';
import app from '../../src/app';
import crypto from 'crypto';

// Mock authentication middleware
jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = {
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'STAFF',
    };
    next();
  },
  requireRole: () => (req: any, res: any, next: any) => next(),
}));

describe('Payments API Integration Tests', () => {
  beforeEach(() => {
    // Set test environment variables
    process.env.VNPAY_TMN_CODE = 'TEST_TMN_CODE';
    process.env.VNPAY_SECRET_KEY = 'TEST_SECRET_KEY_32_CHARS_LONG';
    process.env.VNPAY_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    process.env.VNPAY_RETURN_URL = 'http://localhost:3000/payment/callback';
  });

  describe('POST /api/payment/vnpay', () => {
    it('should create VNPay payment URL successfully', async () => {
      const paymentData = {
        orderId: 'order-123',
        orderNumber: 'ORD-123456',
        amount: 100000,
        description: 'Test payment',
        returnUrl: 'http://localhost:3000/callback',
        cancelUrl: 'http://localhost:3000/cancel',
      };

      const response = await request(app)
        .post('/api/payment/vnpay')
        .send(paymentData)
        .expect(200);

      expect(response.body).toHaveProperty('paymentUrl');
      expect(response.body).toHaveProperty('transactionId');
      expect(response.body.paymentUrl).toContain('vnpayment.vn');
      expect(response.body.paymentUrl).toContain('vnp_SecureHash');
    });

    it('should return 400 for invalid payment data', async () => {
      const invalidData = {
        amount: -100, // Invalid negative amount
        description: 'Test',
      };

      const response = await request(app)
        .post('/api/payment/vnpay')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should include customer information in payment URL', async () => {
      const paymentData = {
        orderId: 'order-123',
        orderNumber: 'ORD-123456',
        amount: 100000,
        description: 'Test payment',
        customerName: 'John Doe',
        customerPhone: '0987654321',
        returnUrl: 'http://localhost:3000/callback',
        cancelUrl: 'http://localhost:3000/cancel',
      };

      const response = await request(app)
        .post('/api/payment/vnpay')
        .send(paymentData)
        .expect(200);

      const url = new URL(response.body.paymentUrl);
      expect(url.searchParams.get('vnp_Bill_FirstName')).toBe('John Doe');
      expect(url.searchParams.get('vnp_Bill_Mobile')).toBe('0987654321');
    });
  });

  describe('POST /api/payment/vnpay/callback', () => {
    it('should verify valid VNPay callback', async () => {
      const params: Record<string, string> = {
        vnp_Amount: '10000000',
        vnp_BankCode: 'NCB',
        vnp_CardType: 'ATM',
        vnp_OrderInfo: 'Thanh toán đơn hàng ORD-123456',
        vnp_ResponseCode: '00',
        vnp_TmnCode: 'TEST_TMN_CODE',
        vnp_TransactionNo: '12345678',
        vnp_TransactionStatus: '00',
        vnp_TxnRef: 'order-123',
        vnp_CreateDate: '20240101120000',
        vnp_PayDate: '20240101120001',
      };

      // Create valid secure hash
      const sortedParams = Object.keys(params)
        .sort()
        .reduce((acc: Record<string, string>, key) => {
          acc[key] = params[key];
          return acc;
        }, {});

      const queryString = Object.keys(sortedParams)
        .map((key) => `${key}=${sortedParams[key]}`)
        .join('&');

      const secureHash = crypto
        .createHmac('sha512', process.env.VNPAY_SECRET_KEY!)
        .update(queryString)
        .digest('hex');

      params['vnp_SecureHash'] = secureHash;

      const response = await request(app)
        .post('/api/payment/vnpay/callback')
        .send(params)
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('success');
    });

    it('should reject callback with invalid secure hash', async () => {
      const params: Record<string, string> = {
        vnp_Amount: '10000000',
        vnp_ResponseCode: '00',
        vnp_SecureHash: 'invalid_hash',
      };

      const response = await request(app)
        .post('/api/payment/vnpay/callback')
        .send(params)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});

