import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface RequestWithUser extends Request {
  user?: { id: string };
}

export const updateOperatorAccount = async (req: RequestWithUser, res: Response) => {
  const { email, name, currentPassword, newPassword } = req.body;

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
    if (email) {
      data.email = email;
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