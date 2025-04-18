import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendWelcomeEmail, sendRejectionEmail, sendExpirationEmail } from '../services/mailer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendOneSignalNotification } from '../services/oneSignalNotification';

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

    await prisma.notification.create({
      data: {
        type: 'approved',
        message: `${user.name || 'Usuário'} foi aprovado.`,
        userId: user.id,
      },
    });

    await sendWelcomeEmail(user.email, user.name || 'User');

    if (user.playerId) {
      await sendOneSignalNotification(
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
    await prisma.post.deleteMany({
      where: { authorId: operatorId },
    });
    await prisma.polygon.deleteMany({
      where: { authorId: operatorId },
    });
    await prisma.notification.deleteMany({
      where: { userId: operatorId },
    });
    await prisma.user.delete({
      where: { id: operatorId },
    });

    await sendRejectionEmail(operator.email, operator.name);

    if (operator.playerId) {
      await sendOneSignalNotification(
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

        await prisma.post.deleteMany({
          where: { authorId: operator.id },
        });
        await prisma.polygon.deleteMany({
          where: { authorId: operator.id },
        });
        await prisma.notification.deleteMany({
          where: { userId: operator.id },
        });
        await prisma.user.delete({
          where: { id: operator.id },
        });

        await sendExpirationEmail(operator.email, operator.name || 'Usuário');
        if (operator.playerId) {
          await sendOneSignalNotification(
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
    await prisma.post.deleteMany({
      where: { authorId: operatorId },
    });
    await prisma.polygon.deleteMany({
      where: { authorId: operatorId },
    });

    await prisma.notification.deleteMany({
      where: { userId: operatorId },
    });

    await prisma.user.delete({
      where: { id: operatorId },
    });

    if (operator.playerId) {
      await sendOneSignalNotification(
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

export const listNotifications = async (req: RequestWithUser, res: Response) => {
  try {
    // Verificar se o usuário existe
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Buscar dados do usuário, incluindo sua data de criação
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { createdAt: true, role: true, institutionId: true }
    });

    if (!currentUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Definir condições para a consulta de notificações
    let whereCondition: any = {
      createdAt: { gte: currentUser.createdAt } // Apenas notificações após a criação do usuário
    };

    // Se for MANAGER, filtrar notificações relacionadas à instituição do usuário
    if (currentUser.role === 'MANAGER' && currentUser.institutionId) {
      whereCondition = {
        ...whereCondition,
        OR: [
          // Notificações gerais (não específicas de um usuário)
          { userId: null },
          // Notificações de usuários da mesma instituição
          { user: { institutionId: currentUser.institutionId } }
        ]
      };
    }

    const recordedNotifications = await prisma.notification.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: {
            name: true,
            institutionId: true,
            institution: {
              select: {
                title: true
              }
            }
          }
        }
      }
    });

    const allNotifications = recordedNotifications.map((notif) => ({
      id: notif.id,
      type: notif.type,
      message: notif.message,
      createdAt: notif.createdAt.toISOString(),
      userInfo: notif.user ? {
        name: notif.user.name,
        institution: notif.user.institution?.title || 'Desconhecida'
      } : null
    }));

    res.status(200).json({
      message: 'Notifications listed successfully',
      notifications: allNotifications,
    });
  } catch (error) {
    res.status(400).json({ message: 'Error listing notifications: ' + (error as any).message });
  }
};

export const listAllManagers = async (_req: Request, res: Response) => {
  try {
    const managers = await prisma.user.findMany({
      where: {
        role: 'MANAGER',
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

    const totalManagers = managers.length;

    const response = {
      message: 'Managers listed successfully',
      summary: {
        totalManagers,
      },
      managers: managers.map((manager) => ({
        id: manager.id,
        name: manager.name || 'Unnamed',
        email: manager.email,
        institution: manager.institution
          ? { id: manager.institution.id, title: manager.institution.title }
          : null,
        createdAt: manager.createdAt?.toISOString() ?? new Date().toISOString(),
        updatedAt: manager.updatedAt?.toISOString() ?? new Date().toISOString(),
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: 'Error listing managers: ' + (error as any).message });
  }
};

export const createManager = async (req: Request, res: Response) => {
  try {
    const { name, email, password, institutionId, verificationCode, role } = req.body;

    if (role !== 'MANAGER') {
      return res.status(400).json({ message: 'Invalid role. Must be MANAGER' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'User not found. Verification code must be generated first.' });
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const manager = await prisma.user.update({
      where: { email },
      data: {
        name,
        password: hashedPassword,
        role: 'MANAGER',
        isPending: false,
        institutionId,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    });

    await sendWelcomeEmail(email, name, 'MANAGER');

    res.status(201).json({
      message: 'Manager created successfully',
      manager: {
        id: manager.id,
        name: manager.name,
        email: manager.email,
        institutionId: manager.institutionId,
        createdAt: manager.createdAt?.toISOString() ?? new Date().toISOString(),
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating manager: ' + (error as any).message });
  }
};

export const updateManagerInstitution = async (req: Request, res: Response) => {
  try {
    const { managerId } = req.params;
    const { institutionId } = req.body;

    // Check if the institution exists if institutionId is provided
    if (institutionId) {
      const institution = await prisma.institution.findUnique({
        where: { id: institutionId },
      });
      if (!institution) {
        return res.status(400).json({ message: 'Institution not found' });
      }
    }

    const manager = await prisma.user.update({
      where: {
        id: managerId,
        role: 'MANAGER'
      },
      data: {
        institutionId: institutionId || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        institutionId: true,
        institution: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(200).json({
      message: 'Manager institution updated successfully',
      manager
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating manager institution: ' + (error as any).message });
  }
};

export const deleteManager = async (req: Request, res: Response) => {
  const { managerId } = req.params;

  try {
    const manager = await prisma.user.findUnique({
      where: {
        id: managerId,
        role: 'MANAGER'
      },
    });

    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    await prisma.user.delete({
      where: { id: managerId },
    });

    res.status(200).json({ message: 'Manager deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting manager: ' + (error as any).message });
  }
};