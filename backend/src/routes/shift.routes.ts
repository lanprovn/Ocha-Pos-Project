import { Router } from 'express';
import shiftController from '../controllers/shift.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/shifts:
 *   get:
 *     summary: Get all shifts
 *     description: Get all shifts with optional filters
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, CLOSED]
 *         description: Filter by status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
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
 *         description: List of shifts
 */
router.get('/', authenticate, requireRole('ADMIN', 'STAFF'), shiftController.getAll.bind(shiftController));

/**
 * @swagger
 * /api/shifts/current:
 *   get:
 *     summary: Get current open shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current open shift
 *       404:
 *         description: No open shift
 */
router.get('/current', authenticate, requireRole('ADMIN', 'STAFF'), shiftController.getCurrentOpen.bind(shiftController));

/**
 * @swagger
 * /api/shifts/auto-open:
 *   post:
 *     summary: Auto-open shift for staff (check-in)
 *     description: Automatically opens shift with default opening cash (0) when staff logs in. If shift already open, returns existing shift.
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Shift opened or already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/auto-open', authenticate, requireRole('ADMIN', 'STAFF'), shiftController.autoOpen.bind(shiftController));

/**
 * @swagger
 * /api/shifts/{id}:
 *   get:
 *     summary: Get shift by ID
 *     tags: [Shifts]
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
 *         description: Shift details
 */
router.get('/:id', authenticate, requireRole('ADMIN', 'STAFF'), shiftController.getById.bind(shiftController));

/**
 * @swagger
 * /api/shifts/{id}/summary:
 *   get:
 *     summary: Get shift summary with statistics
 *     tags: [Shifts]
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
 *         description: Shift summary
 */
router.get('/:id/summary', authenticate, requireRole('ADMIN', 'STAFF'), shiftController.getSummary.bind(shiftController));

/**
 * @swagger
 * /api/shifts:
 *   post:
 *     summary: Create new shift (open shift)
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - userName
 *               - openingCash
 *             properties:
 *               userId:
 *                 type: string
 *               userName:
 *                 type: string
 *               openingCash:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Shift created
 */
router.post('/', authenticate, requireRole('ADMIN'), shiftController.create.bind(shiftController));

/**
 * @swagger
 * /api/shifts/{id}/close:
 *   put:
 *     summary: Close shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - closingCash
 *             properties:
 *               closingCash:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Shift closed
 */
router.put('/:id/close', authenticate, requireRole('ADMIN'), shiftController.close.bind(shiftController));

/**
 * @swagger
 * /api/shifts/{id}:
 *   put:
 *     summary: Update shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Shift updated
 */
router.put('/:id', authenticate, requireRole('ADMIN'), shiftController.update.bind(shiftController));

/**
 * @swagger
 * /api/shifts/{id}:
 *   delete:
 *     summary: Delete shift
 *     tags: [Shifts]
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
 *         description: Shift deleted
 */
router.delete('/:id', authenticate, requireRole('ADMIN'), shiftController.delete.bind(shiftController));

export default router;

