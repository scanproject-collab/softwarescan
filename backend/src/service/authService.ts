import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { sendResetPasswordEmail, sendWelcomeEmail, sendPendingApprovalEmail } from './mailer';
import { sendExpoPushNotification } from './expoNotification';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

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
    
    if (!password) {
      throw new Error('A senha é obrigatória para registrar o usuário');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.verificationCode !== verificationCode || (user.verificationCodeExpiresAt && user.verificationCodeExpiresAt < new Date())) {
      throw new Error('Código de verificação inválido ou expirado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const validRoles: Role[] = ['ADMIN', 'OPERATOR', 'MANAGER'];
    const userRole = validRoles.includes(role as Role) ? role : 'OPERATOR';

    const expiresAt = userRole === 'OPERATOR' ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) : null;

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        name,
        password: hashedPassword,
        role: userRole as Role,
        isPending: userRole === 'OPERATOR',
        expiresAt,
        playerId,
        institutionId,
        verificationCode: null, 
        verificationCodeExpiresAt: null,
      },
    });

    console.log('PlayerId do usuário atualizado:', updatedUser.playerId); 

    if (userRole === 'OPERATOR' && expiresAt) {
      await prisma.notification.create({
        data: {
          type: 'pending',
          message: `${updatedUser.name || 'Usuário'} está aguardando aprovação.`,
          userId: updatedUser.id,
        },
      });

      await sendPendingApprovalEmail(email, name, expiresAt);
      if (playerId) {
        console.log('Enviando notificação para playerId:', playerId);  
        await sendExpoPushNotification(
          playerId,
          'Conta Pendente de Aprovação',
          `Olá, ${name}! Sua conta foi registrada e está aguardando aprovação. Você será notificado quando for aprovada.`,
          { type: 'pending_account' }
        );
      }
    } else {
      await sendWelcomeEmail(email, name, userRole);
    }

    return updatedUser;
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
      throw new Error('User not found');
    }

    if (user.isPending) {
      throw new Error('Account is pending approval');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId,
        createdAt: user.createdAt,
        institution: user.institution ? { title: user.institution.title } : null,
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { user, token };
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