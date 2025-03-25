// managerController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendWelcomeEmail, sendRejectionEmail } from '../service/mailer';
import { sendExpoPushNotification } from '../service/expoNotification';

const prisma = new PrismaClient();

interface RequestWithUser extends Request {
  user?: { id: string; role: string; institutionId?: string };
}

// Listar operadores da mesma instituição do manager
export const listOperatorsForManager = async (req: RequestWithUser, res: Response) => {
  if (!req.user?.institutionId) {
    return res.status(400).json({ message: 'Manager must belong to an institution' });
  }

  try {
    const operators = await prisma.user.findMany({
      where: {
        role: 'OPERATOR',
        institutionId: req.user.institutionId,
        isPending: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        institution: {
          select: { title: true },
        },
      },
    });

    const totalOperators = operators.length;

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
      },
      operators: operators.map((op) => ({
        id: op.id,
        name: op.name || 'Unnamed',
        email: op.email,
        institution: op.institution?.title || 'Unassigned',
        createdAt: op.createdAt?.toISOString() ?? new Date().toISOString(),
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: 'Error listing operators: ' + (error as any).message });
  }
};

// Listar operadores pendentes da mesma instituição do manager
export const listPendingOperatorsForManager = async (req: RequestWithUser, res: Response) => {
  if (!req.user?.institutionId) {
    return res.status(400).json({ message: 'Manager must belong to an institution' });
  }

  try {
    const pendingOperators = await prisma.user.findMany({
      where: {
        role: 'OPERATOR',
        isPending: true,
        institutionId: req.user.institutionId,
      },
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

// Aprovar operador pendente da mesma instituição
export const approveOperatorForManager = async (req: RequestWithUser, res: Response) => {
  const { operatorId } = req.params;

  if (!req.user?.institutionId) {
    return res.status(400).json({ message: 'Manager must belong to an institution' });
  }

  try {
    const user = await prisma.user.update({
      where: {
        id: operatorId,
        role: 'OPERATOR',
        isPending: true,
        institutionId: req.user.institutionId,
      },
      data: { isPending: false, expiresAt: null },
    });

    await prisma.notification.create({
      data: {
        type: 'approved',
        message: `${user.name || 'Usuário'} foi aprovado pelo manager.`,
        userId: user.id,
      },
    });

    await sendWelcomeEmail(user.email, user.name || 'User');

    if (user.playerId) {
      await sendExpoPushNotification(
          user.playerId,
          'Conta Aprovada',
          `Parabéns, ${user.name}! Sua conta foi aprovada pelo manager. Faça login para começar.`,
          { type: 'account_approved' }
      );
    }

    res.status(200).json({ message: 'Operator approved successfully', user });
  } catch (error) {
    res.status(400).json({ message: 'Error approving operator: ' + (error as any).message });
  }
};

// Rejeitar operador pendente da mesma instituição
export const rejectOperatorForManager = async (req: RequestWithUser, res: Response) => {
  const { operatorId } = req.params;

  if (!req.user?.institutionId) {
    return res.status(400).json({ message: 'Manager must belong to an institution' });
  }

  try {
    const operator = await prisma.user.findUnique({
      where: {
        id: operatorId,
        role: 'OPERATOR',
        isPending: true,
        institutionId: req.user.institutionId,
      },
      select: { id: true, email: true, name: true, playerId: true },
    });

    if (!operator) {
      return res.status(404).json({ message: 'Operator not found or not pending in your institution' });
    }

    await prisma.notification.create({
      data: {
        type: 'rejected',
        message: `${operator.name || 'Usuário'} foi rejeitado pelo manager.`,
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
          `Olá, ${operator.name || 'Usuário'}! Sua solicitação foi rejeitada pelo manager. Entre em contato com o suporte para mais informações.`,
          { type: 'account_rejected' }
      );
    }

    res.status(200).json({ message: 'Operator rejected and deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error rejecting operator: ' + (error as any).message });
  }
};

// Listar posts da mesma instituição do manager
export const listPostsForManager = async (req: RequestWithUser, res: Response) => {
  if (!req.user?.institutionId) {
    return res.status(400).json({ message: 'Manager must belong to an institution' });
  }

  try {
    const posts = await prisma.post.findMany({
      where: {
        author: {
          institutionId: req.user.institutionId,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            institution: {
              select: { title: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl,
      tags: post.tags,
      location: post.location,
      latitude: post.latitude,
      longitude: post.longitude,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      ranking: post.ranking,
      author: {
        id: post.author.id,
        name: post.author.name || 'Unnamed',
        email: post.author.email,
        institution: post.author.institution?.title || 'Unassigned',
      },
    }));

    res.status(200).json({
      message: 'Posts listed successfully',
      posts: formattedPosts,
    });
  } catch (error) {
    res.status(400).json({ message: 'Error listing posts: ' + (error as any).message });
  }
};

// Deletar post da mesma instituição do manager
export const deletePostForManager = async (req: RequestWithUser, res: Response) => {
  const { postId } = req.params;

  if (!req.user?.institutionId) {
    return res.status(400).json({ message: 'Manager must belong to an institution' });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.institutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Unauthorized: Post does not belong to your institution' });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    await prisma.notification.create({
      data: {
        type: 'post_deleted',
        message: `Post "${post.title}" foi deletado pelo manager.`,
        userId: post.authorId,
      },
    });

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting post: ' + (error as any).message });
  }
};

// Listar notificações relacionadas à instituição do manager
export const listNotificationsForManager = async (req: RequestWithUser, res: Response) => {
  if (!req.user?.institutionId) {
    return res.status(400).json({ message: 'Manager must belong to an institution' });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        user: {
          institutionId: req.user.institutionId,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const formattedNotifications = notifications.map((notif) => ({
      id: notif.id,
      type: notif.type,
      message: notif.message,
      createdAt: notif.createdAt.toISOString(),
    }));

    res.status(200).json({
      message: 'Notifications listed successfully',
      notifications: formattedNotifications,
    });
  } catch (error) {
    res.status(400).json({ message: 'Error listing notifications: ' + (error as any).message });
  }
};