import { Router, Response, NextFunction } from 'express';
import { listAllOperators, deleteOperatorByAdmin, listPendingOperators, approveOperator, rejectOperator, updateAdminAccount, listNotifications, deleteExpiredOperators } from '../controllers/adminController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { CustomRequest } from '../middlewares/authMiddleware';
import { listAllPosts } from "../controllers/postController";

const router = Router();


const verifyCronSecret = (req: CustomRequest, res: Response, next: NextFunction) => {
    const cronSecret = req.headers['x-cron-secret'];
    const expectedSecret = process.env.CRON_SECRET || '6QJqfafr5Qdzjyq';

    if (cronSecret !== expectedSecret) {
        return res.status(403).json({ message: 'Unauthorized: Invalid cron secret' });
    }

    next();
};

router.post('/delete-expired-operators', verifyCronSecret, async (_req: CustomRequest, res: Response) => {
    try {
        await deleteExpiredOperators();
        res.status(200).json({ message: 'Expired operators deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting expired operators: ' + (error as any).message });
    }
});

router.get(
    '/operators',
    authMiddleware,
    roleMiddleware(['ADMIN', 'MANAGER']),
    async (req: CustomRequest, res: Response) => {
        await listAllOperators(req, res);
    }
);

router.delete(
    '/operator/:operatorId',
    authMiddleware,
    roleMiddleware(['ADMIN']),
    async (req: CustomRequest, res: Response) => {
        await deleteOperatorByAdmin(req, res);
    }
);

router.get('/pending-operators', authMiddleware, roleMiddleware(['ADMIN']), listPendingOperators);
router.post('/approve-operator/:operatorId', authMiddleware, roleMiddleware(['ADMIN']), approveOperator);
router.delete('/reject-operator/:operatorId', authMiddleware, roleMiddleware(['ADMIN']), rejectOperator);
router.get('/listAllPosts', authMiddleware, roleMiddleware(['ADMIN']), listAllPosts);
router.get('/notifications', authMiddleware, roleMiddleware(['ADMIN']), listNotifications);

router.put(
    '/update',
    authMiddleware,
    roleMiddleware(['ADMIN']),
    async (req: CustomRequest, res: Response) => {
        await updateAdminAccount(req, res);
    }
);

export default router;