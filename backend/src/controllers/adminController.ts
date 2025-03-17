import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendWelcomeEmail, sendRejectionEmail, sendExpirationEmail } from '../service/mailer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendExpoPushNotification } from '../service/expoNotification';

const prisma = new PrismaClient();

interface RequestWithUser extends Request {
  user?: { id: string; role: string };
}

export const listPendingOperators = async (_req: Request, res: Response) => {
  try {
    const pendingOperators = await prisma.user.findMany({
      where: { role: 'OPERATOR', isPending: true },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    res.status(200).json({
      message: 'Pending operators listed successfully',
      operators: pendingOperators.map((op) => ({
        id: op.id,
        name: op.name || 'Unnamed',
        email: op.email,
        createdAt: op.createdAt?.toISOString() ?? new Date().toISOString(),
        expiresAt: op.expiresAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    res.status(400).json({ message: 'Error listing pending operators: ' + (error as any).message });
  }
};

export const approveOperator = async (req: Request, res: Response) => {
  const { operatorId } = req.params;

  try {
    const user = await prisma.user.update({
      where: { id: operatorId, role: 'OPERATOR', isPending: true },
      data: { isPending: false, expiresAt: null },
    });

    // Registrar notificação de aprovação
    await prisma.notification.create({
      data: {
        type: 'approved',
        message: `${user.name || 'Usuário'} foi aprovado.`,
        userId: user.id,
      },
    });

    await sendWelcomeEmail(user.email, user.name || 'User');

    if (user.playerId) {
      await sendExpoPushNotification(
          user.playerId,
          'Conta Aprovada',
          `Parabéns, ${user.name}! Sua conta foi aprovada. Faça login para começar.`,
          { type: 'account_approved' }
      );
    }

    res.status(200).json({ message: 'Operator approved successfully', user });
  } catch (error) {
    res.status(400).json({ message: 'Error approving operator: ' + (error as any).message });
  }
};

export const rejectOperator = async (req: Request, res: Response) => {
  const { operatorId } = req.params;

  try {
    const operator = await prisma.user.findUnique({
      where: { id: operatorId, role: 'OPERATOR', isPending: true },
      select: { id: true, email: true, name: true, playerId: true },
    });

    if (!operator) {
      return res.status(404).json({ message: 'Operator not found or not pending' });
    }

    await prisma.notification.create({
      data: {
        type: 'rejected',
        message: `${operator.name || 'Usuário'} foi rejeitado.`,
        userId: operator.id,
      },
    });

    await prisma.user.delete({
      where: { id: operatorId },
    });

    await sendRejectionEmail(operator.email, operator.name);

    if (operator.playerId) {
      await sendExpoPushNotification(
          operator.playerId,
          'Conta Rejeitada',
          `Olá, ${operator.name || 'Usuário'}! Sua solicitação de registro foi rejeitada. Entre em contato com o suporte para mais informações.`,
          { type: 'account_rejected' }
      );
    }

    res.status(200).json({ message: 'Operator rejected and deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error rejecting operator: ' + (error as any).message });
  }
};

export const deleteExpiredOperators = async () => {
  try {
    const now = new Date();
    const expiredOperators = await prisma.user.findMany({
      where: {
        role: 'OPERATOR',
        isPending: true,
        expiresAt: { lte: now },
      },
      select: { id: true, email: true, name: true, playerId: true },
    });

    if (expiredOperators.length > 0) {

      for (const operator of expiredOperators) {
        await prisma.notification.create({
          data: {
            type: 'expired',
            message: `${operator.name || 'Usuário'} expirou.`,
            userId: operator.id,
          },
        });
      }

      await prisma.user.deleteMany({
        where: {
          id: { in: expiredOperators.map(op => op.id) },
        },
      });

      for (const operator of expiredOperators) {
        await sendExpirationEmail(operator.email, operator.name || 'Usuário');
        if (operator.playerId) {
          await sendExpoPushNotification(
              operator.playerId,
              'Conta Expirada',
              `Olá, ${operator.name || 'Usuário'}! Sua solicitação de registro expirou e foi removida. Entre em contato com o suporte se precisar de ajuda.`,
              { type: 'account_expired' }
          );
        }
      }

      console.log(`Deleted ${expiredOperators.length} expired pending operators`);
    } else {
      console.log('No expired operators found');
    }
  } catch (error) {
    console.error('Error deleting expired operators:', error);
  }
};

export const listAllOperators = async (_req: Request, res: Response) => {
  try {
    const operators = await prisma.user.findMany({
      where: {
        role: 'OPERATOR',
        isPending: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        institutionId: true,
        createdAt: true,
        updatedAt: true,
        institution: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const totalOperators = operators.length;

    const institutionBreakdown = operators.reduce((acc, op) => {
      const instId = op.institutionId || 'No Institution';
      const instTitle = op.institution?.title || 'Unassigned';
      acc[instId] = acc[instId] || { count: 0, name: instTitle };
      acc[instId].count += 1;
      return acc;
    }, {} as Record<string, { count: number; name: string }>);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOperators = operators.filter(
        (op) => op.createdAt && new Date(op.createdAt) >= sevenDaysAgo
    ).length;

    const response = {
      message: 'Operators listed successfully',
      summary: {
        totalOperators,
        recentOperators,
        institutionBreakdown: Object.entries(institutionBreakdown).map(
            ([id, { count, name }]) => ({
              institutionId: id === 'No Institution' ? null : id,
              institutionName: name,
              operatorCount: count,
            })
        ),
      },
      operators: operators.map((op) => ({
        id: op.id,
        name: op.name || 'Unnamed',
        email: op.email,
        institution: op.institution
            ? { id: op.institution.id, title: op.institution.title }
            : null,
        createdAt: op.createdAt?.toISOString() ?? new Date().toISOString(),
        updatedAt: op.updatedAt?.toISOString() ?? new Date().toISOString(),
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: 'Error listing operators: ' + (error as any).message });
  }
};

export const updateAdminAccount = async (req: RequestWithUser, res: Response) => {
  const { email, name, password } = req.body;

  if (!req.user?.id || req.user.role !== 'ADMIN') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const data: any = { email, name };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      data.password = hashedPassword;
    }

    const updatedAdmin = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    const token = jwt.sign(
        {
          id: updatedAdmin.id,
          email: updatedAdmin.email,
          name: updatedAdmin.name,
          role: updatedAdmin.role,
          institutionId: updatedAdmin.institutionId,
          createdAt: updatedAdmin.createdAt,
        },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: '1d' }
    );

    res.status(200).json({ message: 'Admin account updated successfully', user: updatedAdmin, token });
  } catch (error: any) {
    res.status(400).json({ message: `Error updating admin account: ${error?.message || 'Unknown error'}` });
  }
};

export const deleteOperatorByAdmin = async (req: Request, res: Response) => {
  const { operatorId } = req.params;

  try {
    const operator = await prisma.user.findUnique({
      where: { id: operatorId },
      select: { id: true, email: true, name: true, playerId: true },
    });

    if (!operator) {
      return res.status(404).json({ message: 'Operator not found' });
    }

    await prisma.notification.create({
      data: {
        type: 'deleted',
        message: `${operator.name || 'Usuário'} foi deletado por um administrador.`,
        userId: operator.id,
      },
    });

    await prisma.user.delete({
      where: { id: operatorId },
    });

    if (operator.playerId) {
      await sendExpoPushNotification(
          operator.playerId,
          'Conta Deletada',
          `Olá, ${operator.name || 'Usuário'}! Sua conta foi deletada por um administrador. Entre em contato com o suporte para mais informações.`,
          { type: 'account_deleted' }
      );
    }

    res.status(200).json({ message: 'Operator account deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting operator account: ' + (error as any).message });
  }
};

export const listNotifications = async (_req: Request, res: Response) => {
  try {
    const recordedNotifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const allNotifications = recordedNotifications.map((notif) => ({
      id: notif.id,
      type: notif.type,
      message: notif.message,
      createdAt: notif.createdAt.toISOString(),
    }));

    res.status(200).json({
      message: 'Notifications listed successfully',
      notifications: allNotifications,
    });
  } catch (error) {
    res.status(400).json({ message: 'Error listing notifications: ' + (error as any).message });
  }
};