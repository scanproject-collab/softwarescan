import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1', 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'sua-access-key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'sua-secret-key',
  },
});

export default s3Client;