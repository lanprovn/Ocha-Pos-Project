import { Router } from 'express';
import paymentController from '@api/controllers/payment.controller';
import qrController from '@api/controllers/qr.controller';
import { authenticate } from '@api/middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/payment/create:
 *   post:
 *     summary: Create payment
 *     description: Create a payment request for an order using payment gateway (VNPay, MoMo, etc.)
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, amount]
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *                 description: Order ID
 *               amount:
 *                 type: number
 *                 description: Payment amount
 *               paymentMethod:
 *                 type: string
 *                 enum: [VNPAY, MOMO]
 *                 description: Payment gateway
 *     responses:
 *       200:
 *         description: Payment URL created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentUrl:
 *                   type: string
 *                   format: uri
 *                   description: Payment gateway URL
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/create', paymentController.createPayment.bind(paymentController));

/**
 * @swagger
 * /api/payment/callback:
 *   get:
 *     summary: Payment callback
 *     description: Handle payment callback from payment gateway
 *     tags: [Payment]
 *     parameters:
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *         description: Response code from payment gateway
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *         description: Transaction reference (order number)
 *     responses:
 *       200:
 *         description: Payment callback processed
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML redirect page
 *       400:
 *         description: Invalid callback data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/callback', paymentController.handleCallback.bind(paymentController));

/**
 * @swagger
 * /api/payment/qr/generate:
 *   post:
 *     summary: Generate QR code for bank transfer
 *     description: Generate QR code for bank transfer payment
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, amount]
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *                 description: Order ID
 *               amount:
 *                 type: number
 *                 description: Payment amount
 *     responses:
 *       200:
 *         description: QR code generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 qrCode:
 *                   type: string
 *                   description: QR code data URL or base64
 *                 qrImage:
 *                   type: string
 *                   format: uri
 *                   description: QR code image URL
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/qr/generate', qrController.generateQR.bind(qrController));

/**
 * @swagger
 * /api/payment/qr/verify:
 *   post:
 *     summary: Verify QR payment
 *     description: Verify and complete QR code bank transfer payment (requires authentication)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *                 description: Order ID
 *     responses:
 *       200:
 *         description: Payment verified and order completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/qr/verify', authenticate, qrController.verifyPayment.bind(qrController));

export default router;
