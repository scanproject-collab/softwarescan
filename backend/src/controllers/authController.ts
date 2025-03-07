import { Request, Response } from 'express';
import { registerUser, loginUser } from '../service/authService';
import { sendNotification } from '../utils/oneSignal';

import dotenv from 'dotenv';
dotenv.config();

export const registerController = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, playerId } = req.body;
    const user = await registerUser(name, email, password, role);

    if (user.role === 'OPERATOR' && user.isPending && playerId) {
      await sendNotification(
        [playerId],
        `Seu pedido de cadastro foi enviado: ${name} (${email}). Aguarde aprovação.`,
        { userId: user.id, email }
      );
    }

    res.status(201).json({ message: 'User registered successfully', user });
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
      user,
      token, 
    });
  } catch (error) {
    res.status(401).json({ message: 'Login failed: ' + (error as Error).message });
  }
};