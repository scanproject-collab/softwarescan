import { Router, Response } from 'express';
import { listAllOperators, deleteOperatorByAdmin } from '../controllers/adminController';
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

export default router;