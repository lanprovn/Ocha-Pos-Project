import apiClient from './api.service';

export interface QRPaymentResponse {
  qrUrl: string; // URL để generate QR code (backup)
  qrImageUrl?: string; // URL image từ VietQR API (QR code thật - dùng chính)
  qrData: {
    bankCode: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    description: string;
    orderNumber: string;
  };
  orderId: string;
  orderNumber: string;
  totalAmount: number;
}

export interface VerifyPaymentRequest {
  orderId: string;
}

export const qrService = {
  async generateQR(orderId: string): Promise<QRPaymentResponse> {
    return apiClient.post<QRPaymentResponse>('/payment/qr/generate', { orderId });
  },

  async verifyPayment(orderId: string): Promise<{ message: string; order: any }> {
    return apiClient.post<{ message: string; order: any }>('/payment/qr/verify', { orderId });
  },
};

export default qrService;

