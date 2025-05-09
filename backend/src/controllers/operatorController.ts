import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface RequestWithUser extends Request {
  user?: { id: string };
}

export const updateOperatorAccount = async (req: RequestWithUser, res: Response) => {
  const { email, name, currentPassword, newPassword, verificationCode } = req.body;

  if (!req.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { institution: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const data: any = {};

    if (name) {
      data.name = name;
    }

    // Handle email update with verification
    if (email && email !== user.email) {
      // If changing email, verification code is required
      if (!verificationCode) {
        return res.status(400).json({ message: 'Código de verificação é obrigatório para alterar o email' });
      }

      // Verify the code
      const verification = await prisma.verificationCode.findFirst({
        where: {
          email: email,
          code: verificationCode,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (!verification) {
        return res.status(400).json({ message: 'Código de verificação inválido ou expirado' });
      }

      // Check if the new email is already in use by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email,
          id: {
            not: user.id
          }
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Este email já está em uso por outro usuário' });
      }

      // Email verification successful, update the email
      data.email = email;

      // Delete the verification code
      await prisma.verificationCode.delete({
        where: {
          id: verification.id
        }
      });
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'A senha atual é obrigatória para alterar a senha' });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password || '');
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'A senha atual está incorreta' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'A nova senha deve ter pelo menos 8 caracteres' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      data.password = hashedPassword;
    }


    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data,
      include: { institution: true },
    });


    const token = jwt.sign(
      {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        institutionId: updatedUser.institutionId,
        createdAt: updatedUser.createdAt,
        institution: updatedUser.institution ? { title: updatedUser.institution.title } : null,
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Account updated successfully', user: updatedUser, token });
  } catch (error: any) {
    res.status(400).json({ message: `Error updating account: ${error?.message || 'Unknown error'}` });
  }
};

export const deleteOperatorAccount = async (req: RequestWithUser, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await prisma.user.delete({
      where: { id: req.user.id },
    });
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: `Error deleting account: ${error?.message || 'Unknown error'}` });
  }
};