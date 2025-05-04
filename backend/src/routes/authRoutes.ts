import express, { Router, Request, Response } from 'express';
import { registerController, loginController, verifyResetCodeController, verifyTokenController, updateUserProfileController } from '../controllers/authController';
import { generateResetPasswordCode, resetPassword } from '../services/authService';
import { authMiddleware } from '../middlewares/authMiddleware';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { sendVerificationEmail } from '../services/mailer';

const prisma = new PrismaClient();
const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with the system
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - verificationCode
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *               verificationCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or verification code
 */
router.post('/register', registerController);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login to the system
 *     description: Authenticate user and generate JWT token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginController);

// Send verification code for new users
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
    return res.status(200).json({ message: 'Código de verificação enviado para o seu email' });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
});

// Generate verification code for admin-created users
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

    return res.status(200).json({
      message: 'Código de verificação gerado com sucesso',
      verificationCode: verificationCode  // Return the code to the admin
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
});

// Request password recovery
router.post('/password-recovery/request', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const response = await generateResetPasswordCode(email);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
});

// Verify reset code
router.post('/password-recovery/verify-code', verifyResetCodeController);

// Reset password with verified code
router.post('/password-recovery/reset', async (req: Request, res: Response) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'Email, reset code, and new password are required' });
    }
    const response = await resetPassword(email, resetCode, newPassword);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
});

// Verify authentication token
router.get('/verify-token', authMiddleware, verifyTokenController);

// Update user profile
router.put('/update-profile', authMiddleware, updateUserProfileController);

/**
 * @swagger
 * /auth/version:
 *   get:
 *     summary: Get latest app version
 *     description: Returns the latest app version information
 *     responses:
 *       200:
 *         description: Version information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 version:
 *                   type: string
 *                 required:
 *                   type: boolean
 */
router.get('/version', (req, res) => {
  // Return the latest version information
  res.json({
    version: "3.0.0",
    required: false
  });
});

export default router;