import { Request, Response } from 'express';
import paymentService from '../services/payment.service';
import orderService from '../services/order.service';
import { z } from 'zod';
import { BaseController } from './base.controller';
import { AppError } from '../utils/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES, PAYMENT_STATUS } from '../constants';
import { ValidationSchemas, validateOrThrow } from '../utils/validation';
import env from '../config/env';

const createPaymentSchema = z.object({
  orderId: ValidationSchemas.uuid,
  paymentMethod: z.enum(['VNPAY', 'MOMO', 'ZALOPAY']),
});

const callbackQuerySchema = z.object({
  paymentMethod: z.enum(['VNPAY', 'MOMO', 'ZALOPAY']).optional().default('VNPAY'),
});

export class PaymentController extends BaseController {
  /**
   * Tạo payment URL
   */
  createPayment = this.asyncHandler(async (req: Request, res: Response) => {
    const validated = validateOrThrow(createPaymentSchema, req.body);
    const { orderId, paymentMethod } = validated;

    // Lấy thông tin đơn hàng
    const order = await orderService.findById(orderId);
    if (!order) {
      throw new AppError(ERROR_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Kiểm tra nếu đã thanh toán
    if (order.paymentStatus === PAYMENT_STATUS.SUCCESS) {
      throw new AppError('Đơn hàng đã được thanh toán.', HTTP_STATUS.BAD_REQUEST);
    }

    // Tạo payment request
    const paymentRequest = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: Number(order.totalAmount),
      description: `Thanh toán đơn hàng ${order.orderNumber}`,
      customerName: order.customerName || undefined,
      customerPhone: order.customerPhone || undefined,
      returnUrl: `${env.FRONTEND_URL}/payment/callback?success=true`,
      cancelUrl: `${env.FRONTEND_URL}/payment/callback?success=false`,
    };

    let paymentResponse;
    switch (paymentMethod) {
      case 'VNPAY':
        paymentResponse = await paymentService.createVNPayPayment(paymentRequest);
        break;
      case 'MOMO':
        throw new AppError('Thanh toán MoMo chưa được hỗ trợ.', HTTP_STATUS.NOT_IMPLEMENTED);
      case 'ZALOPAY':
        throw new AppError('Thanh toán ZaloPay chưa được hỗ trợ.', HTTP_STATUS.NOT_IMPLEMENTED);
      default:
        throw new AppError('Phương thức thanh toán không hợp lệ.', HTTP_STATUS.BAD_REQUEST);
    }

    // Kiểm tra paymentResponse đã được tạo
    if (!paymentResponse) {
      throw new AppError(ERROR_MESSAGES.PAYMENT_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    // Cập nhật order với transaction ID
    await orderService.update(orderId, {
      paymentTransactionId: paymentResponse.transactionId,
      paymentStatus: PAYMENT_STATUS.PENDING,
    });

    this.created(res, paymentResponse, 'Tạo yêu cầu thanh toán thành công.');
  });

  /**
   * Xử lý callback từ payment gateway
   */
  handleCallback = this.asyncHandler(async (req: Request, res: Response) => {
    const query = validateOrThrow(callbackQuerySchema, req.query);
    const params = req.query as Record<string, string>;

    let callback;
    switch (query.paymentMethod) {
      case 'VNPAY':
        callback = paymentService.verifyVNPayCallback(params);
        break;
      default:
        throw new AppError('Phương thức thanh toán không hợp lệ.', HTTP_STATUS.BAD_REQUEST);
    }

    if (!callback) {
      // Invalid signature - redirect về checkout với error
      return res.redirect(`${env.FRONTEND_URL}/checkout?error=payment_verification_failed`);
    }

    // Tìm order bằng orderNumber (từ callback.orderId)
    const order = await orderService.getByOrderNumber(callback.orderId);

    if (!order) {
      return res.redirect(`${env.FRONTEND_URL}/checkout?error=order_not_found`);
    }

    // PRODUCTION READY: Use atomic updateStatusWithPayment to prevent race conditions
    // This ensures payment status and order status are updated together in a transaction
    if (callback.status === 'success') {
      await orderService.updateStatusWithPayment(
        order.id,
        'COMPLETED',
        {
          paymentStatus: PAYMENT_STATUS.SUCCESS,
          paymentTransactionId: callback.transactionId,
          paymentDate: callback.transactionDate ? new Date(callback.transactionDate) : new Date(),
        }
      );
    } else {
      // Payment failed - only update payment status, keep order status as PENDING
      await orderService.update(order.id, {
        paymentStatus: PAYMENT_STATUS.FAILED,
        paymentTransactionId: callback.transactionId,
        paymentDate: callback.transactionDate ? new Date(callback.transactionDate) : new Date(),
      });
    }

    // Redirect về frontend
    const redirectUrl = callback.status === 'success'
      ? `${env.FRONTEND_URL}/order-success?orderId=${order.id}`
      : `${env.FRONTEND_URL}/checkout?error=payment_failed&orderId=${order.id}`;

    res.redirect(redirectUrl);
  });
}

export default new PaymentController();

