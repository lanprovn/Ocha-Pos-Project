import { Router } from 'express';
import purchaseOrderController from '../controllers/purchase-order.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/purchase-orders:
 *   get:
 *     summary: Get all purchase orders
 *     description: Get a list of all purchase orders with optional filters
 *     tags: [Purchase Orders]
 *     parameters:
 *       - in: query
 *         name: supplierId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by supplier ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, SENT, RECEIVED, PAID, CANCELLED]
 *         description: Filter by status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of purchase orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PurchaseOrder'
 *   post:
 *     summary: Create a new purchase order
 *     description: Create a new purchase order (requires ADMIN or STAFF role)
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePurchaseOrderRequest'
 *     responses:
 *       201:
 *         description: Purchase order created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Supplier not found
 */
router.get('/', authenticate, requireRole('ADMIN', 'STAFF'), purchaseOrderController.getAll.bind(purchaseOrderController));
router.post('/', authenticate, requireRole('ADMIN', 'STAFF'), purchaseOrderController.create.bind(purchaseOrderController));

/**
 * @swagger
 * /api/purchase-orders/{id}:
 *   get:
 *     summary: Get purchase order by ID
 *     description: Get a specific purchase order by its UUID
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Purchase order UUID
 *     responses:
 *       200:
 *         description: Purchase order details
 *       404:
 *         description: Purchase order not found
 *   patch:
 *     summary: Update purchase order
 *     description: Update a purchase order (requires ADMIN or STAFF role)
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Purchase order UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePurchaseOrderRequest'
 *     responses:
 *       200:
 *         description: Purchase order updated successfully
 *       400:
 *         description: Validation error or invalid status
 *       404:
 *         description: Purchase order not found
 */
router.get('/:id', authenticate, requireRole('ADMIN', 'STAFF'), purchaseOrderController.getById.bind(purchaseOrderController));
router.patch('/:id', authenticate, requireRole('ADMIN', 'STAFF'), purchaseOrderController.update.bind(purchaseOrderController));

/**
 * @swagger
 * /api/purchase-orders/{id}/receive:
 *   post:
 *     summary: Receive purchase order
 *     description: Receive a purchase order and update stock (requires ADMIN or STAFF role)
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Purchase order UUID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receivedAt:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Purchase order received successfully
 *       400:
 *         description: Invalid status or validation error
 *       404:
 *         description: Purchase order not found
 */
router.post('/:id/receive', authenticate, requireRole('ADMIN', 'STAFF'), purchaseOrderController.receive.bind(purchaseOrderController));

/**
 * @swagger
 * /api/purchase-orders/{id}/mark-paid:
 *   post:
 *     summary: Mark purchase order as paid
 *     description: Mark a purchase order as paid (requires ADMIN or STAFF role)
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Purchase order UUID
 *     responses:
 *       200:
 *         description: Purchase order marked as paid
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Purchase order not found
 */
router.post('/:id/mark-paid', authenticate, requireRole('ADMIN', 'STAFF'), purchaseOrderController.markAsPaid.bind(purchaseOrderController));

/**
 * @swagger
 * /api/purchase-orders/{id}/cancel:
 *   post:
 *     summary: Cancel purchase order
 *     description: Cancel a purchase order (requires ADMIN or STAFF role)
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Purchase order UUID
 *     responses:
 *       200:
 *         description: Purchase order cancelled successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Purchase order not found
 */
router.post('/:id/cancel', authenticate, requireRole('ADMIN', 'STAFF'), purchaseOrderController.cancel.bind(purchaseOrderController));

export default router;



