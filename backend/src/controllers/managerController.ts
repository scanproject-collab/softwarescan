import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendWelcomeEmail, sendRejectionEmail } from '../services/mailer';
import { sendOneSignalNotification } from '../services/oneSignalNotification';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface RequestWithUser extends Request {
  user?: { id: string; role: string; institutionId?: string };
}

export const listOperatorsForManager = async (req: RequestWithUser, res: Response) => {
  // If manager has no institution, return empty operators
  if (!req.user?.institutionId) {
    console.log('Manager without institution accessing operators list:', req.user?.id);
    return res.status(200).json({
      message: 'No operators available - Manager is not associated with any institution',
      operators: [],
    });
  }

  try {
    const operators = await prisma.user.findMany({
      where: {
        role: 'OPERATOR',
        institutionId: req.user.institutionId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isPending: true,
        createdAt: true,
        lastLoginDate: true,
        playerId: true,
        institution: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      message: 'Operators listed successfully',
      operators: operators.map(operator => ({
        id: operator.id,
        name: operator.name,
        email: operator.email,
        isPending: operator.isPending,
        createdAt: operator.createdAt,
        lastLoginDate: operator.lastLoginDate,
        institution: operator.institution?.title || null,
        hasPlayerId: !!operator.playerId
      })),
    });
  } catch (error) {
    res.status(400).json({ message: 'Error listing operators: ' + (error as any).message });
  }
};

export const listPendingOperatorsForManager = async (req: RequestWithUser, res: Response) => {
  // If manager has no institution, return empty pending operators
  if (!req.user?.institutionId) {
    console.log('Manager without institution accessing pending operators list:', req.user?.id);
    return res.status(200).json({
      message: 'No pending operators available - Manager is not associated with any institution',
      operators: [],
    });
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
      await sendOneSignalNotification(
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
        `Olá, ${operator.name || 'Usuário'}! Sua solicitação foi rejeitada pelo manager. Entre em contato com o suporte para mais informações.`,
        { type: 'account_rejected' }
      );
    }

    res.status(200).json({ message: 'Operator rejected and deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error rejecting operator: ' + (error as any).message });
  }
};

