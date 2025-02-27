import { Router } from 'express';
import { listOperatorsForManager } from '../controllers/managerController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/operators', authMiddleware, roleMiddleware(['MANAGER']), listOperatorsForManager);

export default router;
