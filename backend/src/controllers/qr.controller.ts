import { Request, Response } from 'express';
import qrService from '../services/qr.service';
import orderService from '../services/order.service';
import { z } from 'zod';
import { BaseController } from './base.controller';
import { AppError } from '../utils/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES, PAYMENT_STATUS } from '../constants';
import { ValidationSchemas, validateOrThrow } from '../utils/validation';
import env from '../config/env';

const generateQRSchema = z.object({
  orderId: ValidationSchemas.uuid,
});

const verifyPaymentSchema = z.object({
  orderId: ValidationSchemas.uuid,
});

export class QRController extends BaseController {
  /**
   * Tạo QR code cho đơn hàng
   */
  generateQR = this.asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = validateOrThrow(generateQRSchema, req.body);

    // Lấy thông tin đơn hàng
    const order = await orderService.findById(orderId);
    if (!order) {
      throw new AppError(ERROR_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Kiểm tra nếu đã thanh toán
    if (order.paymentStatus === PAYMENT_STATUS.SUCCESS) {
      throw new AppError('Đơn hàng đã được thanh toán.', HTTP_STATUS.BAD_REQUEST);
    }

    // Lấy thông tin ngân hàng từ environment variables
    const bankConfig = {
      bankCode: (env.BANK_CODE || 'VCB').toUpperCase(), // Ví dụ: VCB (Vietcombank), TCB (Techcombank), VPB (VPBank)
      accountNumber: env.BANK_ACCOUNT_NUMBER || '',
      accountName: env.BANK_ACCOUNT_NAME || 'OCHA POS',
    };

    if (!bankConfig.accountNumber) {
      throw new AppError('Chưa cấu hình thông tin tài khoản ngân hàng.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    // Tạo QR data
    const qrData = qrService.generateQRFromOrder(
      order.orderNumber,
      Number(order.totalAmount),
      bankConfig
    );

    // Generate VietQR Image URL từ API VietQR (QR code thật)
    // Sử dụng template từ env hoặc mặc định 'print'
    const qrTemplate = (env.QR_TEMPLATE as 'print' | 'compact2' | 'compact' | 'qr_only') || 'print';
    const qrImageUrl = qrService.generateVietQRImage(qrData, qrTemplate);
    
    // Generate VietQR URL (backup - để hiển thị thông tin)
    const qrUrl = qrService.generateVietQR(qrData);

    this.success(res, {
      qrUrl, // URL để generate QR code (backup)
      qrImageUrl, // URL image từ VietQR API (QR code thật - dùng chính)
      qrData: {
        bankCode: qrData.bankCode,
        accountNumber: qrData.accountNumber,
        accountName: qrData.accountName,
        amount: qrData.amount,
        description: qrData.description,
        orderNumber: order.orderNumber,
      },
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: Number(order.totalAmount),
    });
  });

  /**
   * Verify payment (manual confirmation hoặc webhook từ ngân hàng)
   * Trong thực tế, ngân hàng sẽ gửi webhook khi có chuyển khoản
   * Ở đây tạo endpoint để admin/staff có thể confirm thủ công
   */
  verifyPayment = this.asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = validateOrThrow(verifyPaymentSchema, req.body);

    const order = await orderService.findById(orderId);
    if (!order) {
      throw new AppError(ERROR_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // PRODUCTION READY: Use atomic updateStatusWithPayment to prevent race conditions
    await orderService.updateStatusWithPayment(
      orderId,
      'COMPLETED',
      {
        paymentStatus: PAYMENT_STATUS.SUCCESS,
        paymentDate: new Date(),
      }
    );

    const updatedOrder = await orderService.findById(orderId);
    this.success(res, { order: updatedOrder }, SUCCESS_MESSAGES.PAYMENT_SUCCESS);
  });
}

export default new QRController();

