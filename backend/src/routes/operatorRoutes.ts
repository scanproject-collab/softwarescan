import { Router, RequestHandler } from 'express';
import { updateOperatorAccount, deleteOperatorAccount } from '../controllers/operatorController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.put('/update', authMiddleware, roleMiddleware(['OPERATOR']), updateOperatorAccount as unknown as RequestHandler);
router.delete('/delete', authMiddleware, deleteOperatorAccount as unknown as RequestHandler);

export default router;
