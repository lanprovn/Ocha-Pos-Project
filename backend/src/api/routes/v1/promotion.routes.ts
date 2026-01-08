import { Router } from 'express';
import promotionController from '@api/controllers/promotion.controller';
import { authenticate, requireRole } from '@api/middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/promotions:
 *   get:
 *     summary: Get all promotions
 *     description: Get paginated list of promotions (Admin only)
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, requireRole('ADMIN'), promotionController.getAll.bind(promotionController));

/**
 * @swagger
 * /api/promotions/statistics:
 *   get:
 *     summary: Get promotion statistics
 *     description: Get promotion statistics (Admin only)
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/statistics', authenticate, requireRole('ADMIN'), promotionController.getStatistics.bind(promotionController));

/**
 * @swagger
 * /api/promotions/validate:
 *   post:
 *     summary: Validate and apply promotion
 *     description: Validate and apply a promotion code (Public endpoint for checkout)
 *     tags: [Promotions]
 */
router.post('/validate', promotionController.validateAndApply.bind(promotionController));

/**
 * @swagger
 * /api/promotions:
 *   post:
 *     summary: Create promotion
 *     description: Create a new promotion (Admin only)
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, requireRole('ADMIN'), promotionController.create.bind(promotionController));

/**
 * @swagger
 * /api/promotions/code/{code}:
 *   get:
 *     summary: Get promotion by code
 *     description: Get promotion details by code (Public endpoint)
 *     tags: [Promotions]
 */
router.get('/code/:code', promotionController.getByCode.bind(promotionController));

/**
 * @swagger
 * /api/promotions/{id}:
 *   get:
 *     summary: Get promotion by ID
 *     description: Get promotion details (Admin only)
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, requireRole('ADMIN'), promotionController.getById.bind(promotionController));

/**
 * @swagger
 * /api/promotions/{id}:
 *   put:
 *     summary: Update promotion
 *     description: Update promotion details (Admin only)
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, requireRole('ADMIN'), promotionController.update.bind(promotionController));

/**
 * @swagger
 * /api/promotions/{id}:
 *   delete:
 *     summary: Delete promotion
 *     description: Delete a promotion (Admin only)
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, requireRole('ADMIN'), promotionController.delete.bind(promotionController));

export default router;

