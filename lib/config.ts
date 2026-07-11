export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID || '',
};

export const isFirebaseConfigured =
  Boolean(firebaseConfig.apiKey) && Boolean(firebaseConfig.projectId);

export const isDemoMode =
  !isFirebaseConfigured || process.env.NEXT_PUBLIC_DEMO === 'true';

function r2Endpoint(): string {
  const explicit =
    process.env.CLOUDFLARE_R2_ENDPOINT ||
    process.env.R2_ENDPOINT ||
    process.env.R2_ENDPOINT_URL;
  if (explicit) return explicit;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
  if (accountId) return `https://${accountId}.r2.cloudflarestorage.com`;
  return '';
}

function r2PublicUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL ||
    process.env.CLOUDFLARE_PUBLIC_URL ||
    process.env.R2_PUBLIC_URL;
  if (explicit) return explicit;
  const domain = process.env.R2_PUBLIC_DOMAIN;
  if (domain) return domain.startsWith('http') ? domain : `https://${domain}`;
  return '';
}

export const cloudflareConfig = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID || '',
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || '',
  bucketName: process.env.CLOUDFLARE_BUCKET_NAME || process.env.R2_BUCKET_NAME || '',
  endpoint: r2Endpoint(),
  publicUrl: r2PublicUrl(),
};

export const isCloudflareConfigured =
  Boolean(cloudflareConfig.accountId) &&
  Boolean(cloudflareConfig.accessKeyId) &&
  Boolean(cloudflareConfig.secretAccessKey) &&
  Boolean(cloudflareConfig.bucketName) &&
  Boolean(cloudflareConfig.endpoint);

export const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
