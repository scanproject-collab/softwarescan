import { Router, RequestHandler } from 'express';
import { updateOperatorAccount, deleteOperatorAccount } from '../controllers/operatorController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @openapi
 * /operators/profile:
 *   put:
 *     summary: Update operator account
 *     description: Update the current operator's account information
 *     tags:
 *       - Operators
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Account updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an operator
 */
router.put('/profile', authMiddleware, roleMiddleware(['OPERATOR']), updateOperatorAccount as RequestHandler);

/**
 * @openapi
 * /operators/profile:
 *   delete:
 *     summary: Delete operator account
 *     description: Delete the current operator's account
 *     tags:
 *       - Operators
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/profile', authMiddleware, deleteOperatorAccount as RequestHandler);

export default router;
