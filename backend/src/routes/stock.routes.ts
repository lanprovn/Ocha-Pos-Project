import { Router } from 'express';
import stockController from '../controllers/stock.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/stock/products:
 *   get:
 *     summary: Get all product stocks
 *     description: Get a list of all product stocks
 *     tags: [Stock]
 *     responses:
 *       200:
 *         description: List of product stocks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductStock'
 *   post:
 *     summary: Create product stock
 *     description: Create a new product stock entry (requires ADMIN or STAFF role)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId: { type: string, format: uuid }
 *               quantity: { type: number, minimum: 0 }
 *               minStock: { type: number, minimum: 0 }
 *     responses:
 *       201:
 *         description: Product stock created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductStock'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/products', stockController.getAllProductStocks.bind(stockController));
router.post('/products', authenticate, requireRole('ADMIN', 'STAFF'), stockController.createProductStock.bind(stockController));

/**
 * @swagger
 * /api/stock/products/{id}:
 *   get:
 *     summary: Get product stock by ID
 *     description: Get a specific product stock by its UUID
 *     tags: [Stock]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product stock UUID
 *     responses:
 *       200:
 *         description: Product stock details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductStock'
 *       404:
 *         description: Product stock not found
 *   put:
 *     summary: Update product stock
 *     description: Update a product stock (requires ADMIN or STAFF role)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product stock UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity: { type: number, minimum: 0 }
 *               minStock: { type: number, minimum: 0 }
 *     responses:
 *       200:
 *         description: Product stock updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product stock not found
 *   delete:
 *     summary: Delete product stock
 *     description: Delete a product stock (requires ADMIN or STAFF role)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product stock UUID
 *     responses:
 *       200:
 *         description: Product stock deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product stock not found
 */
router.get('/products/:id', stockController.getProductStockById.bind(stockController));
router.put('/products/:id', authenticate, requireRole('ADMIN', 'STAFF'), stockController.updateProductStock.bind(stockController));
router.delete('/products/:id', authenticate, requireRole('ADMIN', 'STAFF'), stockController.deleteProductStock.bind(stockController));

/**
 * @swagger
 * /api/stock/ingredients:
 *   get:
 *     summary: Get all ingredient stocks
 *     description: Get a list of all ingredient stocks
 *     tags: [Stock]
 *     responses:
 *       200:
 *         description: List of ingredient stocks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/IngredientStock'
 *   post:
 *     summary: Create ingredient stock
 *     description: Create a new ingredient stock entry (requires ADMIN or STAFF role)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ingredientId, quantity]
 *             properties:
 *               ingredientId: { type: string, format: uuid }
 *               quantity: { type: number, minimum: 0 }
 *               minStock: { type: number, minimum: 0 }
 *               unit: { type: string }
 *     responses:
 *       201:
 *         description: Ingredient stock created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/ingredients', stockController.getAllIngredientStocks.bind(stockController));
router.post('/ingredients', authenticate, requireRole('ADMIN', 'STAFF'), stockController.createIngredient.bind(stockController));

/**
 * @swagger
 * /api/stock/ingredients/{id}:
 *   get:
 *     summary: Get ingredient stock by ID
 *     description: Get a specific ingredient stock by its UUID
 *     tags: [Stock]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Ingredient stock UUID
 *     responses:
 *       200:
 *         description: Ingredient stock details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IngredientStock'
 *       404:
 *         description: Ingredient stock not found
 *   put:
 *     summary: Update ingredient stock
 *     description: Update an ingredient stock (requires ADMIN or STAFF role)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Ingredient stock UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity: { type: number, minimum: 0 }
 *               minStock: { type: number, minimum: 0 }
 *               unit: { type: string }
 *     responses:
 *       200:
 *         description: Ingredient stock updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ingredient stock not found
 *   delete:
 *     summary: Delete ingredient stock
 *     description: Delete an ingredient stock (requires ADMIN or STAFF role)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Ingredient stock UUID
 *     responses:
 *       200:
 *         description: Ingredient stock deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ingredient stock not found
 */