export const listPostsForManager = async (req: RequestWithUser, res: Response) => {
  // If manager has no institution, return empty posts list
  if (!req.user?.institutionId) {
    console.log('Manager without institution accessing posts list:', req.user?.id);
    return res.status(200).json({
      message: 'No posts available - Manager is not associated with any institution',
      posts: [],
    });
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

export const listNotificationsForManager = async (req: RequestWithUser, res: Response) => {
  // If manager has no institution, return empty notifications instead of error
  if (!req.user?.institutionId) {
    console.log('Manager without institution accessing notifications:', req.user?.id);
    return res.status(200).json({
      message: 'No notifications available - Manager is not associated with any institution',
      notifications: [],
    });
  }

  try {
    // Buscar dados do usuário, incluindo sua data de criação
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { createdAt: true, institutionId: true }
    });

    if (!currentUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        createdAt: { gte: currentUser.createdAt }, // Apenas notificações após a criação do usuário
        OR: [
          // Notificações gerais do sistema
          { userId: null },
          // Notificações de usuários da mesma instituição
          {
            user: {
              institutionId: currentUser.institutionId
            }
          }
        ]
      },
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

    const formattedNotifications = notifications.map((notif) => ({
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
      notifications: formattedNotifications,
    });
  } catch (error) {
    res.status(400).json({ message: 'Error listing notifications: ' + (error as any).message });
  }
};

export const getOperatorDetails = async (req: RequestWithUser, res: Response) => {
  if (!req.user?.institutionId) {
    return res.status(400).json({ message: 'Manager must belong to an institution' });
  }

  const { operatorId } = req.params;

  try {
    const operator = await prisma.user.findFirst({
      where: {
        id: operatorId,
        role: 'OPERATOR',
        institutionId: req.user.institutionId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isPending: true,
        createdAt: true,
        lastLoginDate: true,
      },
    });

    if (!operator) {
      return res.status(404).json({ message: 'Operator not found' });
    }

    const posts = await prisma.post.findMany({
      where: {
        authorId: operatorId,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        ranking: true,
      },
    });

    res.status(200).json({
      message: 'Operator details retrieved successfully',
      operator: {
        id: operator.id,
        name: operator.name || 'Unnamed',
        email: operator.email,
        isPending: operator.isPending,
        institution: req.user.institution?.title || 'Unassigned',
        createdAt: operator.createdAt?.toISOString() ?? new Date().toISOString(),
        lastLoginDate: operator.lastLoginDate?.toISOString() ?? null,
        postsCount: posts.length,
      },
      posts: posts.map(post => ({
        id: post.id,
        title: post.title,
        createdAt: post.createdAt.toISOString(),
        ranking: post.ranking,
      })),
    });
  } catch (error) {
    res.status(400).json({ message: 'Error retrieving operator details: ' + (error as any).message });
  }
};

export const updateOperator = async (req: RequestWithUser, res: Response) => {
  const { operatorId } = req.params;
  const { name, email, password, isActive } = req.body;

  if (!req.user?.institutionId) {
    return res.status(400).json({ message: 'Manager must belong to an institution' });
  }

  try {
    // Verificar se o operador existe e pertence à instituição do manager
    const operator = await prisma.user.findFirst({
      where: {
        id: operatorId,
        role: 'OPERATOR',
        institutionId: req.user.institutionId,
      },
    });

    if (!operator) {
      return res.status(404).json({ message: 'Operador não encontrado ou não pertence à sua instituição' });
    }

    // Verificar se o email está sendo alterado e não está em uso
    if (email && email !== operator.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Este email já está em uso' });
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }
    if (isActive !== undefined) {
      updateData.isPending = !isActive;
    }

    // Atualizar operador
    const updatedOperator = await prisma.user.update({
      where: { id: operatorId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        isPending: true,
        institution: {
          select: { title: true },
        },
      },
    });

    // Criar notificação para o operador
    await prisma.notification.create({
      data: {
        type: 'profile_updated',
        message: `Seu perfil foi atualizado pelo gerente.`,
        userId: operatorId,
      },
    });

    res.status(200).json({
      message: 'Operador atualizado com sucesso',
      operator: {
        id: updatedOperator.id,
        name: updatedOperator.name || 'Unnamed',
        email: updatedOperator.email,
        isActive: !updatedOperator.isPending,
        institution: updatedOperator.institution?.title || 'Unassigned',
      },
    });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar operador: ' + (error as any).message });
  }
};

export const deleteOperator = async (req: RequestWithUser, res: Response) => {
  const { operatorId } = req.params;

  if (!req.user?.institutionId) {
    return res.status(400).json({ message: 'Manager must belong to an institution' });
  }

  try {
    // Verificar se o operador existe e pertence à instituição do manager
    const operator = await prisma.user.findFirst({
      where: {
        id: operatorId,
        role: 'OPERATOR',
        institutionId: req.user.institutionId,
      },
    });

    if (!operator) {
      return res.status(404).json({ message: 'Operador não encontrado ou não pertence à sua instituição' });
    }

    // Verificar se há posts do operador
    const postsCount = await prisma.post.count({
      where: { authorId: operatorId },
    });

    // Excluir posts do operador (opcional, dependendo da regra de negócios)
    if (postsCount > 0) {
      await prisma.post.deleteMany({
        where: { authorId: operatorId },
      });
    }

    // Excluir o operador
    await prisma.user.delete({
      where: { id: operatorId },
    });

    res.status(200).json({
      message: 'Operador excluído com sucesso',
      deletedPostsCount: postsCount
    });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao excluir operador: ' + (error as any).message });
  }
};