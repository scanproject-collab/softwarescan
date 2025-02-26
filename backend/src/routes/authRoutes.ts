import { Router } from 'express';
import { registerController, loginController, verifyEmailController } from '../controllers/authController';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/verify-email', verifyEmailController);

export default router;
