import { Router, Request, Response, NextFunction } from 'express';
import { createInstitution, updateInstitution, deleteInstitution, listInstitutions } from '../controllers/institutionController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { CustomRequest } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
	await createInstitution(req as CustomRequest, res);
  } catch (error) {
	next(error);
  }
});

router.put('/:institutionId', authMiddleware, roleMiddleware(['ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
	await updateInstitution(req as CustomRequest, res);
  } catch (error) {
	next(error);
  }
});

router.delete('/:institutionId', authMiddleware, roleMiddleware(['ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
	await deleteInstitution(req as CustomRequest, res);
  } catch (error) {
	next(error);
  }
});

router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
	await listInstitutions(req as CustomRequest, res);
  } catch (error) {
	next(error);
  }
});

export default router;