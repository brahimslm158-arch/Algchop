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

function buildKey(filename: string): string {
  const candidate = filename.split('.').pop()?.toLowerCase();
  const ext = candidate && /^[a-z0-9]{2,5}$/.test(candidate) ? candidate : 'jpg';
  return `products/${randomUUID()}.${ext}`;
}

function buildPublicUrl(key: string): string {
  if (cloudflareConfig.publicUrl) {
    return `${cloudflareConfig.publicUrl.replace(/\/$/, '')}/${key}`;
  }
  return `${endpoint}/${cloudflareConfig.bucketName}/${key}`;
}

export async function getPresignedUploadUrl(
  filename: string,
  contentType: string,
  size: number
): Promise<{ url: string; publicUrl: string; key: string } | null> {
  if (!s3Client) return null;

  const key = buildKey(filename);

  const command = new PutObjectCommand({
    Bucket: cloudflareConfig.bucketName,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  return { url, publicUrl: buildPublicUrl(key), key };
}

export async function uploadFileBuffer(
  filename: string,
  contentType: string,
  buffer: Buffer
): Promise<{ publicUrl: string; key: string } | null> {
  if (!s3Client) return null;

  const key = buildKey(filename);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: cloudflareConfig.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ContentLength: buffer.length,
    })
  );

  return { publicUrl: buildPublicUrl(key), key };
}
