# 💳 Hướng Dẫn Tích Hợp Payment Gateway Thật

## 📋 Tổng Quan

Hiện tại hệ thống chỉ lưu payment method như một string đơn giản. Để tích hợp payment gateway thật (VNPay, MoMo, ZaloPay), cần:

1. **Backend:** Tạo payment service để xử lý payment gateway
2. **Frontend:** Redirect đến payment gateway khi chọn 'card' hoặc 'qr'
3. **Callback:** Xử lý kết quả thanh toán từ payment gateway
4. **Update Order:** Cập nhật payment status dựa trên kết quả

---

## 🎯 Các Payment Gateway Phổ Biến ở Việt Nam

### 1. VNPay (Khuyên dùng)
- **Website:** https://www.vnpay.vn/
- **Tài liệu:** https://sandbox.vnpayment.vn/apis/
- **Phí:** ~1.5-2% mỗi giao dịch
- **Hỗ trợ:** Thẻ ngân hàng, QR code, Ví điện tử

### 2. MoMo
- **Website:** https://developers.momo.vn/
- **Tài liệu:** https://developers.momo.vn/v3/docs/
- **Phí:** ~1.5-2% mỗi giao dịch
- **Hỗ trợ:** Ví MoMo, QR code

### 3. ZaloPay
- **Website:** https://developers.zalopay.vn/
- **Tài liệu:** https://developers.zalopay.vn/docs/
- **Phí:** ~1.5-2% mỗi giao dịch
- **Hỗ trợ:** Ví ZaloPay, QR code

### 4. Stripe (Quốc tế)
- **Website:** https://stripe.com/
- **Tài liệu:** https://stripe.com/docs
- **Phí:** ~2.9% + $0.30 mỗi giao dịch
- **Hỗ trợ:** Thẻ quốc tế, Apple Pay, Google Pay

---

## 🚀 Implementation Plan

### Phase 1: Backend - Payment Service

#### 1.1 Cài đặt dependencies

```bash
cd backend
npm install crypto axios
npm install --save-dev @types/crypto
```

#### 1.2 Tạo Payment Service

**File:** `backend/src/services/payment.service.ts`

```typescript
import crypto from 'crypto';
import axios from 'axios';

export interface PaymentRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  description: string;
  customerName?: string;
  customerPhone?: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PaymentResponse {
  paymentUrl: string;
  transactionId: string;
}

export interface PaymentCallback {
  transactionId: string;
  orderId: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  paymentMethod: string;
  transactionDate: string;
}

export class PaymentService {
  private vnpayConfig = {
    tmnCode: process.env.VNPAY_TMN_CODE || '',
    secretKey: process.env.VNPAY_SECRET_KEY || '',
    url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment/callback',
  };

  /**
   * Tạo payment URL cho VNPay
   */
  async createVNPayPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const date = new Date();
    const createDate = this.formatDate(date);
    const expireDate = this.formatDate(new Date(date.getTime() + 15 * 60 * 1000)); // 15 phút

    const orderId = `${date.getTime()}`;
    const amount = request.amount * 100; // VNPay yêu cầu amount tính bằng xu

    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnpayConfig.tmnCode,
      vnp_Amount: amount.toString(),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: request.description,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: this.vnpayConfig.returnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    // Thêm thông tin khách hàng nếu có
    if (request.customerName) {
      params.vnp_Bill_FirstName = request.customerName;
    }
    if (request.customerPhone) {
      params.vnp_Bill_Mobile = request.customerPhone;
    }

    // Sắp xếp params và tạo query string
    const sortedParams = this.sortObject(params);
    const queryString = this.createQueryString(sortedParams);
    
    // Tạo secure hash
    const secureHash = this.createSecureHash(queryString);
    const paymentUrl = `${this.vnpayConfig.url}?${queryString}&vnp_SecureHash=${secureHash}`;

    return {
      paymentUrl,
      transactionId: orderId,
    };
  }

  /**
   * Xác thực callback từ VNPay
   */
  verifyVNPayCallback(params: Record<string, string>): PaymentCallback | null {
    const secureHash = params['vnp_SecureHash'];
    delete params['vnp_SecureHash'];
    delete params['vnp_SecureHashType'];

    const sortedParams = this.sortObject(params);
    const queryString = this.createQueryString(sortedParams);
    const checkSum = this.createSecureHash(queryString);

    if (secureHash !== checkSum) {
      return null; // Invalid signature
    }

    const responseCode = params['vnp_ResponseCode'];
    const status = responseCode === '00' ? 'success' : 'failed';

    return {
      transactionId: params['vnp_TxnRef'],
      orderId: params['vnp_OrderInfo'],
      amount: parseInt(params['vnp_Amount']) / 100,
      status,
      paymentMethod: 'VNPay',
      transactionDate: params['vnp_PayDate'],
    };
  }

  /**
   * Tạo MoMo payment (ví dụ)
   */
  async createMoMoPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Implementation tương tự VNPay
    // Xem tài liệu: https://developers.momo.vn/v3/docs/
    throw new Error('MoMo payment not implemented yet');
  }

  /**
   * Tạo ZaloPay payment (ví dụ)
   */
  async createZaloPayPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Implementation tương tự VNPay
    // Xem tài liệu: https://developers.zalopay.vn/docs/
    throw new Error('ZaloPay payment not implemented yet');
  }

  // Helper methods
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
      sorted[key] = obj[key];
    });
    return sorted;
  }

  private createQueryString(params: Record<string, string>): string {
    return Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  }

  private createSecureHash(queryString: string): string {
    return crypto
      .createHmac('sha512', this.vnpayConfig.secretKey)
      .update(queryString)
      .digest('hex');
  }
}

export default new PaymentService();
```

