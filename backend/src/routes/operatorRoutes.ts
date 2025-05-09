import { Router, RequestHandler } from 'express';
import { updateOperatorAccount, deleteOperatorAccount } from '../controllers/operatorController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @openapi
 * /operators/update:
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
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               verificationCode:
 *                 type: string
 *                 description: Required when changing email
 *     responses:
 *       200:
 *         description: Account updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an operator
 */
router.put('/update', authMiddleware, roleMiddleware(['OPERATOR']), updateOperatorAccount as RequestHandler);

/**
 * @openapi
 * /operators/delete:
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
router.delete('/delete', authMiddleware, roleMiddleware(['OPERATOR']), deleteOperatorAccount as RequestHandler);

export default router;
