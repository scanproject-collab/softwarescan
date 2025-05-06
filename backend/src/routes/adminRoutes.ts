import { Router, Response, NextFunction } from 'express';
import {
    listAllOperators,
    deleteOperatorByAdmin,
    listPendingOperators,
    approveOperator,
    rejectOperator,
    updateAdminAccount,
    listNotifications,
    deleteExpiredOperators,
    listAllManagers,
    createManager,
    updateManagerInstitution,
    deleteManager,
    getOperatorDetailsByAdmin,
    updateOperatorByAdmin,
    createOperatorByAdmin
} from '../controllers/adminController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { CustomRequest } from '../middlewares/authMiddleware';
import { listAllPosts } from "../controllers/postController";

const router = Router();

const verifyCronSecret = (req: CustomRequest, res: Response, next: NextFunction) => {
    const cronSecret = req.headers['x-cron-secret'];
    const expectedSecret = process.env.CRON_SECRET_KEY || '6QJqfafr5Qdzjyq';

    if (cronSecret !== expectedSecret) {
        return res.status(403).json({ message: 'Unauthorized: Invalid cron secret' });
    }

    next();
};

/**
 * @openapi
 * /admin/cron/expired-operators:
 *   post:
 *     summary: Delete expired operators
 *     description: Remove pending operators that have expired verification codes
 *     tags:
 *       - Admin
 *     security:
 *       - cronSecret: []
 *     responses:
 *       200:
 *         description: Expired operators deleted successfully
 *       403:
 *         description: Unauthorized - Invalid cron secret
 */
router.post('/cron/expired-operators', verifyCronSecret, async (_req: CustomRequest, res: Response) => {
    try {
        await deleteExpiredOperators();
        res.status(200).json({ message: 'Expired operators deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting expired operators: ' + (error as any).message });
    }
});

/**
 * @openapi
 * /admin/operators:
 *   get:
 *     summary: List all operators
 *     description: Retrieve a list of all operators in the system
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all operators
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin or manager
 */
router.get('/operators', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), async (req: CustomRequest, res: Response) => {
    await listAllOperators(req, res);
});

/**
 * @openapi
 * /admin/operators/{operatorId}:
 *   delete:
 *     summary: Delete an operator
 *     description: Delete an operator from the system
 *     tags:
 *       - Admin
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
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Operator not found
 */
router.delete('/operators/:operatorId', authMiddleware, roleMiddleware(['ADMIN']), async (req: CustomRequest, res: Response) => {
    await deleteOperatorByAdmin(req, res);
});

/**
 * @openapi
 * /admin/operators/pending:
 *   get:
 *     summary: List pending operators
 *     description: Retrieve a list of pending operators awaiting approval
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending operators
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 */
router.get('/operators/pending', authMiddleware, roleMiddleware(['ADMIN']), listPendingOperators);

/**
 * @openapi
 * /admin/operators/{operatorId}/approve:
 *   post:
 *     summary: Approve an operator
 *     description: Approve a pending operator's registration
 *     tags:
 *       - Admin
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
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Operator not found
 */
router.post('/operators/:operatorId/approve', authMiddleware, roleMiddleware(['ADMIN']), approveOperator);

/**
 * @openapi
 * /admin/operators/{operatorId}/reject:
 *   delete:
 *     summary: Reject an operator
 *     description: Reject a pending operator's registration
 *     tags:
 *       - Admin
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
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Operator not found
 */
router.delete('/operators/:operatorId/reject', authMiddleware, roleMiddleware(['ADMIN']), rejectOperator);

/**
 * @openapi
 * /admin/operators/{operatorId}:
 *   get:
 *     summary: Get operator details
 *     description: Retrieve detailed information about a specific operator
 *     tags:
 *       - Admin
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
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Operator not found
 */
router.get('/operators/:operatorId', authMiddleware, roleMiddleware(['ADMIN']), getOperatorDetailsByAdmin);

/**
 * @openapi
 * /admin/operators/{operatorId}:
 *   put:
 *     summary: Update operator
 *     description: Update an operator's information
 *     tags:
 *       - Admin
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
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Operator not found
 */
router.put('/operators/:operatorId', authMiddleware, roleMiddleware(['ADMIN']), updateOperatorByAdmin);

/**
 * @openapi
 * /admin/operators/create:
 *   post:
 *     summary: Create a new operator
 *     description: Create a new operator account (admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the operator
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the operator
 *               password:
 *                 type: string
 *                 description: Password for the operator
 *               institutionId:
 *                 type: string
 *                 description: Optional ID of the institution to assign the operator to
 *     responses:
 *       201:
 *         description: Operator created successfully
 *       400:
 *         description: Invalid input or missing required fields
 *       401:
 *         description: Unauthorized - Not an admin
 */
router.post('/operators/create', authMiddleware, roleMiddleware(['ADMIN']), createOperatorByAdmin);

/**
 * @openapi
 * /admin/posts:
 *   get:
 *     summary: List all posts
 *     description: Retrieve a list of all posts in the system
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all posts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 */
router.get('/posts', authMiddleware, roleMiddleware(['ADMIN']), listAllPosts);

/**
 * @openapi
 * /admin/notifications:
 *   get:
 *     summary: List notifications
 *     description: Retrieve a list of notifications for the admin
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin or manager
 */
router.get('/notifications', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), listNotifications);

/**
 * @openapi
 * /admin/profile:
 *   put:
 *     summary: Update admin profile
 *     description: Update the current admin's account information
 *     tags:
 *       - Admin
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
 *         description: Admin profile updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 */
router.put('/profile', authMiddleware, roleMiddleware(['ADMIN']), async (req: CustomRequest, res: Response) => {
    await updateAdminAccount(req, res);
});

/**
 * @openapi
 * /admin/managers:
 *   get:
 *     summary: List all managers
 *     description: Retrieve a list of all managers in the system
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all managers
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 */
router.get('/managers', authMiddleware, roleMiddleware(['ADMIN']), async (req: CustomRequest, res: Response) => {
    await listAllManagers(req, res);
});

/**
 * @openapi
 * /admin/managers:
 *   post:
 *     summary: Create a manager
 *     description: Create a new manager account in the system
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - institutionId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               institutionId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Manager created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 */
router.post('/managers', authMiddleware, roleMiddleware(['ADMIN']), async (req: CustomRequest, res: Response) => {
    await createManager(req, res);
});

/**
 * @openapi
 * /admin/managers/{managerId}/institution:
 *   put:
 *     summary: Update manager's institution
 *     description: Change the institution a manager is assigned to
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: managerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the manager
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - institutionId
 *             properties:
 *               institutionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Manager's institution updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Manager or institution not found
 */
router.put('/managers/:managerId/institution', authMiddleware, roleMiddleware(['ADMIN']), async (req: CustomRequest, res: Response) => {
    await updateManagerInstitution(req, res);
});

/**
 * @openapi
 * /admin/managers/{managerId}:
 *   delete:
 *     summary: Delete a manager
 *     description: Remove a manager from the system
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: managerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the manager to delete
 *     responses:
 *       200:
 *         description: Manager deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Manager not found
 */
router.delete('/managers/:managerId', authMiddleware, roleMiddleware(['ADMIN']), async (req: CustomRequest, res: Response) => {
    await deleteManager(req, res);
});

export default router;      