#### 1.3 Tạo Payment Controller

**File:** `backend/src/controllers/payment.controller.ts`

```typescript
import { Request, Response } from 'express';
import paymentService from '../services/payment.service';
import orderService from '../services/order.service';
import { z } from 'zod';

const createPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().uuid(),
    paymentMethod: z.enum(['VNPAY', 'MOMO', 'ZALOPAY']),
  }),
});

export class PaymentController {
  /**
   * Tạo payment URL
   */
  async createPayment(req: Request, res: Response) {
    try {
      const validated = createPaymentSchema.parse({ body: req.body });
      const { orderId, paymentMethod } = validated.body;

      // Lấy thông tin đơn hàng
      const order = await orderService.getById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Tạo payment request
      const paymentRequest = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        description: `Thanh toán đơn hàng ${order.orderNumber}`,
        customerName: order.customerName || undefined,
        customerPhone: order.customerPhone || undefined,
        returnUrl: `${process.env.FRONTEND_URL}/payment/callback?success=true`,
        cancelUrl: `${process.env.FRONTEND_URL}/payment/callback?success=false`,
      };

      let paymentResponse;
      switch (paymentMethod) {
        case 'VNPAY':
          paymentResponse = await paymentService.createVNPayPayment(paymentRequest);
          break;
        case 'MOMO':
          paymentResponse = await paymentService.createMoMoPayment(paymentRequest);
          break;
        case 'ZALOPAY':
          paymentResponse = await paymentService.createZaloPayPayment(paymentRequest);
          break;
        default:
          return res.status(400).json({ error: 'Invalid payment method' });
      }

      // Cập nhật order với transaction ID
      await orderService.update(orderId, {
        paymentTransactionId: paymentResponse.transactionId,
        paymentStatus: 'PENDING',
      });

      res.json(paymentResponse);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  /**
   * Xử lý callback từ payment gateway
   */
  async handleCallback(req: Request, res: Response) {
    try {
      const { paymentMethod } = req.query;
      const params = req.query as Record<string, string>;

      let callback;
      switch (paymentMethod) {
        case 'VNPAY':
          callback = paymentService.verifyVNPayCallback(params);
          break;
        default:
          return res.status(400).json({ error: 'Invalid payment method' });
      }

      if (!callback) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }

      // Cập nhật order status
      const order = await orderService.getById(callback.orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      await orderService.update(order.id, {
        paymentStatus: callback.status === 'success' ? 'SUCCESS' : 'FAILED',
        paymentTransactionId: callback.transactionId,
        paymentDate: new Date(callback.transactionDate),
      });

      // Redirect về frontend
      const redirectUrl = callback.status === 'success'
        ? `${process.env.FRONTEND_URL}/order-success?orderId=${order.id}`
        : `${process.env.FRONTEND_URL}/checkout?error=payment_failed`;

      res.redirect(redirectUrl);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new PaymentController();
```

#### 1.4 Tạo Payment Routes

**File:** `backend/src/routes/payment.routes.ts`

```typescript
import { Router } from 'express';
import paymentController from '../controllers/payment.controller';

const router = Router();

router.post('/create', paymentController.createPayment.bind(paymentController));
router.get('/callback', paymentController.handleCallback.bind(paymentController));

export default router;
```

#### 1.5 Thêm vào app.ts

```typescript
import paymentRoutes from './routes/payment.routes';

// ...
app.use('/api/payment', paymentRoutes);
```

---

### Phase 2: Frontend - Payment Integration

#### 2.1 Tạo Payment Service

**File:** `frontend/src/services/payment.service.ts`

```typescript
import apiClient from './api.service';

export interface CreatePaymentRequest {
  orderId: string;
  paymentMethod: 'VNPAY' | 'MOMO' | 'ZALOPAY';
}

export interface CreatePaymentResponse {
  paymentUrl: string;
  transactionId: string;
}

export const paymentService = {
  async createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    return apiClient.post<CreatePaymentResponse>('/api/payment/create', data);
  },
};

export default paymentService;
```

#### 2.2 Cập nhật useCheckout Hook

