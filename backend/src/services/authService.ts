import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendWelcomeEmail, sendResetPasswordEmail, sendPendingApprovalEmail } from './mailer';
import { sendOneSignalNotification } from './oneSignalNotification';


const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

prisma.$connect()
  .then(() => console.log('Database connection established successfully'))
  .catch(e => console.error('Database connection failed:', e));

const JWT_SECRET = process.env.SECRET_KEY_SESSION || 'your_jwt_secret_key';

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: string = 'OPERATOR',
  playerId?: string,
  institutionId?: string,
  verificationCode?: string
) => {
  try {
    console.log('Register user called with playerId:', playerId);

    if (!password) {
      throw new Error('A senha é obrigatória para registrar o usuário');
    }

    if (!institutionId) {
      throw new Error('É necessário selecionar uma instituição');
    }

    // Check for existing user with this email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.password) {
      throw new Error('Este email já está em uso por um usuário ativo');
    }

    // Verify the code from the verification codes table
    const verification = await prisma.verificationCode.findUnique({ where: { email } });
    if (!verification || verification.code !== verificationCode || verification.expiresAt < new Date()) {
      throw new Error('Código de verificação inválido ou expirado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const validRoles: Role[] = ['ADMIN', 'OPERATOR', 'MANAGER'];
    const userRole = validRoles.includes(role as Role) ? role : 'OPERATOR';

    const expiresAt = userRole === 'OPERATOR' ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) : null;

    // Create the user if verification is successful
    const userData = {
      name,
      password: hashedPassword,
      role: userRole as Role,
      isPending: userRole === 'OPERATOR',
      expiresAt,
      playerId: playerId || null,
      institutionId,
    };

    console.log('Creating/updating user with data:', {
      ...userData,
      password: '[REDACTED]'  // Don't log the password
    });

    const newUser = existingUser
      ? await prisma.user.update({
        where: { email },
        data: userData,
      })
      : await prisma.user.create({
        data: {
          email,
          ...userData,
        },
      });

    // Delete the verification code after successful use
    await prisma.verificationCode.delete({ where: { email } });

    console.log('PlayerId do usuário atualizado:', newUser.playerId);

    if (userRole === 'OPERATOR' && expiresAt) {
      await prisma.notification.create({
        data: {
          type: 'pending',
          message: `${newUser.name || 'Usuário'} está aguardando aprovação.`,
          userId: newUser.id,
        },
      });

      await sendPendingApprovalEmail(email, name, expiresAt);
      if (playerId) {
        console.log('Enviando notificação para playerId:', playerId);
        await sendOneSignalNotification(
          playerId,
          'Conta Pendente de Aprovação',
          `Olá, ${name}! Sua conta foi registrada e está aguardando aprovação. Você será notificado quando for aprovada.`,
          { type: 'pending_account' }
        );
      } else {
        console.log('Não foi enviada notificação porque playerId é null ou undefined');
      }
    } else {
      await sendWelcomeEmail(email, name, userRole);
    }

    return newUser;
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error.message);
    throw new Error(`Erro ao registrar usuário: ${error.message}`);
  }
};


export const loginUser = async (email: string, password: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { institution: true },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (user.isPending) {
      throw new Error('A conta está pendente de aprovação');
    }

    if (!user.password) {
      throw new Error('Usuário não tem senha definida');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Senha inválida');
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginDate: new Date()
      },
      include: { institution: true }
    });

    const token = jwt.sign(
      {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        institutionId: updatedUser.institutionId,
        createdAt: updatedUser.createdAt,
        lastLoginDate: updatedUser.lastLoginDate,
        institution: updatedUser.institution ? { title: updatedUser.institution.title } : null,
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { user: updatedUser, token };
  } catch (error: any) {
    throw new Error(`Error logging in: ${error.message}`);
  }
};

export const generateResetPasswordCode = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    const resetCode = crypto.randomBytes(3).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { passwordResetCode: resetCode, resetCodeExpiresAt: expiresAt },
    });

    await sendResetPasswordEmail(email, resetCode);

    return { message: 'Reset password code sent to your email' };
  } catch (error: any) {
    throw new Error(`Error generating reset code: ${error.message}`);
  }
};

export const verifyResetCode = async (email: string, resetCode: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }
    if (user.passwordResetCode !== resetCode) {
      throw new Error('Invalid reset code');
    }
    if (user.resetCodeExpiresAt && user.resetCodeExpiresAt < new Date()) {
      throw new Error('Reset code has expired');
    }
    return { message: 'Reset code verified' };
  } catch (error: any) {
    throw new Error(`Error verifying reset code: ${error.message}`);
  }
};

export const resetPassword = async (email: string, resetCode: string, newPassword: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }
    if (user.passwordResetCode !== resetCode) {
      throw new Error('Invalid reset code');
    }
    if (user.resetCodeExpiresAt && user.resetCodeExpiresAt < new Date()) {
      throw new Error('Reset code has expired');
    }
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, passwordResetCode: null, resetCodeExpiresAt: null },
    });

    return { message: 'Password successfully reset' };
  } catch (error: any) {
    throw new Error(`Error resetting password: ${error.message}`);
  }
};