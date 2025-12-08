import { PaymentService } from '../../../src/services/payment.service';
import crypto from 'crypto';

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService();
    // Set test environment variables
    process.env.VNPAY_TMN_CODE = 'TEST_TMN_CODE';
    process.env.VNPAY_SECRET_KEY = 'TEST_SECRET_KEY_32_CHARS_LONG';
    process.env.VNPAY_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    process.env.VNPAY_RETURN_URL = 'http://localhost:3000/payment/callback';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createVNPayPayment', () => {
    it('should create payment URL with correct format', async () => {
      const request = {
        orderId: 'order-123',
        orderNumber: 'ORD-123456',
        amount: 100000,
        description: 'Test payment',
        returnUrl: 'http://localhost:3000/callback',
        cancelUrl: 'http://localhost:3000/cancel',
      };

      const result = await paymentService.createVNPayPayment(request);

      expect(result).toHaveProperty('paymentUrl');
      expect(result).toHaveProperty('transactionId');
      expect(result.paymentUrl).toContain('https://sandbox.vnpayment.vn');
      expect(result.paymentUrl).toContain('vnp_SecureHash');
      expect(result.transactionId).toBeDefined();
    });

    it('should convert amount to cents (multiply by 100)', async () => {
      const request = {
        orderId: 'order-123',
        orderNumber: 'ORD-123456',
        amount: 100000, // 100,000 VND
        description: 'Test payment',
        returnUrl: 'http://localhost:3000/callback',
        cancelUrl: 'http://localhost:3000/cancel',
      };

      const result = await paymentService.createVNPayPayment(request);

      // Extract amount from URL
      const url = new URL(result.paymentUrl);
      const amountParam = url.searchParams.get('vnp_Amount');
      
      expect(amountParam).toBe('10000000'); // 100,000 * 100 = 10,000,000 cents
    });

    it('should include customer information if provided', async () => {
      const request = {
        orderId: 'order-123',
        orderNumber: 'ORD-123456',
        amount: 100000,
        description: 'Test payment',
        customerName: 'John Doe',
        customerPhone: '0987654321',
        returnUrl: 'http://localhost:3000/callback',
        cancelUrl: 'http://localhost:3000/cancel',
      };

      const result = await paymentService.createVNPayPayment(request);

      const url = new URL(result.paymentUrl);
      expect(url.searchParams.get('vnp_Bill_FirstName')).toBe('John Doe');
      expect(url.searchParams.get('vnp_Bill_Mobile')).toBe('0987654321');
    });

    it('should truncate description to 255 characters', async () => {
      const longDescription = 'A'.repeat(300);
      const request = {
        orderId: 'order-123',
        orderNumber: 'ORD-123456',
        amount: 100000,
        description: longDescription,
        returnUrl: 'http://localhost:3000/callback',
        cancelUrl: 'http://localhost:3000/cancel',
      };

      const result = await paymentService.createVNPayPayment(request);

      const url = new URL(result.paymentUrl);
      const orderInfo = url.searchParams.get('vnp_OrderInfo');
      
      expect(orderInfo).toBeDefined();
      expect(orderInfo!.length).toBeLessThanOrEqual(255);
    });

    it('should generate unique transaction IDs', async () => {
      const request = {
        orderId: 'order-123',
        orderNumber: 'ORD-123456',
        amount: 100000,
        description: 'Test payment',
        returnUrl: 'http://localhost:3000/callback',
        cancelUrl: 'http://localhost:3000/cancel',
      };

      const result1 = await paymentService.createVNPayPayment(request);
      
      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));
      
      const result2 = await paymentService.createVNPayPayment(request);

      expect(result1.transactionId).not.toBe(result2.transactionId);
    });
  });

  describe('verifyVNPayCallback', () => {
    it('should verify valid callback with correct secure hash', () => {
      const params: Record<string, string> = {
        vnp_Amount: '10000000',
        vnp_BankCode: 'NCB',
        vnp_CardType: 'ATM',
        vnp_OrderInfo: 'Test payment',
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

      const result = paymentService.verifyVNPayCallback(params);

      expect(result).not.toBeNull();
      expect(result?.status).toBe('success');
      expect(result?.transactionId).toBe('12345678');
    });

    it('should return null for callback without secure hash', () => {
      const params: Record<string, string> = {
        vnp_Amount: '10000000',
        vnp_ResponseCode: '00',
      };

      const result = paymentService.verifyVNPayCallback(params);

      expect(result).toBeNull();
    });

    it('should return null for callback with invalid secure hash', () => {
      const params: Record<string, string> = {
        vnp_Amount: '10000000',
        vnp_ResponseCode: '00',
        vnp_SecureHash: 'invalid_hash',
      };

      const result = paymentService.verifyVNPayCallback(params);

      expect(result).toBeNull();
    });

    it('should handle failed payment response', () => {
      const params: Record<string, string> = {
        vnp_Amount: '10000000',
        vnp_ResponseCode: '07', // Failed response code
        vnp_TxnRef: 'order-123',
        vnp_TransactionNo: '12345678',
      };

      // Create hash for failed payment
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

      const result = paymentService.verifyVNPayCallback(params);

      expect(result).not.toBeNull();
      expect(result?.status).toBe('failed');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T14:30:00');
      const formatted = (paymentService as any).formatDate(date);
      
      expect(formatted).toBe('20240115143000');
      expect(formatted.length).toBe(14); // YYYYMMDDHHmmss
    });
  });

  describe('sortObject', () => {
    it('should sort object keys alphabetically', () => {
      const obj = {
        zebra: 'z',
        apple: 'a',
        banana: 'b',
      };
      
      const sorted = (paymentService as any).sortObject(obj);
      const keys = Object.keys(sorted);
      
      expect(keys).toEqual(['apple', 'banana', 'zebra']);
    });
  });

  describe('createSecureHash', () => {
    it('should create valid SHA512 hash', () => {
      const queryString = 'vnp_Amount=10000000&vnp_ResponseCode=00';
      const hash = (paymentService as any).createSecureHash(queryString);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(128); // SHA512 produces 128 char hex string
    });
  });
});

