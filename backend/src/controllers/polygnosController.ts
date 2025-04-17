import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

import multer from 'multer';
import shapefile from 'shapefile';

const prisma = new PrismaClient();


const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.originalname.endsWith('.shp') || file.originalname.endsWith('.dbf')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos .shp ou .dbf são permitidos'));
        }
    },
});

interface RequestWithUser extends Request {
    user?: { id: string; role: string; institutionId?: string };
}

export const uploadShapefile = upload.fields([
    { name: 'shp', maxCount: 1 },
    { name: 'dbf', maxCount: 1 },
]);

export const createPolygonFromShapefile = async (req: RequestWithUser, res: Response) => {
    if (!req.user?.id || (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const { name, notes } = req.body;

    if (!files?.shp || !files?.dbf) {
        return res.status(400).json({ message: 'Both .shp and .dbf files are required' });
    }
    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    try {
        const shpBuffer = files.shp[0].buffer;
        const dbfBuffer = files.dbf[0].buffer;

        const geojson = await shapefile.read(shpBuffer, dbfBuffer);
        const polygons: any[] = [];

        for (const feature of geojson.features) {
            if (feature.geometry.type === 'Polygon') {
                const coordinates = feature.geometry.coordinates[0].map((coord: [number, number]) => ({
                    lat: coord[1],
                    lng: coord[0],
                }));
                if (coordinates.length >= 3) {
                    const polygon = await prisma.polygon.create({
                        data: {
                            name: `${name} (${polygons.length + 1})`,
                            points: coordinates,
                            notes,
                            authorId: req.user.id,
                        },
                    });
                    polygons.push(polygon);
                }
            }
        }

        if (polygons.length === 0) {
            return res.status(400).json({ message: 'No valid polygons found in the shapefile' });
        }

        res.status(201).json({ message: 'Polygons created successfully from shapefile', polygons });
    } catch (error) {
        res.status(400).json({ message: 'Error processing shapefile: ' + (error as any).message });
    }
};

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