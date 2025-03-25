import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PutObjectCommand, ObjectCannedACL, DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../service/storage/AWSs3';
import multer from 'multer';
import { sendExpoPushNotification } from '../service/expoNotification';

import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PNG, JPG ou JPEG são permitidos.'));
    }
  },
});

const uploadImageToS3 = async (file: Express.Multer.File, userId: string) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${userId}/posts/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: ObjectCannedACL.public_read,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
};

export const createPost = async (req: Request & { user?: { id: string } }, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { title, content, tags, location, latitude, longitude, playerId, ranking } = req.body;
    let tagsArray = tags ? tags.split(',') : [];

    const tagWeights = await prisma.tag.findMany({
      where: { name: { in: tagsArray } },
      select: { weight: true },
    });

    const weights = tagWeights.map(t => t.weight).filter(Boolean) as string[];
    let postWeight = 'Baixo'; // Peso padrão
    if (weights.includes('Alto')) postWeight = 'Alto';
    else if (weights.includes('Médio')) postWeight = 'Médio';
    else if (weights.length > 0) postWeight = weights[0];

    if (req.file) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const postsToday = await prisma.post.count({
        where: {
          authorId: req.user.id,
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
          imageUrl: { not: null },
        },
      });

      if (postsToday >= 3) {
        if (playerId) {
          await sendExpoPushNotification(
              playerId, // pushToken
              'Limite de Imagens Atingido', // title
              'Você atingiu o limite de 3 imagens por dia. Tente novamente amanhã!', // body
              { type: 'limit_exceeded' } // dados opcionais
          );
        }
        return res.status(403).json({ message: 'Limite de 3 imagens por dia atingido. Tente novamente amanhã.' });
      }
    }

    let imageUrl: string | undefined;
    if (req.file) {
      imageUrl = await uploadImageToS3(req.file, req.user.id);
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl,
        tags: tagsArray,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        authorId: req.user.id,
        ranking: ranking || "Baixo",
        weight: postWeight,
      },
    });

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    res.status(400).json({ message: 'Error creating post: ' + (error as Error).message });
  }
};

export const uploadImage = upload.single('image');

export const listUserPosts = async (req: Request & { user?: { id: string } }, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (posts.length === 0) {
      return res.status(200).json({ message: 'Você ainda não possui nenhuma postagem.' });
    }

    res.status(200).json({ message: 'Posts retrieved successfully', posts });
  } catch (error) {
    res.status(400).json({ message: 'Error listing posts: ' + (error as Error).message });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: { select: { name: true, email: true } } },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ message: 'Post retrieved successfully', post });
  } catch (error) {
    res.status(400).json({ message: 'Error retrieving post: ' + (error as Error).message });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    if (post.imageUrl) {
      const imageKey = post.imageUrl.split('/').pop();
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: imageKey,
      };
      await s3Client.send(new DeleteObjectCommand(deleteParams));
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    res.status(200).json({ message: 'Post excluído com sucesso' });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao excluir o post: ' + (error as Error).message });
  }
};

export const listAllPosts = async (_req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            institution: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    const response = {
      message: "Posts retrieved successfully",
      posts: posts.map((post) => {
        console.log("Post Author Institution:", post.author.institution); // Log para depuração
        return {
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
          authorId: post.authorId,
          ranking: post.ranking,
          weight: post.weight,
          author: {
            id: post.author.id,
            name: post.author.name || "Unnamed",
            email: post.author.email,
            institution: post.author.institution
                ? {
                  id: post.author.institution.id,
                  title: post.author.institution.title,
                }
                : null,
          },
        };
      }),
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: "Error listing posts: " + (error as any).message });
  }
};