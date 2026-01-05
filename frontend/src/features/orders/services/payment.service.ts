import apiClient from '@lib/api.service';

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
    return apiClient.post<CreatePaymentResponse>('/payment/create', data);
  },
};

export default paymentService;

