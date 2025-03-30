import { Request, Response } from 'express';
import { registerUser, loginUser, verifyResetCode } from '../services/authService';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

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