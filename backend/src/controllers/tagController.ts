import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listTags = async (_req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
    });
    res.status(200).json({ message: "Tags retrieved successfully", tags });
  } catch (error) {
    res.status(400).json({ message: "Error listing tags: " + (error as Error).message });
  }
};

export const listWeights = async (_req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      select: { weight: true },
      where: { weight: { not: null } },
    });
    const weights = [...new Set(tags.map(tag => tag.weight).filter(Boolean))] as string[];
    res.status(200).json({ message: "Weights retrieved successfully", weights });
  } catch (error) {
    res.status(400).json({ message: "Error listing weights: " + (error as Error).message });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    const { name, weight } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Tag name is required" });
    }

    const existingTag = await prisma.tag.findUnique({ where: { name } });
    if (existingTag) {
      return res.status(400).json({ message: "Tag already exists" });
    }

    const tag = await prisma.tag.create({
      data: { name, weight },
    });

    res.status(201).json({ message: "Tag created successfully", tag });
  } catch (error) {
    res.status(400).json({ message: "Error creating tag: " + (error as Error).message });
  }
};

export const updateTag = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const { newName, weight } = req.body;

    const tag = await prisma.tag.findUnique({ where: { name } });
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    const updatedTag = await prisma.tag.update({
      where: { name },
      data: {
        name: newName || tag.name,
        weight: weight || tag.weight,
      },
    });

    res.status(200).json({ message: "Tag updated successfully", tag: updatedTag });
  } catch (error) {
    res.status(400).json({ message: "Error updating tag: " + (error as Error).message });
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const tag = await prisma.tag.findUnique({ where: { name } });
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    await prisma.tag.delete({ where: { name } });

    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting tag: " + (error as Error).message });
  }
};