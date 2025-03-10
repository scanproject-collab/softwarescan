import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PutObjectCommand, ObjectCannedACL, DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../service/storage/AWSs3';
import multer from 'multer';
import { sendNotification } from '../utils/oneSignal'; 

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

    const { title, content, tags, location, latitude, longitude, playerId } = req.body;
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
          await sendNotification(
            [playerId],
            'Você atingiu o limite de 3 imagens por dia. Tente novamente amanhã!'
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
        tags: tags ? tags.split(',') : [],
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        authorId: req.user.id,
        ranking: ranking || "Baixo"
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
      include: { author: { select: { name: true, email: true, institution: { select: { title: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ message: "Posts retrieved successfully", posts });
  } catch (error) {
    res.status(400).json({ message: "Error listing posts: " + (error as Error).message });
  }
};