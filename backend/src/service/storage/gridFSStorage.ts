import { PrismaClient } from '@prisma/client';
import { Binary } from 'mongodb';

const prisma = new PrismaClient();

interface CustomFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

export const uploadImage = async (file: CustomFile) => {
  // Using Prisma Client to interact with MongoDB
  const upload = await prisma.$runCommandRaw({
    insert: 'fs.files',
    documents: [
      {
        filename: file.originalname,
        contentType: file.mimetype,
        uploadDate: new Date(),
        data: new Binary(file.buffer),
      },
    ],
  });

  const result = upload as { [key: string]: any };
  if (!result[0]?._id) throw new Error('Upload failed');
  
  return `/files/${result[0]._id}`;
};
