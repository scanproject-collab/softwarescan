import { Router, Response, NextFunction } from 'express';
import { createPost, listUserPosts, getPostById, uploadImage, deletePost } from '../controllers/postController';
import { authMiddleware, roleMiddleware, CustomRequest } from '../middlewares/authMiddleware';

const router = Router();

router.post('/create', authMiddleware, roleMiddleware(['OPERATOR, ADMIN']), uploadImage, async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    await createPost(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/my-posts', authMiddleware, roleMiddleware(['OPERATOR']), async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    await listUserPosts(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/:postId', authMiddleware, roleMiddleware(['OPERATOR, ADMIN']), async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    await getPostById(req, res);
  } catch (err) {
    next(err);
  }
});

router.delete('/:postId', authMiddleware, roleMiddleware(['OPERATOR, ADMIN']), async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    await deletePost(req, res);
  } catch (err) {
    next(err);
  }
});



export default router;
