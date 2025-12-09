import { Request, Response } from 'express';
import paymentService from '../services/payment.service';
import orderService from '../services/order.service';
import { z } from 'zod';
import logger from '../utils/logger';
import { PaymentStatus, OrderStatus } from '@ocha-pos/shared-types';

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
      const order = await orderService.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Kiểm tra nếu đã thanh toán
      if (order.paymentStatus === 'SUCCESS') {
        return res.status(400).json({ error: 'Order already paid' });
      }

      // Tạo payment request
      const paymentRequest = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: Number(order.totalAmount),
        description: `Thanh toán đơn hàng ${order.orderNumber}`,
        customerName: order.customerName || undefined,
        customerPhone: order.customerPhone || undefined,
        returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback?success=true`,
        cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback?success=false`,
      };

      let paymentResponse;
      switch (paymentMethod) {
        case 'VNPAY':
          paymentResponse = await paymentService.createVNPayPayment(paymentRequest);
          break;
        case 'MOMO':
          return res.status(501).json({ error: 'MoMo payment not implemented yet' });
        case 'ZALOPAY':
          return res.status(501).json({ error: 'ZaloPay payment not implemented yet' });
        default:
          return res.status(400).json({ error: 'Invalid payment method' });
      }

      // Kiểm tra paymentResponse đã được tạo
      if (!paymentResponse) {
        return res.status(500).json({ error: 'Failed to create payment response' });
      }

      // Cập nhật order với transaction ID
      await orderService.update(orderId, {
        paymentTransactionId: paymentResponse.transactionId,
        paymentStatus: PaymentStatus.PENDING,
      });

      return res.json(paymentResponse);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        logger.error('Payment creation error', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          orderId: req.body?.orderId,
          paymentMethod: req.body?.paymentMethod,
        });
        return res.status(500).json({ error: error.message || 'Failed to create payment' });
      }
    }
  }

  /**
   * Xử lý callback từ payment gateway
   */
  async handleCallback(req: Request, res: Response) {
    try {
      const { paymentMethod = 'VNPAY' } = req.query;
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
        // Invalid signature - redirect về checkout với error
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/checkout?error=payment_verification_failed`);
      }

      // Tìm order bằng orderNumber (từ callback.orderId)
      const order = await orderService.getByOrderNumber(callback.orderId);

      if (!order) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/checkout?error=order_not_found`);
      }

      // Cập nhật order status
      await orderService.update(order.id, {
        paymentStatus: callback.status === 'success' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
        paymentTransactionId: callback.transactionId,
        paymentDate: callback.transactionDate ? new Date(callback.transactionDate) : new Date(),
      });

      // Nếu thanh toán thành công, cập nhật order status thành COMPLETED
      if (callback.status === 'success') {
        await orderService.updateStatus(order.id, { status: OrderStatus.COMPLETED });
      }

      // Redirect về frontend
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = callback.status === 'success'
        ? `${frontendUrl}/order-success?orderId=${order.id}`
        : `${frontendUrl}/checkout?error=payment_failed&orderId=${order.id}`;

      res.redirect(redirectUrl);
    } catch (error: any) {
      logger.error('Payment callback error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        paymentMethod: req.query.paymentMethod,
        queryParams: req.query,
      });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/checkout?error=payment_callback_error`);
    }
  }
}

export default new PaymentController();