router.get('/ingredients/:id', stockController.getIngredientStockById.bind(stockController));
router.put('/ingredients/:id', authenticate, requireRole('ADMIN', 'STAFF'), stockController.updateIngredientStock.bind(stockController));
router.delete('/ingredients/:id', authenticate, requireRole('ADMIN', 'STAFF'), stockController.deleteIngredient.bind(stockController));

/**
 * @swagger
 * /api/stock/transactions:
 *   get:
 *     summary: Get all stock transactions
 *     description: Get a list of all stock transactions
 *     tags: [Stock]
 *     responses:
 *       200:
 *         description: List of stock transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StockTransaction'
 *   post:
 *     summary: Create stock transaction
 *     description: Create a new stock transaction (requires ADMIN or STAFF role)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, quantity]
 *             properties:
 *               type: { type: string, enum: [IN, OUT, ADJUSTMENT] }
 *               productId: { type: string, format: uuid, nullable: true }
 *               ingredientId: { type: string, format: uuid, nullable: true }
 *               quantity: { type: number }
 *               reason: { type: string, nullable: true }
 *     responses:
 *       201:
 *         description: Stock transaction created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/transactions', stockController.getAllTransactions.bind(stockController));
router.post('/transactions', authenticate, requireRole('ADMIN', 'STAFF'), stockController.createTransaction.bind(stockController));

/**
 * @swagger
 * /api/stock/transactions/{id}:
 *   get:
 *     summary: Get stock transaction by ID
 *     description: Get a specific stock transaction by its UUID
 *     tags: [Stock]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Stock transaction UUID
 *     responses:
 *       200:
 *         description: Stock transaction details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StockTransaction'
 *       404:
 *         description: Stock transaction not found
 */
router.get('/transactions/:id', stockController.getTransactionById.bind(stockController));

/**
 * @swagger
 * /api/stock/alerts:
 *   get:
 *     summary: Get all stock alerts
 *     description: Get a list of all stock alerts
 *     tags: [Stock]
 *     responses:
 *       200:
 *         description: List of stock alerts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string, format: uuid }
 *                   type: { type: string }
 *                   message: { type: string }
 *                   isRead: { type: boolean }
 *                   createdAt: { type: string, format: date-time }
 *   post:
 *     summary: Create stock alert
 *     description: Create a new stock alert (requires ADMIN or STAFF role)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, message]
 *             properties:
 *               type: { type: string }
 *               message: { type: string }
 *     responses:
 *       201:
 *         description: Stock alert created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/alerts', stockController.getAllAlerts.bind(stockController));
router.post('/alerts', authenticate, requireRole('ADMIN', 'STAFF'), stockController.createAlert.bind(stockController));

/**
 * @swagger
 * /api/stock/alerts/{id}:
 *   get:
 *     summary: Get stock alert by ID
 *     description: Get a specific stock alert by its UUID
 *     tags: [Stock]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Stock alert UUID
 *     responses:
 *       200:
 *         description: Stock alert details
 *       404:
 *         description: Stock alert not found
 *   put:
 *     summary: Update stock alert
 *     description: Update a stock alert (requires ADMIN or STAFF role)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Stock alert UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message: { type: string }
 *     responses:
 *       200:
 *         description: Stock alert updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Stock alert not found
 *   delete:
 *     summary: Delete stock alert
 *     description: Delete a stock alert (requires ADMIN or STAFF role)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Stock alert UUID
 *     responses:
 *       200:
 *         description: Stock alert deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Stock alert not found
 */
router.get('/alerts/:id', stockController.getAlertById.bind(stockController));
router.put('/alerts/:id', authenticate, requireRole('ADMIN', 'STAFF'), stockController.updateAlert.bind(stockController));
router.delete('/alerts/:id', authenticate, requireRole('ADMIN', 'STAFF'), stockController.deleteAlert.bind(stockController));

/**
 * @swagger
 * /api/stock/alerts/{id}/read:
 *   put:
 *     summary: Mark stock alert as read
 *     description: Mark a stock alert as read (requires ADMIN or STAFF role)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Stock alert UUID
 *     responses:
 *       200:
 *         description: Stock alert marked as read
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Stock alert not found
 */
router.put('/alerts/:id/read', authenticate, requireRole('ADMIN', 'STAFF'), stockController.markAlertAsRead.bind(stockController));

export default router;
