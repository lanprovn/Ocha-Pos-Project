import { Router } from 'express';
import recipeController from '../controllers/recipe.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/recipes/product/{productId}:
 *   get:
 *     summary: Get recipes by product
 *     description: Get all recipes for a specific product
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product UUID
 *     responses:
 *       200:
 *         description: List of recipes for the product
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string, format: uuid }
 *                   productId: { type: string, format: uuid }
 *                   ingredientId: { type: string, format: uuid }
 *                   quantity: { type: number }
 *                   unit: { type: string }
 */
router.get('/product/:productId', recipeController.getByProduct.bind(recipeController));

/**
 * @swagger
 * /api/recipes/ingredient/{ingredientId}:
 *   get:
 *     summary: Get recipes by ingredient
 *     description: Get all recipes that use a specific ingredient
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: ingredientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Ingredient UUID
 *     responses:
 *       200:
 *         description: List of recipes using the ingredient
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/ingredient/:ingredientId', recipeController.getByIngredient.bind(recipeController));

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Get recipe by ID
 *     description: Get a specific recipe by its UUID
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Recipe UUID
 *     responses:
 *       200:
 *         description: Recipe details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Recipe not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update recipe
 *     description: Update a recipe (requires ADMIN or STAFF role)
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Recipe UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId: { type: string, format: uuid }
 *               ingredientId: { type: string, format: uuid }
 *               quantity: { type: number }
 *               unit: { type: string }
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Recipe not found
 *   delete:
 *     summary: Delete recipe
 *     description: Delete a recipe (requires ADMIN or STAFF role)
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Recipe UUID
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Recipe not found
 */
router.get('/:id', recipeController.getById.bind(recipeController));
router.put('/:id', authenticate, requireRole('ADMIN', 'STAFF'), recipeController.update.bind(recipeController));
router.delete('/:id', authenticate, requireRole('ADMIN', 'STAFF'), recipeController.delete.bind(recipeController));

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Create recipe
 *     description: Create a new recipe (requires ADMIN or STAFF role)
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, ingredientId, quantity]
 *             properties:
 *               productId: { type: string, format: uuid }
 *               ingredientId: { type: string, format: uuid }
 *               quantity: { type: number }
 *               unit: { type: string }
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, requireRole('ADMIN', 'STAFF'), recipeController.create.bind(recipeController));

export default router;
