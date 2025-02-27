import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RequestWithUser extends Request {
  user?: { id: string };
}

export const updateOperatorAccount = async (req: RequestWithUser, res: Response) => {
  const { email, name, password, institutionId } = req.body;
  
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        email,
        name,
        password, 
        institutionId,
      },
    });
    res.status(200).json({ message: 'Account updated successfully', user: updatedUser });
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
