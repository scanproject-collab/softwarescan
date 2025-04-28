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

router.get('/operators', authMiddleware, roleMiddleware(['MANAGER']), listOperatorsForManager);
router.get('/pending-operators', authMiddleware, roleMiddleware(['MANAGER']), listPendingOperatorsForManager);
router.post('/approve-operator/:operatorId', authMiddleware, roleMiddleware(['MANAGER']), approveOperatorForManager);
router.delete('/reject-operator/:operatorId', authMiddleware, roleMiddleware(['MANAGER']), rejectOperatorForManager);
router.get('/listAllPosts', authMiddleware, roleMiddleware(['MANAGER']), listPostsForManager);
router.delete('/posts/:postId', authMiddleware, roleMiddleware(['MANAGER']), deletePostForManager);
router.get('/notifications', authMiddleware, roleMiddleware(['MANAGER']), listNotificationsForManager);

// Rotas para gerenciamento de operadores
router.get('/operators/:operatorId', authMiddleware, roleMiddleware(['MANAGER']), getOperatorDetails);
router.put('/operators/:operatorId', authMiddleware, roleMiddleware(['MANAGER']), updateOperator);
router.delete('/operators/:operatorId', authMiddleware, roleMiddleware(['MANAGER']), deleteOperator);

export default router;