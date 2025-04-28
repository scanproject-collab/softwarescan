import { Request, Response } from 'express';
import { registerUser, loginUser, verifyResetCode } from '../services/authService';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const prisma = new PrismaClient();

export const registerController = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, playerId, institutionId, verificationCode } = req.body;
    const user = await registerUser(name, email, password, role, playerId, institutionId, verificationCode);
    res.status(201).json({ message: 'Usuário registrado com sucesso', user });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { user, token } = await loginUser(email, password);
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId,
        createdAt: user.createdAt,
        institution: user.institution ? { title: user.institution.title } : null,
      },
      token,
    });
  } catch (error) {
    res.status(401).json({ message: 'Login failed: ' + (error as Error).message });
  }
};

export const verifyResetCodeController = async (req: Request, res: Response) => {
  try {
    const { email, resetCode } = req.body;
    if (!email || !resetCode) {
      return res.status(400).json({ message: 'Email and reset code are required' });
    }
    const response = await verifyResetCode(email, resetCode);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const verifyTokenController = async (req: Request & { user?: any }, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Token inválido ou usuário não encontrado" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!existingUser) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    res.status(200).json({ message: "Token válido", user: existingUser });
  } catch (error) {
    res.status(401).json({ message: "Erro ao verificar o token: " + (error as Error).message });
  }
};

export const updateUserProfileController = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Não autorizado" });
    }

    // Buscar o usuário atual
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Se o currentPassword foi fornecido, verificar se está correto
    if (currentPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password || '');
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Senha atual incorreta" });
      }
    }

    // Dados para atualizar
    const updateData: any = {};
    
    if (name) updateData.name = name;
    
    // Verificar se o email está sendo alterado e se não está em uso
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Este email já está em uso" });
      }
      updateData.email = email;
    }
    
    // Se uma nova senha foi fornecida e a senha atual estava correta
    if (newPassword && currentPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Atualizar o perfil do usuário
    if (Object.keys(updateData).length > 0) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          institutionId: true,
          institution: {
            select: {
              title: true
            }
          }
        }
      });

      return res.status(200).json({
        message: "Perfil atualizado com sucesso",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          institutionId: updatedUser.institutionId,
          institution: updatedUser.institution ? { title: updatedUser.institution.title } : null,
        }
      });
    } else {
      return res.status(400).json({ message: "Nenhum dado fornecido para atualização" });
    }
  } catch (error) {
    res.status(400).json({ message: "Erro ao atualizar perfil: " + (error as Error).message });
  }
};