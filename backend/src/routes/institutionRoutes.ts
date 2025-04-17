import { Router, Request, Response, NextFunction } from 'express';
import { createInstitution, updateInstitution, deleteInstitution, listInstitutions } from '../controllers/institutionController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { CustomRequest } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createInstitution(req as CustomRequest, res);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateInstitution(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteInstitution(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await listInstitutions(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;