import { NextRequest } from 'next/server';
import { uploadFileBuffer } from '@/lib/storage';

const maxFileSize = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: 'لم يتم اختيار صورة صالحة.' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return Response.json({ error: 'يسمح برفع ملفات الصور فقط.' }, { status: 415 });
    }
    if (file.size > maxFileSize) {
      return Response.json({ error: 'حجم الصورة يجب ألا يتجاوز 5 ميغابايت.' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadFileBuffer(file.name, file.type, buffer);

    if (!result) {
      return Response.json({ error: 'خدمة رفع الصور غير مهيأة حالياً.' }, { status: 503 });
    }

    return Response.json({ publicUrl: result.publicUrl, key: result.key });
  } catch {
    return Response.json({ error: 'تعذر رفع الصورة. حاول مرة أخرى.' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
