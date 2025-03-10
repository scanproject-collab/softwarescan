import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const listTags = async (_req: Request, res: Response) => {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: { name: "asc" },
        });
        res.status(200).json({ message: "Tags retrieved successfully", tags: tags.map(tag => tag.name) });
    } catch (error) {
        res.status(400).json({ message: "Error listing tags: " + (error as Error).message });
    }
};

export const createTag = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Tag name is required" });
        }

        const existingTag = await prisma.tag.findUnique({ where: { name } });
        if (existingTag) {
            return res.status(400).json({ message: "Tag already exists" });
        }

        const tag = await prisma.tag.create({
            data: { name },
        });

        res.status(201).json({ message: "Tag created successfully", tag });
    } catch (error) {
        res.status(400).json({ message: "Error creating tag: " + (error as Error).message });
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