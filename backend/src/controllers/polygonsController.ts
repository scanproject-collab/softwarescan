import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

interface RequestWithUser extends Request {
  user?: { id: string; role: string; institutionId?: string };
}

export const createPolygon = async (req: RequestWithUser, res: Response) => {
  const { name, points, notes } = req.body;
  if (!req.user?.id || req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const polygon = await prisma.polygon.create({
      data: {
        name,
        points,
        notes,
        authorId: req.user.id,
      },
    });
    res.status(201).json({ message: 'Polygon created successfully', polygon });
  } catch (error) {
    res.status(400).json({ message: 'Error creating polygon: ' + (error as any).message });
  }
};

export const listPolygons = async (req: RequestWithUser, res: Response) => {
  try {
    const { role, institutionId } = req.query;

    let whereClause = {};

    // Se for MANAGER, filtrar polígonos por instituição
    if (role === 'MANAGER' && institutionId) {
      whereClause = {
        OR: [
          // Polígonos criados pelo próprio manager
          { authorId: req.user?.id },
          // Polígonos criados por usuários da mesma instituição
          {
            author: {
              institutionId: institutionId as string
            }
          }
        ]
      };
    }

    const polygons = await prisma.polygon.findMany({
      where: whereClause,
      include: {
        author: {
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
      },
    });

    res.status(200).json({ message: 'Polygons listed successfully', polygons });
  } catch (error) {
    res.status(400).json({ message: 'Error listing polygons: ' + (error as any).message });
  }
};

export const updatePolygon = async (req: RequestWithUser, res: Response) => {
  const { polygonId } = req.params;
  const { name, points, notes } = req.body;
  if (!req.user?.id || req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const polygon = await prisma.polygon.update({
      where: { id: polygonId },
      data: { name, points, notes },
    });
    res.status(200).json({ message: 'Polygon updated successfully', polygon });
  } catch (error) {
    res.status(400).json({ message: 'Error updating polygon: ' + (error as any).message });
  }
};

export const deletePolygon = async (req: RequestWithUser, res: Response) => {
  const { polygonId } = req.params;
  if (!req.user?.id || req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    await prisma.polygon.delete({
      where: { id: polygonId },
    });
    res.status(200).json({ message: 'Polygon deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting polygon: ' + (error as any).message });
  }
}; 