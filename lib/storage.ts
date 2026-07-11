import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { cloudflareConfig, isCloudflareConfigured } from './config';

const endpoint = cloudflareConfig.endpoint;

const s3Client = isCloudflareConfigured
  ? new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: cloudflareConfig.accessKeyId,
        secretAccessKey: cloudflareConfig.secretAccessKey,
      },
    })
  : null;

export async function getPresignedUploadUrl(
  filename: string,
  contentType: string,
  size: number
): Promise<{ url: string; publicUrl: string; key: string } | null> {
  if (!s3Client) return null;

  const ext = filename.split('.').pop() || 'jpg';
  const key = `products/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: cloudflareConfig.bucketName,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  const publicUrl = cloudflareConfig.publicUrl
    ? `${cloudflareConfig.publicUrl.replace(/\/$/, '')}/${key}`
    : `${endpoint}/${cloudflareConfig.bucketName}/${key}`;

  return { url, publicUrl, key };
}