**File:** `frontend/src/pages/CheckoutPage/hooks/useCheckout.ts`

```typescript
// Thêm vào imports
import paymentService from '@services/payment.service';

// Cập nhật handleCompleteOrder
const handleCompleteOrder = async (): Promise<void> => {
  // ... validation code ...

  try {
    // Tạo order trước
    const orderData = await orderService.create({
      // ... order data ...
      paymentMethod: paymentMethod.toUpperCase() as 'CASH' | 'CARD' | 'QR',
      paymentStatus: paymentMethod === 'cash' ? 'SUCCESS' : 'PENDING', // Cash = success ngay, card/qr = pending
      // ...
    });

    // Nếu là card hoặc qr, tạo payment URL
    if (paymentMethod === 'card' || paymentMethod === 'qr') {
      const paymentResponse = await paymentService.createPayment({
        orderId: orderData.id,
        paymentMethod: paymentMethod === 'card' ? 'VNPAY' : 'VNPAY', // Có thể map khác nhau
      });

      // Redirect đến payment gateway
      window.location.href = paymentResponse.paymentUrl;
      return; // Không clear cart hay navigate ở đây, sẽ làm ở callback
    }

    // Nếu là cash, xử lý như bình thường
    // ... existing success handling ...
  } catch (error) {
    // ... error handling ...
  }
};
```

#### 2.3 Tạo Payment Callback Page

**File:** `frontend/src/pages/PaymentCallbackPage/index.tsx`

```typescript
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@constants';

const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const success = searchParams.get('success') === 'true';
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (success && orderId) {
      // Redirect đến order success page
      setTimeout(() => {
        navigate(ROUTES.ORDER_SUCCESS, {
          state: { orderId },
        });
      }, 2000);
    } else {
      // Redirect về checkout với error
      setTimeout(() => {
        navigate(ROUTES.CHECKOUT, {
          state: { error: 'payment_failed' },
        });
      }, 2000);
    }
  }, [success, orderId, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {success ? (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-600">Đang chuyển hướng...</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Thanh toán thất bại
            </h2>
            <p className="text-gray-600">Đang chuyển về trang thanh toán...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackPage;
```

#### 2.4 Cập nhật PaymentMethodSelector

**File:** `frontend/src/pages/CheckoutPage/components/PaymentMethodSelector.tsx`

```typescript
// Có thể thêm logo hoặc mô tả chi tiết hơn
const paymentMethods: Array<{ 
  key: PaymentMethod; 
  icon: string;
  description: string;
  gateway?: string;
}> = [
  { key: 'cash', icon: '💵', description: 'Tiền mặt', gateway: undefined },
  { key: 'card', icon: '💳', description: 'Thẻ ngân hàng', gateway: 'VNPay' },
  { key: 'qr', icon: '📱', description: 'Quét mã QR', gateway: 'VNPay/MoMo' },
];
```

---

## 🔧 Environment Variables

Thêm vào `backend/.env`:

```env
# VNPay Configuration
VNPAY_TMN_CODE=your_tmn_code
VNPAY_SECRET_KEY=your_secret_key
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/callback

# MoMo Configuration (nếu dùng)
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key

# ZaloPay Configuration (nếu dùng)
ZALOPAY_APP_ID=your_app_id
ZALOPAY_KEY1=your_key1
ZALOPAY_KEY2=your_key2
```

---

## 📝 Database Schema Updates

Cần thêm các fields vào Order model:

```prisma
model Order {
  // ... existing fields ...
  paymentTransactionId String?  // ID từ payment gateway
  paymentDate          DateTime? // Ngày thanh toán
  // ... existing fields ...
}
```

Chạy migration:
```bash
npx prisma migrate dev --name add_payment_fields
```

---

## 🧪 Testing

### Test với VNPay Sandbox:

1. Đăng ký tài khoản tại: https://sandbox.vnpayment.vn/
2. Lấy TMN Code và Secret Key
3. Cập nhật `.env`
4. Test flow:
   - Tạo order
   - Chọn payment method = 'card' hoặc 'qr'
   - Redirect đến VNPay sandbox
   - Test thanh toán thành công/thất bại
   - Verify callback

---

## 🚀 Production Checklist

- [ ] Đăng ký tài khoản production với payment gateway
- [ ] Cập nhật environment variables với production keys
- [ ] Cập nhật return URLs cho production domain
- [ ] Test toàn bộ payment flow
- [ ] Setup monitoring cho payment transactions
- [ ] Implement retry logic cho failed payments
- [ ] Setup webhook để nhận payment notifications
- [ ] Implement payment reconciliation

---

## 📚 Tài Liệu Tham Khảo

- **VNPay:** https://sandbox.vnpayment.vn/apis/
- **MoMo:** https://developers.momo.vn/v3/docs/
- **ZaloPay:** https://developers.zalopay.vn/docs/
- **Stripe:** https://stripe.com/docs

---

**Last Updated:** 2024-01-01

