import { Router, Request, Response, RequestHandler } from 'express';
import { registerController, loginController, verifyResetCodeController, verifyTokenController } from '../controllers/authController';
import { generateResetPasswordCode, resetPassword } from '../services/authService';
import { authMiddleware } from '../middlewares/authMiddleware';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { sendVerificationEmail } from '../services/mailer';

const prisma = new PrismaClient();
const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);

router.post('/send-verification-code', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    const code = crypto.randomBytes(3).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.upsert({
      where: { email },
      update: {
        verificationCode: code,
        verificationCodeExpiresAt: expiresAt,
      },
      create: {
        email,
        verificationCode: code,
        verificationCodeExpiresAt: expiresAt,
        role: 'OPERATOR',
        isPending: true,
      },
    });

    await sendVerificationEmail(email, code);
    res.status(200).json({ message: 'Código de verificação enviado para o seu email' });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.post('/generate-verification-code', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.password) {
      return res.status(400).json({ message: 'Email já está em uso por um usuário ativo' });
    }

    const verificationCode = crypto.randomBytes(3).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours for admins to complete setup

    await prisma.user.upsert({
      where: { email },
      update: {
        verificationCode: verificationCode,
        verificationCodeExpiresAt: expiresAt,
      },
      create: {
        email,
        verificationCode: verificationCode,
        verificationCodeExpiresAt: expiresAt,
        role: 'MANAGER', // Default to MANAGER, will be confirmed in create function
        isPending: false,
      },
    });

    res.status(200).json({ 
      message: 'Código de verificação gerado com sucesso',
      verificationCode: verificationCode  // Return the code to the admin
    });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

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

router.get('/verify-token', authMiddleware, verifyTokenController);

export default router;