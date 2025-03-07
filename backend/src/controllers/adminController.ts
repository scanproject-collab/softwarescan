import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendWelcomeEmail } from '../service/mailer';

const prisma = new PrismaClient();

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

    await sendWelcomeEmail(user.email, user.name || 'User'); 
    res.status(200).json({ message: 'Operator approved successfully', user });
  } catch (error) {
    res.status(400).json({ message: 'Error approving operator: ' + (error as any).message });
  }
};

export const rejectOperator = async (req: Request, res: Response) => {
  const { operatorId } = req.params;

  try {
    await prisma.user.delete({
      where: { id: operatorId, role: 'OPERATOR', isPending: true },
    });
    res.status(200).json({ message: 'Operator rejected and deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error rejecting operator: ' + (error as any).message });
  }
};

export const deleteExpiredOperators = async () => {
  try {
    const now = new Date();
    const deleted = await prisma.user.deleteMany({
      where: {
        role: 'OPERATOR',
        isPending: true,
        expiresAt: { lte: now },
      },
    });
    console.log(`Deleted ${deleted.count} expired pending operators`);
  } catch (error) {
    console.error('Error deleting expired operators:', error);
  }
};

export const listAllOperators = async (_req: Request, res: Response) => {
  try {
    const operators = await prisma.user.findMany({
      where: { role: 'OPERATOR' },
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

export const deleteOperatorByAdmin = async (req: Request, res: Response) => {
  const { operatorId } = req.params;

  try {
    await prisma.user.delete({
      where: { id: operatorId },
    });
    res.status(200).json({ message: 'Operator account deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting operator account: ' + (error as any).message });
  }
};