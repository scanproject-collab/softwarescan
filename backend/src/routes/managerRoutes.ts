import { Router } from 'express';
import {
    listOperatorsForManager,
    listPendingOperatorsForManager,
    approveOperatorForManager,
    rejectOperatorForManager,
    listPostsForManager,
    deletePostForManager,
    listNotificationsForManager,
    getOperatorDetails,
    updateOperator,
    deleteOperator,
} from '../controllers/managerController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @openapi
 * /managers/operators:
 *   get:
 *     summary: List all operators
 *     description: Retrieve a list of all operators for the manager's institution
 *     tags:
 *       - Managers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of operators
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a manager
 */
router.get('/operators', authMiddleware, roleMiddleware(['MANAGER']), listOperatorsForManager);

/**
 * @openapi
 * /managers/operators/pending:
 *   get:
 *     summary: List pending operators
 *     description: Retrieve a list of pending operators for the manager's institution
 *     tags:
 *       - Managers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending operators
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a manager
 */
router.get('/operators/pending', authMiddleware, roleMiddleware(['MANAGER']), listPendingOperatorsForManager);

/**
 * @openapi
 * /managers/operators/{operatorId}/approve:
 *   post:
 *     summary: Approve an operator
 *     description: Approve a pending operator for the manager's institution
 *     tags:
 *       - Managers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: operatorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the operator to approve
 *     responses:
 *       200:
 *         description: Operator approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a manager
 *       404:
 *         description: Operator not found
 */
router.post('/operators/:operatorId/approve', authMiddleware, roleMiddleware(['MANAGER']), approveOperatorForManager);

/**
 * @openapi
 * /managers/operators/{operatorId}/reject:
 *   delete:
 *     summary: Reject an operator
 *     description: Reject a pending operator for the manager's institution
 *     tags:
 *       - Managers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: operatorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the operator to reject
 *     responses:
 *       200:
 *         description: Operator rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a manager
 *       404:
 *         description: Operator not found
 */
router.delete('/operators/:operatorId/reject', authMiddleware, roleMiddleware(['MANAGER']), rejectOperatorForManager);

/**
 * @openapi
 * /managers/posts:
 *   get:
 *     summary: List all posts
 *     description: Retrieve a list of all posts for the manager's institution
 *     tags:
 *       - Managers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of posts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a manager
 */
router.get('/posts', authMiddleware, roleMiddleware(['MANAGER']), listPostsForManager);

/**
 * @openapi
 * /managers/posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     description: Delete a post from the manager's institution
 *     tags:
 *       - Managers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a manager
 *       404:
 *         description: Post not found
 */
router.delete('/posts/:postId', authMiddleware, roleMiddleware(['MANAGER']), deletePostForManager);

/**
 * @openapi
 * /managers/notifications:
 *   get:
 *     summary: List notifications
 *     description: Retrieve a list of notifications for the manager
 *     tags:
 *       - Managers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a manager
 */
router.get('/notifications', authMiddleware, roleMiddleware(['MANAGER']), listNotificationsForManager);

/**
 * @openapi
 * /managers/operators/{operatorId}:
 *   get:
 *     summary: Get operator details
 *     description: Retrieve detailed information about a specific operator
 *     tags:
 *       - Managers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: operatorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the operator
 *     responses:
 *       200:
 *         description: Operator details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a manager
 *       404:
 *         description: Operator not found
 */
router.get('/operators/:operatorId', authMiddleware, roleMiddleware(['MANAGER']), getOperatorDetails);

/**
 * @openapi
 * /managers/operators/{operatorId}:
 *   put:
 *     summary: Update operator
 *     description: Update an operator's information
 *     tags:
 *       - Managers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: operatorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the operator to update
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
 *         description: Operator updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a manager
 *       404:
 *         description: Operator not found
 */
router.put('/operators/:operatorId', authMiddleware, roleMiddleware(['MANAGER']), updateOperator);

/**
 * @openapi
 * /managers/operators/{operatorId}:
 *   delete:
 *     summary: Delete operator
 *     description: Delete an operator from the system
 *     tags:
 *       - Managers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: operatorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the operator to delete
 *     responses:
 *       200:
 *         description: Operator deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a manager
 *       404:
 *         description: Operator not found
 */
router.delete('/operators/:operatorId', authMiddleware, roleMiddleware(['MANAGER']), deleteOperator);

export default router;