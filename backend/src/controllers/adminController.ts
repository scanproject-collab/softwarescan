import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const listAllOperators = async (_req: Request, res: Response) => {
  try {
    // Fetch all operators with additional details
    const operators = await prisma.user.findMany({
      where: { role: 'OPERATOR' },
      select: {
        id: true,
        name: true,
        email: true,
        institutionId: true,
        createdAt: true,
        updatedAt: true, // Added for more context
        institution: { // Include institution details if available
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Calculate total operator count
    const totalOperators = operators.length;

    // Group operators by institution for a breakdown
    const institutionBreakdown = operators.reduce((acc, op) => {
      const instId = op.institutionId || 'No Institution';
      const instTitle = op.institution?.title || 'Unassigned';
      acc[instId] = acc[instId] || { count: 0, name: instTitle };
      acc[instId].count += 1;
      return acc;
    }, {} as Record<string, { count: number; name: string }>);

    // Calculate recently added operators (e.g., last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOperators = operators.filter(
      (op) => op.createdAt && new Date(op.createdAt) >= sevenDaysAgo
    ).length;

    // Prepare the response
    const response = {
      message: 'Operators listed successfully',
      summary: {
        totalOperators,
        recentOperators, // Operators added in the last 7 days
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
        name: op.name || 'Unnamed', // Fallback for null names
        email: op.email,
        institution: op.institution
          ? { id: op.institution.id, title: op.institution.title }
          : null,
        createdAt: op.createdAt?.toISOString() ?? new Date().toISOString(), // Standardized date format
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