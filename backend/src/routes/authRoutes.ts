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

/**
 * @openapi
 * /auth/send-verification-code:
 *   post:
 *     summary: Send verification code to email
 *     description: Sends a verification code to the provided email address for new user registration
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Email is already in use or is missing
 */
// Send verification code for new users
router.post('/send-verification-code', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.password) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    const code = crypto.randomBytes(3).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // Extending to 30 minutes

    // Instead of creating a user, store the verification info in a separate table
    await prisma.verificationCode.upsert({
      where: { email },
      update: {
        code,
        expiresAt,
      },
      create: {
        email,
        code,
        expiresAt,
      },
    });

    await sendVerificationEmail(email, code);
    return res.status(200).json({ message: 'Código de verificação enviado para o seu email' });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
});

/**
 * @openapi
 * /auth/generate-verification-code:
 *   post:
 *     summary: Generate verification code for admin-created users
 *     description: Generates a verification code for user accounts created by administrators
 *     tags:
 *       - Authentication
 *       - Administration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 verificationCode:
 *                   type: string
 *       400:
 *         description: Email is already in use or is missing
 */
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

/**
 * @openapi
 * /auth/password-recovery/request:
 *   post:
 *     summary: Request password recovery
 *     description: Initiates the password recovery process by sending a reset code to the user's email
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Email is required or user not found
 */
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

/**
 * @openapi
 * /auth/password-recovery/verify-code:
 *   post:
 *     summary: Verify password reset code
 *     description: Verifies the reset code sent to the user's email for password recovery
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
 *               - resetCode
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               resetCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset code verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 verified:
 *                   type: boolean
 *       400:
 *         description: Email or reset code is missing
 *       401:
 *         description: Invalid or expired reset code
 */
// Verify reset code
router.post('/password-recovery/verify-code', verifyResetCodeController);

/**
 * @openapi
 * /auth/password-recovery/reset:
 *   post:
 *     summary: Reset password
 *     description: Resets the user's password using a verified reset code
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
 *               - resetCode
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               resetCode:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing required fields or invalid reset code
 */
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

/**
 * @openapi
 * /auth/verify-token:
 *   get:
 *     summary: Verify authentication token
 *     description: Verifies if the user's JWT token is valid and returns user information
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - invalid or expired token
 */
// Verify authentication token
router.get('/verify-token', authMiddleware, verifyTokenController);

/**
 * @openapi
 * /auth/update-profile:
 *   put:
 *     summary: Update user profile
 *     description: Updates the authenticated user's profile information
 *     tags:
 *       - Authentication
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - invalid or expired token
 *       400:
 *         description: Invalid input data
 */
// Update user profile
router.put('/update-profile', authMiddleware, updateUserProfileController);

/**
 * @openapi
 * /auth/version:
 *   get:
 *     summary: Get latest app version
 *     description: Returns the latest app version information
 *     tags:
 *       - Application
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