import { Request, Response } from 'express';
import { registerUser, loginUser } from '../service/authService';
import axios from "axios";

import dotenv from 'dotenv';
dotenv.config();

export const registerController = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await registerUser(name, email, password, role);

    if (user.role === 'OPERATOR' && user.isPending) {
      try {
        const response = await axios.post(
          'https://onesignal.com/api/v1/notifications',
          {
            app_id: process.env.ONESIGNAL_APP_ID,
            included_segments: ['All'], // Temporário para teste
            contents: { en: `Novo pedido de cadastro: ${name} (${email})` },
            data: { userId: user.id, email },
          },
          {
            headers: {
              Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Notificação enviada com sucesso:', response.data);
      } catch (error) {
        console.error('Erro ao enviar notificação ao OneSignal:', error.response?.data || error.message);
        // Não interrompe o fluxo, apenas loga o erro
      }
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