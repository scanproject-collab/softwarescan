import { Router, Response } from 'express';
import { listAllOperators, deleteOperatorByAdmin, listPendingOperators, approveOperator, rejectOperator } from '../controllers/adminController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { CustomRequest } from '../middlewares/authMiddleware';

const router = Router();

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

export default router;