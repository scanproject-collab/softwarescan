import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CustomRequest } from '../middlewares/authMiddleware'; 

const prisma = new PrismaClient();

export const createInstitution = async (req: CustomRequest, res: Response) => {
  try {
    const { title } = req.body;
    const adminId = req.user?.id; 

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!adminId || req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can create institutions' });
    }

    const institution = await prisma.institution.create({
      data: {
        title,
        authorId: adminId,
      },
    });

    res.status(201).json({ message: 'Institution created successfully', institution });
  } catch (error) {
    res.status(400).json({ message: 'Error creating institution: ' + (error as any).message });
  }
};

export const updateInstitution = async (req: CustomRequest, res: Response) => {
  try {
    const { institutionId } = req.params;
    const { title } = req.body;
    const adminId = req.user?.id;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!adminId || req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can update institutions' });
    }

    const institution = await prisma.institution.update({
      where: { id: institutionId },
      data: { title },
    });

    res.status(200).json({ message: 'Institution updated successfully', institution });
  } catch (error) {
    res.status(400).json({ message: 'Error updating institution: ' + (error as any).message });
  }
};

export const deleteInstitution = async (req: CustomRequest, res: Response) => {
  try {
    const { institutionId } = req.params;
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can delete institutions' });
    }

    await prisma.institution.delete({
      where: { id: institutionId },
    });

    res.status(200).json({ message: 'Institution deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting institution: ' + (error as any).message });
  }
};

export const listInstitutions = async (_req: Request, res: Response) => {
  try {
    const institutions = await prisma.institution.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: { id: true, name: true, email: true },
        },
        users: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    const response = {
      message: 'Institutions listed successfully',
      summary: {
        totalInstitutions: institutions.length,
      },
      institutions: institutions.map((inst) => ({
        id: inst.id,
        title: inst.title,
        createdAt: inst.createdAt?.toISOString(),
        updatedAt: inst.updatedAt?.toISOString(),
        author: inst.author,
        userCount: inst.users.length,
        users: inst.users,
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: 'Error listing institutions: ' + (error as any).message });
  }
};