import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { sendResetPasswordEmail, sendWelcomeEmail } from './mailer';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: string = 'OPERATOR',
  playerId?: string,
  institutionId?: string 
) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const validRoles: Role[] = ['ADMIN', 'OPERATOR', 'MANAGER'];
    const userRole = validRoles.includes(role as Role) ? role : 'OPERATOR';

    const expiresAt = userRole === 'OPERATOR' ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) : null;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole as Role,
        isPending: userRole === 'OPERATOR',
        expiresAt,
        playerId,
        institutionId, 
      },
    });

    if (userRole !== 'OPERATOR') {
      await sendWelcomeEmail(email, name);
    }

    return user;
  } catch (error: any) {
    throw new Error(`Error registering user: ${error.message}`);
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { institution: true }, // Inclui a instituição, se existir
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
        institution: user.institution ? { title: user.institution.title } : null, // Inclui o título da instituição
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

    await prisma.user.update({
      where: { email },
      data: { resetCode },
    });

    await sendResetPasswordEmail(email, resetCode);

    return { message: 'Reset password code sent to your email' };
  } catch (error: any) {
    throw new Error(`Error generating reset code: ${error.message}`);
  }
};

export const resetPassword = async (email: string, resetCode: string, newPassword: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }
    if (user.resetCode !== resetCode) {
      throw new Error('Invalid reset code');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, resetCode: null },
    });

    return { message: 'Password successfully reset' };
  } catch (error: any) {
    throw new Error(`Error resetting password: ${error.message}`);
  }
};