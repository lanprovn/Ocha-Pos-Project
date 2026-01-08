import { Router } from 'express';
import customerController from '@api/controllers/customer.controller';
import { authenticate, requireRole } from '@api/middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     description: Get paginated list of customers with filters (Admin only)
 *     tags: [Customers]
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
 *           default: 10
 *         description: Items per page
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
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tags to filter by
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of customers
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/', authenticate, requireRole('ADMIN'), customerController.getAll.bind(customerController));

/**
 * @swagger
 * /api/customers/tags:
 *   get:
 *     summary: Get available tags
 *     description: Get all unique tags from customers (Admin only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available tags
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/tags', authenticate, requireRole('ADMIN'), customerController.getAvailableTags.bind(customerController));

/**
 * @swagger
 * /api/customers/statistics:
 *   get:
 *     summary: Get customer statistics
 *     description: Get statistics about VIP customers, frequent customers, and membership distribution (Admin only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/statistics', authenticate, requireRole('ADMIN'), customerController.getStatistics.bind(customerController));

/**
 * @swagger
 * /api/customers/phone/{phone}:
 *   get:
 *     summary: Find customer by phone number
 *     description: Check if customer exists by phone number (Public endpoint for checkout)
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: Phone number
 *     responses:
 *       200:
 *         description: Customer found or not found
 *       400:
 *         description: Phone number is required
 */
router.get('/phone/:phone', customerController.findByPhone.bind(customerController));

/**
 * @swagger
 * /api/customers/find-or-create:
 *   post:
 *     summary: Find customer by phone or create new one
 *     description: Automatically save customer when phone and name are provided (Public endpoint for checkout)
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Phone number
 *               name:
 *                 type: string
 *                 description: Customer name (optional, but required for creation)
 *     responses:
 *       200:
 *         description: Customer found or created
 *       400:
 *         description: Phone number is required
 */
router.post('/find-or-create', customerController.findOrCreateByPhone.bind(customerController));

/**
 * @swagger
 * /api/customers/membership/configs:
 *   get:
 *     summary: Get membership levels configuration
 *     description: Get all membership levels with point thresholds and discount rates (Public endpoint)
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: Membership configurations
 */
router.get('/membership/configs', customerController.getMembershipConfigs.bind(customerController));

/**
 * @swagger
 * /api/customers/membership/{level}/discount:
 *   get:
 *     summary: Get discount rate for membership level
 *     description: Get discount rate for a specific membership level (Public endpoint)
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: level
 *         required: true
 *         schema:
 *           type: string
 *           enum: [BRONZE, SILVER, GOLD, PLATINUM]
 *         description: Membership level
 *     responses:
 *       200:
 *         description: Discount rate and config
 *       400:
 *         description: Invalid membership level
 */
router.get('/membership/:level/discount', customerController.getDiscountRate.bind(customerController));

/**
 * @swagger
 * /api/customers/membership/recalculate:
 *   post:
 *     summary: Recalculate membership levels for all customers
 *     description: Recalculate and update membership levels based on current loyalty points (Admin only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recalculation completed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/membership/recalculate', authenticate, requireRole('ADMIN'), customerController.recalculateAllMembershipLevels.bind(customerController));

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     description: Get customer details including orders and loyalty transactions (Admin only)
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Customer not found
 */
router.get('/:id', authenticate, requireRole('ADMIN'), customerController.getById.bind(customerController));

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update customer information
 *     description: Update customer details (Admin only)
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
 *                 nullable: true
 *               address:
 *                 type: string
 *                 nullable: true
 *               dateOfBirth:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               gender:
 *                 type: string
 *                 nullable: true
 *               notes:
 *                 type: string
 *                 nullable: true
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               membershipLevel:
 *                 type: string
 *                 enum: [BRONZE, SILVER, GOLD, PLATINUM]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated customer details
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Customer not found
 */
router.put('/:id', authenticate, requireRole('ADMIN'), customerController.update.bind(customerController));

/**
 * @swagger
 * /api/customers/{id}/loyalty-points:
 *   post:
 *     summary: Adjust loyalty points manually
 *     description: Add or subtract loyalty points manually (Admin only)
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
 *               - reason
 *             properties:
 *               points:
 *                 type: integer
 *                 description: Points to add (positive) or subtract (negative)
 *               reason:
 *                 type: string
 *                 description: Reason for adjustment
 *     responses:
 *       200:
 *         description: Updated customer details with new loyalty points
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Customer not found
 */
router.post('/:id/loyalty-points', authenticate, requireRole('ADMIN'), customerController.adjustLoyaltyPoints.bind(customerController));

export default router;

