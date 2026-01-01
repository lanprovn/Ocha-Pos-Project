import { Router } from 'express';
import customerController from '../controllers/customer.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     description: Get all customers with optional filters and pagination (requires ADMIN role)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, phone, or email
 *       - in: query
 *         name: membershipLevel
 *         schema:
 *           type: string
 *           enum: [BRONZE, SILVER, GOLD, PLATINUM]
 *         description: Filter by membership level
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
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
 *           default: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authenticate, requireRole('ADMIN'), customerController.getAll.bind(customerController));

/**
 * @swagger
 * /api/customers/statistics:
 *   get:
 *     summary: Get customer statistics
 *     description: Get customer statistics (requires ADMIN role)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer statistics
 */
router.get('/statistics', authenticate, requireRole('ADMIN'), customerController.getStatistics.bind(customerController));

/**
 * @swagger
 * /api/customers/by-phone:
 *   get:
 *     summary: Get customer by phone
 *     description: Get customer by phone number (requires ADMIN or STAFF role)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: Phone number
 *     responses:
 *       200:
 *         description: Customer found
 *       404:
 *         description: Customer not found
 */
router.get('/by-phone', authenticate, requireRole('ADMIN', 'STAFF'), customerController.getByPhone.bind(customerController));

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     description: Get customer details by ID (requires ADMIN role)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer details
 *       404:
 *         description: Customer not found
 */
router.get('/:id', authenticate, requireRole('ADMIN'), customerController.getById.bind(customerController));

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create new customer
 *     description: Create a new customer (requires ADMIN role)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *               avatar:
 *                 type: string
 *               notes:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Phone or email already exists
 */
router.post('/', authenticate, requireRole('ADMIN'), customerController.create.bind(customerController));

/**
 * @swagger
 * /api/customers/{id}:
 *   patch:
 *     summary: Update customer
 *     description: Update customer information (requires ADMIN role)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *               avatar:
 *                 type: string
 *               notes:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       404:
 *         description: Customer not found
 *       409:
 *         description: Phone or email already exists
 */
router.patch('/:id', authenticate, requireRole('ADMIN'), customerController.update.bind(customerController));

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete customer
 *     description: Soft delete customer by setting isActive to false (requires ADMIN role)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer deactivated successfully
 *       404:
 *         description: Customer not found
 */
router.delete('/:id', authenticate, requireRole('ADMIN'), customerController.delete.bind(customerController));

/**
 * @swagger
 * /api/customers/{id}/loyalty-points:
 *   post:
 *     summary: Update customer loyalty points
 *     description: Update customer loyalty points (requires ADMIN role)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - points
 *               - type
 *             properties:
 *               points:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [EARN, REDEEM, EXPIRED, ADJUSTMENT]
 *               reason:
 *                 type: string
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Loyalty points updated successfully
 *       400:
 *         description: Validation error or insufficient points
 *       404:
 *         description: Customer not found
 */
router.post('/:id/loyalty-points', authenticate, requireRole('ADMIN'), customerController.updateLoyaltyPoints.bind(customerController));

/**
 * @swagger
 * /api/customers/membership/benefits:
 *   get:
 *     summary: Get membership benefits information
 *     description: Get discount rates, point rates, and thresholds for all membership levels
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: Membership benefits information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 BRONZE:
 *                   type: object
 *                   properties:
 *                     discountRate:
 *                       type: number
 *                     pointRate:
 *                       type: number
 *                     threshold:
 *                       type: number
 *                     nextLevel:
 *                       type: string
 *                     nextThreshold:
 *                       type: number
 *                 SILVER:
 *                   type: object
 *                 GOLD:
 *                   type: object
 *                 PLATINUM:
 *                   type: object
 */
router.get('/membership/benefits', customerController.getMembershipBenefits.bind(customerController));

export default router;

