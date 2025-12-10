import crypto from 'crypto';

export interface PaymentRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  description: string;
  customerName?: string;
  customerPhone?: string;
  returnUrl: string;
  cancelUrl: string;
  clientIp?: string;
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
  };

  /**
   * Tạo payment URL cho VNPay
   */
  async createVNPayPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const date = new Date();
    const createDate = this.formatDate(date);
    const expireDate = this.formatDate(new Date(date.getTime() + 15 * 60 * 1000)); // 15 phút

    const orderId = `${date.getTime()}`;
    const amount = Math.round(request.amount * 100); // VNPay yêu cầu amount tính bằng xu

    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnpayConfig.tmnCode,
      vnp_Amount: amount.toString(),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: request.description.substring(0, 255), // Max 255 chars
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: request.returnUrl, // Use returnUrl from request instead of config
      vnp_IpAddr: request.clientIp || '127.0.0.1', // Use client IP from request
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    // Thêm thông tin khách hàng nếu có
    if (request.customerName) {
      params.vnp_Bill_FirstName = request.customerName.substring(0, 50);
    }
    if (request.customerPhone) {
      params.vnp_Bill_Mobile = request.customerPhone.substring(0, 20);
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
    if (!secureHash) {
      return null;
    }

    // Tạo bản sao params và loại bỏ secure hash
    const paramsCopy: Record<string, string> = { ...params };
    delete paramsCopy['vnp_SecureHash'];
    delete paramsCopy['vnp_SecureHashType'];

    const sortedParams = this.sortObject(paramsCopy);
    const queryString = this.createQueryString(sortedParams);
    const checkSum = this.createSecureHash(queryString);

    if (secureHash !== checkSum) {
      return null; // Invalid signature
    }

    const responseCode = params['vnp_ResponseCode'];
    const status = responseCode === '00' ? 'success' : 'failed';

    // Extract order info from vnp_OrderInfo (format: "Thanh toán đơn hàng ORD-xxx")
    const orderInfo = params['vnp_OrderInfo'] || '';
    const orderNumberMatch = orderInfo.match(/ORD-[A-Z0-9-]+/);
    const orderId = orderNumberMatch ? orderNumberMatch[0] : params['vnp_TxnRef'];

    return {
      transactionId: params['vnp_TxnRef'],
      orderId: orderId,
      amount: parseInt(params['vnp_Amount']) / 100,
      status,
      paymentMethod: 'VNPay',
      transactionDate: params['vnp_PayDate'] || params['vnp_CreateDate'],
    };
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

