import { Request, Response } from 'express';
import qrService from '../services/qr.service';
import orderService from '../services/order.service';
import { z } from 'zod';
import logger from '../utils/logger';
import { PaymentStatus, OrderStatus } from '@ocha-pos/shared-types';

const generateQRSchema = z.object({
  body: z.object({
    orderId: z.string().uuid(),
  }),
});

export class QRController {
  /**
   * Tạo QR code cho đơn hàng
   */
  async generateQR(req: Request, res: Response): Promise<Response | void> {
    try {
      const validated = generateQRSchema.parse({ body: req.body });
      const { orderId } = validated.body;

      // Lấy thông tin đơn hàng
      const order = await orderService.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Kiểm tra nếu đã thanh toán
      if (order.paymentStatus === 'SUCCESS') {
        return res.status(400).json({ error: 'Order already paid' });
      }

      // Lấy thông tin ngân hàng từ environment variables
      const bankConfig = {
        bankCode: (process.env.BANK_CODE || 'VCB').toUpperCase(), // Ví dụ: VCB (Vietcombank), TCB (Techcombank), VPB (VPBank)
        accountNumber: process.env.BANK_ACCOUNT_NUMBER || '',
        accountName: process.env.BANK_ACCOUNT_NAME || 'OCHA POS',
      };

      if (!bankConfig.accountNumber) {
        return res.status(500).json({ error: 'Bank account not configured' });
      }

      // Tạo QR data
      const qrData = qrService.generateQRFromOrder(
        order.orderNumber,
        Number(order.totalAmount),
        bankConfig
      );

      // Generate VietQR Image URL từ API VietQR (QR code thật)
      // Sử dụng template từ env hoặc mặc định 'print'
      const qrTemplate = (process.env.QR_TEMPLATE as 'print' | 'compact2' | 'compact' | 'qr_only') || 'print';
      const qrImageUrl = qrService.generateVietQRImage(qrData, qrTemplate);
      
      // Generate VietQR URL (backup - để hiển thị thông tin)
      const qrUrl = qrService.generateVietQR(qrData);

      return res.json({
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
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        logger.error('QR generation error', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          orderId: req.body?.orderId,
        });
        return res.status(500).json({ error: error.message || 'Failed to generate QR code' });
      }
    }
  }

  /**
   * Verify payment (manual confirmation hoặc webhook từ ngân hàng)
   * Trong thực tế, ngân hàng sẽ gửi webhook khi có chuyển khoản
   * Ở đây tạo endpoint để admin/staff có thể confirm thủ công
   */
  async verifyPayment(req: Request, res: Response): Promise<Response | void> {
    try {
      const { orderId } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      const order = await orderService.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Cập nhật payment status
      await orderService.update(orderId, {
        paymentStatus: PaymentStatus.SUCCESS,
        paymentDate: new Date(),
      });

      // Cập nhật order status thành COMPLETED sau khi thanh toán thành công
      await orderService.updateStatus(orderId, { status: OrderStatus.COMPLETED });

      const updatedOrder = await orderService.findById(orderId);
      return res.json({
        message: 'Payment verified successfully',
        order: updatedOrder,
      });
    } catch (error: any) {
      logger.error('Payment verification error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        orderId: req.body?.orderId,
      });
      return res.status(500).json({ error: error.message || 'Failed to verify payment' });
    }
  }
}

export default new QRController();

