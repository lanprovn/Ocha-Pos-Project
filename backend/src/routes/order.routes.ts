import { Router } from 'express';
import orderController from '../controllers/order.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/orders/draft:
 *   post:
 *     summary: Create or update draft order
 *     description: Create or update a draft order (cart) for real-time order creation
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       200:
 *         description: Draft order created or updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.post('/draft', orderController.createOrUpdateDraft.bind(orderController));

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create new order
 *     description: Create a new order with items
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *   get:
 *     summary: Get all orders
 *     description: Get all orders with optional filters
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [CREATING, PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED]
 *         description: Filter by order status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders from this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders until this date (YYYY-MM-DD)
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [CASH, QR]
 *         description: Filter by payment method
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [PENDING, SUCCESS, FAILED]
 *         description: Filter by payment status
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.post('/', orderController.create.bind(orderController));
router.get('/', orderController.getAll.bind(orderController));

/**
 * @swagger
 * /api/orders/today:
 *   get:
 *     summary: Get today's orders
 *     description: Get all orders created today, including draft orders from the last hour
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of today's orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
// Note: /today and /date/:date moved to /queries/today and /queries/date/:date

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Get a specific order by its UUID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order UUID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', orderController.getById.bind(orderController));

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     description: Update the status of an order (requires ADMIN or STAFF role)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatusRequest'
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/status', authenticate, requireRole('ADMIN', 'STAFF'), orderController.updateStatus.bind(orderController));

// Order Queries - moved to sub-resource
/**
 * @swagger
 * /api/orders/queries/today:
 *   get:
 *     summary: Get today's orders
 *     description: Get all orders created today, including draft orders from the last hour
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of today's orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/queries/today', orderController.getToday.bind(orderController));

/**
 * @swagger
 * /api/orders/queries/date/{date}:
 *   get:
 *     summary: Get orders by date
 *     description: Get all orders for a specific date (YYYY-MM-DD)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *         example: 2024-01-15
 *     responses:
 *       200:
 *         description: List of orders for the specified date
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/queries/date/:date', orderController.getByDate.bind(orderController));

/**
 * @swagger
 * /api/orders/queries/history:
 *   get:
 *     summary: Get order history with pagination
 *     description: Get paginated list of orders with optional filters
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by order status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders to this date
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *         description: Filter by payment method
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *         description: Filter by payment status
 *     responses:
 *       200:
 *         description: Paginated order history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/queries/history', authenticate, orderController.getHistory.bind(orderController));

// Order Actions - moved to sub-resource
/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   put:
 *     summary: Cancel order
 *     description: Cancel an order (only PENDING, CONFIRMED, or PREPARING orders can be cancelled)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order UUID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order cancelled successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cannot cancel order (wrong status or already paid)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.put('/:id/cancel', authenticate, orderController.cancelOrder.bind(orderController));

/**
 * @swagger
 * /api/orders/{id}/refund:
 *   post:
 *     summary: Refund order
 *     description: Refund a paid order (only orders with paymentStatus = SUCCESS can be refunded)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order UUID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refundReason:
 *                 type: string
 *                 description: Reason for refund
 *     responses:
 *       200:
 *         description: Order refunded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order refunded successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cannot refund order (not paid or validation error)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/:id/refund', authenticate, orderController.refundOrder.bind(orderController));

/**
 * @swagger
 * /api/orders/{id}/receipt:
 *   get:
 *     summary: Get order receipt data
 *     description: Get formatted order data for printing receipt
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order UUID
 *     responses:
 *       200:
 *         description: Receipt data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderNumber:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 customerName:
 *                   type: string
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: number
 *       404:
 *         description: Order not found
 */
router.get('/:id/receipt', authenticate, orderController.printReceipt.bind(orderController));

export default router;
