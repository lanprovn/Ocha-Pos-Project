import { Router } from 'express';
import orderController from '@api/controllers/order.controller';
import { authenticate, requireRole } from '@api/middlewares/auth.middleware';

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
router.delete('/draft', orderController.deleteDraftOrders.bind(orderController));
router.delete('/draft/all', authenticate, requireRole('ADMIN'), orderController.deleteAllDraftOrders.bind(orderController));

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
 *           enum: [CASH, CARD, QR]
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
router.get('/today', orderController.getToday.bind(orderController));

/**
 * @swagger
 * /api/orders/date/{date}:
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
router.get('/date/:date', orderController.getByDate.bind(orderController));

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

/**
 * @swagger
 * /api/orders/{id}/verify:
 *   patch:
 *     summary: Verify customer order
 *     description: "Staff verifies a customer order, changing status from PENDING to CONFIRMED"
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
 *         description: "Order UUID"
 *     responses:
 *       200:
 *         description: "Order verified successfully"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: "Validation error or order cannot be verified"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: "Unauthorized"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: "Forbidden - Insufficient permissions"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: "Order not found"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/verify', authenticate, requireRole('ADMIN', 'STAFF'), orderController.verifyOrder.bind(orderController));

/**
 * @swagger
 * /api/orders/{id}/reject:
 *   patch:
 *     summary: Reject customer order
 *     description: "Staff rejects a customer order, changing status from PENDING to CANCELLED"
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
 *         description: "Order UUID"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: "Optional reason for rejection"
 *                 example: "Out of stock"
 *     responses:
 *       200:
 *         description: "Order rejected successfully"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: "Validation error or order cannot be rejected"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: "Unauthorized"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: "Forbidden - Insufficient permissions"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: "Order not found"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/reject', authenticate, requireRole('ADMIN', 'STAFF'), orderController.rejectOrder.bind(orderController));

/**
 * @swagger
 * /api/orders/holds:
 *   get:
 *     summary: Get all hold orders
 *     description: Get all orders with HOLD status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderCreator
 *         schema:
 *           type: string
 *           enum: [STAFF, CUSTOMER]
 *         description: Filter by order creator
 *     responses:
 *       200:
 *         description: List of hold orders
 *       401:
 *         description: Unauthorized
 */
router.get('/holds', authenticate, requireRole('ADMIN', 'STAFF'), orderController.getHoldOrders.bind(orderController));

/**
 * @swagger
 * /api/orders/track/{phoneOrOrderNumber}:
 *   get:
 *     summary: Find order by phone number or order number
 *     description: Find an order by phone number or order number (Public endpoint for customer tracking)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: phoneOrOrderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Phone number or order number
 *     responses:
 *       200:
 *         description: Order found
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
router.get('/track/:phoneOrOrderNumber', orderController.findByPhoneOrOrderNumber.bind(orderController));

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
 * /api/orders/{id}/hold:
 *   post:
 *     summary: Hold order (Lưu đơn hàng tạm)
 *     description: Save an order temporarily (change status to HOLD)
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
 *               holdName:
 *                 type: string
 *                 nullable: true
 *                 description: Optional name for the hold order
 *     responses:
 *       200:
 *         description: Order held successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/:id/hold', authenticate, requireRole('ADMIN', 'STAFF'), orderController.holdOrder.bind(orderController));

/**
 * @swagger
 * /api/orders/{id}/resume:
 *   post:
 *     summary: Resume hold order (Khôi phục đơn hàng đã lưu)
 *     description: Resume a held order (change status from HOLD to PENDING)
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
 *         description: Order resumed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/:id/resume', authenticate, requireRole('ADMIN', 'STAFF'), orderController.resumeHoldOrder.bind(orderController));

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   post:
 *     summary: Cancel order with reason
 *     description: Cancel an order with reason and optional refund
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
 *             type: object
 *             required:
 *               - reason
 *               - reasonType
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *               reasonType:
 *                 type: string
 *                 enum: [OUT_OF_STOCK, CUSTOMER_REQUEST, SYSTEM_ERROR, OTHER]
 *               refundAmount:
 *                 type: number
 *                 nullable: true
 *                 description: Refund amount (auto-calculated if not provided)
 *               refundMethod:
 *                 type: string
 *                 enum: [CASH, CARD, QR]
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/:id/cancel', authenticate, requireRole('ADMIN', 'STAFF'), orderController.cancelOrder.bind(orderController));

/**
 * @swagger
 * /api/orders/{id}/return:
 *   post:
 *     summary: Return order items
 *     description: Return items from a completed order
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
 *             type: object
 *             required:
 *               - returnType
 *               - returnReason
 *               - refundMethod
 *               - items
 *             properties:
 *               returnType:
 *                 type: string
 *                 enum: [FULL, PARTIAL]
 *               returnReason:
 *                 type: string
 *                 enum: [DEFECTIVE, WRONG_ITEM, CUSTOMER_REQUEST, OTHER]
 *               refundMethod:
 *                 type: string
 *                 enum: [CASH, CARD, QR]
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - orderItemId
 *                     - quantity
 *                     - refundAmount
 *                   properties:
 *                     orderItemId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                     refundAmount:
 *                       type: number
 *               notes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Order returned successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/:id/return', authenticate, requireRole('ADMIN', 'STAFF'), orderController.returnOrder.bind(orderController));

/**
 * @swagger
 * /api/orders/{id}/split:
 *   post:
 *     summary: Split order
 *     description: Split an order into multiple orders
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
 *             type: object
 *             required:
 *               - splits
 *             properties:
 *               splits:
 *                 type: array
 *                 minItems: 2
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemIds
 *                   properties:
 *                     name:
 *                       type: string
 *                       nullable: true
 *                     itemIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uuid
 *     responses:
 *       200:
 *         description: Order split successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/:id/split', authenticate, requireRole('ADMIN', 'STAFF'), orderController.splitOrder.bind(orderController));

/**
 * @swagger
 * /api/orders/merge:
 *   post:
 *     summary: Merge orders
 *     description: Merge multiple orders into one order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderIds
 *             properties:
 *               orderIds:
 *                 type: array
 *                 minItems: 2
 *                 items:
 *                   type: string
 *                   format: uuid
 *               mergedOrderName:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Orders merged successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Some orders not found
 */
router.post('/merge', authenticate, requireRole('ADMIN', 'STAFF'), orderController.mergeOrders.bind(orderController));

export default router;
