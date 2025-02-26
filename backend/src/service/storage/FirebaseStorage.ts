import * as admin from 'firebase-admin';

interface CustomFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

export const uploadImage = async (file: CustomFile) => {
  const storage = admin.storage().bucket();
  const fileUpload = storage.file(file.originalname);
  
  await fileUpload.save(file.buffer, {
    contentType: file.mimetype,
    public: true,
  });

  const fileUrl = `https://storage.googleapis.com/${storage.name}/${fileUpload.name}`;
  return fileUrl;
};
