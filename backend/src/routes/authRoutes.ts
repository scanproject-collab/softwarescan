import { Router, Request, Response, RequestHandler } from 'express';
import { registerController, loginController, verifyResetCodeController } from '../controllers/authController';
import { generateResetPasswordCode, resetPassword } from '../service/authService';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);

router.post('/password-recovery/request', (async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const response = await generateResetPasswordCode(email);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}) as RequestHandler);

router.post('/password-recovery/verify-code', (verifyResetCodeController as RequestHandler));

router.post('/password-recovery/reset', (async (req: Request, res: Response) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'Email, reset code, and new password are required' });
    }
    const response = await resetPassword(email, resetCode, newPassword);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}) as RequestHandler);

export default router;