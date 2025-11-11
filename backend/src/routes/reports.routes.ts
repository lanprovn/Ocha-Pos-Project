import { Router } from 'express';
import reportsController from '../controllers/reports.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/reports/revenue:
 *   get:
 *     summary: Get revenue summary by period
 *     description: Get aggregated revenue data for day, week, or month
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *         description: Time period (day, week, or month)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD) - optional, used with endDate
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD) - optional, used with startDate
 *     responses:
 *       200:
 *         description: Revenue summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                 endDate:
 *                   type: string
 *                 totalRevenue:
 *                   type: string
 *                 totalOrders:
 *                   type: integer
 *                 averageOrderValue:
 *                   type: string
 *                 dailyBreakdown:
 *                   type: array
 *                   items:
 *                     type: object
 *                 paymentBreakdown:
 *                   type: object
 */
router.get('/revenue', authenticate, reportsController.getRevenueSummary.bind(reportsController));

/**
 * @swagger
 * /api/reports/orders/export:
 *   get:
 *     summary: Export orders to CSV
 *     description: Export orders to CSV format with optional filters
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/orders/export', authenticate, reportsController.exportOrders.bind(reportsController));

export default router;

