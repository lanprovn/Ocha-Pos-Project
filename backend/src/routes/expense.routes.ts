import { Router } from 'express';
import expenseController from '../controllers/expense.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// ========== Expense Category Routes ==========

/**
 * @swagger
 * /api/expenses/categories:
 *   get:
 *     summary: Get all expense categories
 *     description: Get a list of all expense categories
 *     tags: [Expenses]
 *     responses:
 *       200:
 *         description: List of expense categories
 *   post:
 *     summary: Create expense category
 *     description: Create a new expense category (requires ADMIN or STAFF role)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.get('/categories', expenseController.getAllCategories.bind(expenseController));
router.post('/categories', authenticate, requireRole('ADMIN', 'STAFF'), expenseController.createCategory.bind(expenseController));

/**
 * @swagger
 * /api/expenses/categories/{id}:
 *   get:
 *     summary: Get expense category by ID
 *     tags: [Expenses]
 *     responses:
 *       200:
 *         description: Category details
 *   patch:
 *     summary: Update expense category
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category updated successfully
 *   delete:
 *     summary: Delete expense category
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category deleted successfully
 */
router.get('/categories/:id', expenseController.getCategoryById.bind(expenseController));
router.patch('/categories/:id', authenticate, requireRole('ADMIN', 'STAFF'), expenseController.updateCategory.bind(expenseController));
router.delete('/categories/:id', authenticate, requireRole('ADMIN', 'STAFF'), expenseController.deleteCategory.bind(expenseController));

// ========== Expense Routes ==========

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses
 *     description: Get a list of all expenses with optional filters
 *     tags: [Expenses]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by category ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [FIXED, VARIABLE, ONE_TIME]
 *         description: Filter by expense type
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
 *         description: List of expenses
 *   post:
 *     summary: Create expense
 *     description: Create a new expense (requires ADMIN or STAFF role)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Expense created successfully
 */
router.get('/', authenticate, requireRole('ADMIN', 'STAFF'), expenseController.getAll.bind(expenseController));
router.post('/', authenticate, requireRole('ADMIN', 'STAFF'), expenseController.create.bind(expenseController));

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expense details
 *   patch:
 *     summary: Update expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *   delete:
 *     summary: Delete expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 */
router.get('/:id', authenticate, requireRole('ADMIN', 'STAFF'), expenseController.getById.bind(expenseController));
router.patch('/:id', authenticate, requireRole('ADMIN', 'STAFF'), expenseController.update.bind(expenseController));
router.delete('/:id', authenticate, requireRole('ADMIN', 'STAFF'), expenseController.delete.bind(expenseController));

/**
 * @swagger
 * /api/expenses/summary:
 *   get:
 *     summary: Get expense summary
 *     description: Get expense summary for a date range (requires ADMIN or STAFF role)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Expense summary
 */
router.get('/summary', authenticate, requireRole('ADMIN', 'STAFF'), expenseController.getExpenseSummary.bind(expenseController));

/**
 * @swagger
 * /api/expenses/profit-loss:
 *   get:
 *     summary: Get profit & loss report
 *     description: Get profit & loss report for a date range (requires ADMIN or STAFF role)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Profit & loss report
 */
router.get('/profit-loss', authenticate, requireRole('ADMIN', 'STAFF'), expenseController.getProfitLossReport.bind(expenseController));

export default router;



