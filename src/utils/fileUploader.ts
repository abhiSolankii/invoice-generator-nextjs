import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

console.log(process.env.AWS_REGION, process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);

// Helper function to get content type
const getContentType = (originalFileName: string) => {
  const extension = originalFileName.split('.').pop()?.toLowerCase();
  const contentTypes: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg'
  };
  return contentTypes[extension!] || 'application/octet-stream';
};

export const fileUploader = async (fileBuffer: Buffer, originalFileName: string) => {
  try {
    // Generate a unique filename while preserving the original extension
    const extension = originalFileName.split('.').pop()?.toLowerCase();
    const filename = `${crypto.randomBytes(16).toString('hex')}-${Date.now()}.${extension}`;
    
    // Determine the appropriate folder based on file type
    const folder = extension === 'pdf' ? 'documents' : 'invoice_images';
    
    // Set up the upload parameters
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: `${folder}/${filename}`,
      Body: fileBuffer,
      ContentType: getContentType(originalFileName)
    };

    // Upload to S3
    await s3Client.send(new PutObjectCommand(uploadParams));
    
    // Return the URL of the uploaded file
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${folder}/${filename}`;
  } catch (error) {
    throw error;
  }
};