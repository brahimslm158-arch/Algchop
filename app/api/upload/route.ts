import { NextRequest } from 'next/server';
import { uploadFileBuffer } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'Missing file' }), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadFileBuffer(file.name, file.type || 'application/octet-stream', buffer);

    if (!result) {
      return new Response(JSON.stringify({ error: 'Storage not configured' }), { status: 500 });
    }

    return Response.json({ publicUrl: result.publicUrl, key: result.key });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
