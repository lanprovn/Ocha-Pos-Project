import { Router } from 'express';
import dashboardController from '@api/controllers/dashboard.controller';

const router = Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Get comprehensive dashboard statistics including overview, orders by status, payment stats, top products, hourly revenue, low stock alerts, and recent orders
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', dashboardController.getStats.bind(dashboardController));

/**
 * @swagger
 * /api/dashboard/daily-sales:
 *   get:
 *     summary: Get daily sales data
 *     description: Get daily sales data for a specific date or today if no date provided
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format (optional, defaults to today)
 *         example: 2024-01-15
 *     responses:
 *       200:
 *         description: Daily sales data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                 totalRevenue:
 *                   type: string
 *                 totalOrders:
 *                   type: number
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/daily-sales', dashboardController.getDailySales.bind(dashboardController));

export default router;
