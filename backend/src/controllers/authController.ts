import { Request, Response } from 'express';
import { registerUser, loginUser, verifyEmail } from '../service/authService'; 

export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userRecord = await registerUser(email, password);
    res.status(201).json({ message: 'User registered successfully', user: userRecord });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email);
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const verifyEmailController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    await verifyEmail(userId);
    res.status(200).json({ message: 'Verification link sent successfully' });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
