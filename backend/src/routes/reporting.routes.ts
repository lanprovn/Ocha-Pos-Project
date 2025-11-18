import { Router } from 'express';
import reportingController from '../controllers/reporting.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/reporting:
 *   get:
 *     summary: Get detailed report data
 *     description: Get comprehensive report data including daily sales, peak hours, best sellers, and payment statistics
 *     tags: [Reporting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date in YYYY-MM-DD format
 *         example: 2024-01-01
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date in YYYY-MM-DD format
 *         example: 2024-01-31
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, custom]
 *         description: Report type (optional)
 *     responses:
 *       200:
 *         description: Report data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                 dailyData:
 *                   type: array
 *                 peakHours:
 *                   type: array
 *                 bestSellers:
 *                   type: array
 *                 paymentMethodStats:
 *                   type: object
 *       400:
 *         description: Bad request - missing parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, requireRole('ADMIN', 'STAFF'), reportingController.getReport.bind(reportingController));

/**
 * @swagger
 * /api/reporting/export:
 *   get:
 *     summary: Export report data
 *     description: Export report data for Excel download
 *     tags: [Reporting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date in YYYY-MM-DD format
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date in YYYY-MM-DD format
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, custom]
 *         description: Report type (optional)
 *     responses:
 *       200:
 *         description: Export data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/export', authenticate, requireRole('ADMIN', 'STAFF'), reportingController.exportReport.bind(reportingController));

export default router;

