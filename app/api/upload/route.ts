import { NextRequest } from 'next/server';
import { getPresignedUploadUrl } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, contentType, size } = body;

    if (!filename || !contentType || typeof size !== 'number') {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const result = await getPresignedUploadUrl(filename, contentType, size);
    if (!result) {
      return new Response(JSON.stringify({ error: 'Cloudflare not configured' }), { status: 500 });
    }

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
