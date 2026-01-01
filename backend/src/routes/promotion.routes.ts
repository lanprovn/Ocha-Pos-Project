import { Router } from 'express';
import promotionController from '../controllers/promotion.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/promotions:
 *   get:
 *     summary: Get all promotion codes
 *     description: Get all promotion codes with optional filters
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Search by code
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of promotion codes
 */
router.get('/', authenticate, requireRole('ADMIN', 'STAFF'), promotionController.getAll.bind(promotionController));

/**
 * @swagger
 * /api/promotions/validate:
 *   post:
 *     summary: Validate promotion code
 *     description: Validate a promotion code and calculate discount
 *     tags: [Promotions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - orderAmount
 *             properties:
 *               code:
 *                 type: string
 *               orderAmount:
 *                 type: number
 *               customerId:
 *                 type: string
 *               customerPhone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Validation result
 */
router.post('/validate', promotionController.validate.bind(promotionController));

/**
 * @swagger
 * /api/promotions/{id}:
 *   get:
 *     summary: Get promotion code by ID
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Promotion code details
 */
router.get('/:id', authenticate, requireRole('ADMIN', 'STAFF'), promotionController.getById.bind(promotionController));

/**
 * @swagger
 * /api/promotions/code/{code}:
 *   get:
 *     summary: Get promotion code by code string
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Promotion code details
 */
router.get('/code/:code', authenticate, requireRole('ADMIN', 'STAFF'), promotionController.getByCode.bind(promotionController));

/**
 * @swagger
 * /api/promotions:
 *   post:
 *     summary: Create new promotion code
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - type
 *               - value
 *               - startDate
 *               - endDate
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [PERCENTAGE, FIXED_AMOUNT]
 *               value:
 *                 type: number
 *               minOrderAmount:
 *                 type: number
 *               maxDiscountAmount:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               maxUses:
 *                 type: integer
 *               maxUsesPerCustomer:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Promotion code created
 */
router.post('/', authenticate, requireRole('ADMIN'), promotionController.create.bind(promotionController));

/**
 * @swagger
 * /api/promotions/{id}:
 *   put:
 *     summary: Update promotion code
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Promotion code updated
 */
router.put('/:id', authenticate, requireRole('ADMIN'), promotionController.update.bind(promotionController));

/**
 * @swagger
 * /api/promotions/{id}:
 *   delete:
 *     summary: Delete promotion code
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Promotion code deleted
 */
router.delete('/:id', authenticate, requireRole('ADMIN'), promotionController.delete.bind(promotionController));

export default router;



