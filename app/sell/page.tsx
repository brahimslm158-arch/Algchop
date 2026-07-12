'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ImagePlus, Loader2, Plus, Store, Trash2, X } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { createProduct, uploadImages } from '@/lib/services';
import type { Product } from '@/types';

const categories = ['إلكترونيات', 'أزياء', 'منزل', 'رياضة', 'سيارات', 'كتب', 'ألعاب', 'خدمات'];
const conditions: { value: Product['condition']; label: string }[] = [
  { value: 'new', label: 'جديد' },
  { value: 'used', label: 'مستعمل' },
  { value: 'refurbished', label: 'مجدد' },
];
const maxImages = 6;
const maxImageSize = 5 * 1024 * 1024;

interface OptionInput {
  name: string;
  values: string;
}

export default function SellPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const previewsRef = useRef<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [options, setOptions] = useState<OptionInput[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    condition: 'new' as Product['condition'],
    phone: '',
    email: '',
    location: '',
  });

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      phone: current.phone || user.phone || '',
      email: current.email || user.email || '',
    }));
  }, [user]);

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  useEffect(() => () => previewsRef.current.forEach(URL.revokeObjectURL), []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = '';
    setError('');

    if (selected.some((file) => !file.type.startsWith('image/'))) {
      setError('يمكن رفع ملفات الصور فقط.');
      return;
    }
    if (selected.some((file) => file.size > maxImageSize)) {
      setError('حجم كل صورة يجب ألا يتجاوز 5 ميغابايت.');
      return;
    }
    if (selected.length + files.length > maxImages) {
      setError(`يمكن رفع ${maxImages} صور كحد أقصى.`);
      return;
    }

    setFiles((current) => [...current, ...selected]);
    setPreviews((current) => [...current, ...selected.map(URL.createObjectURL)]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setPreviews((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateOption = (index: number, field: keyof OptionInput, value: string) => {
    setOptions((current) => current.map((option, optionIndex) => optionIndex === index ? { ...option, [field]: value } : option));
  };

  const validate = () => {
    const price = Number(form.price);
    const originalPrice = form.originalPrice ? Number(form.originalPrice) : undefined;
    if (form.title.trim().length < 3) return 'اسم المنتج يجب أن يتكون من 3 أحرف على الأقل.';
    if (form.description.trim().length < 20) return 'أضف وصفاً واضحاً من 20 حرفاً على الأقل.';
    if (!Number.isFinite(price) || price <= 0) return 'أدخل سعراً صحيحاً أكبر من صفر.';
    if (originalPrice !== undefined && (!Number.isFinite(originalPrice) || originalPrice <= price)) {
      return 'السعر قبل التخفيض يجب أن يكون أكبر من السعر الحالي.';
    }
    if (!form.category) return 'اختر فئة المنتج.';
    if (form.phone.replace(/\D/g, '').length < 8) return 'أدخل رقم هاتف صحيحاً للتواصل.';
    if (!files.length) return 'أضف صورة واحدة على الأقل للمنتج.';
    return '';
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = validate();
    setError(validationError);
    setSuccess('');
    if (validationError || !user) return;

    setLoading(true);
    try {
      const imageUrls = await uploadImages(files);
      const created = await createProduct({
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        category: form.category,
        condition: form.condition,
        images: imageUrls,
        options: options
          .map((option) => ({
            name: option.name.trim(),
            values: option.values.split(/[،,]/).map((value) => value.trim()).filter(Boolean),
          }))
          .filter((option) => option.name && option.values.length),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        location: form.location.trim() || undefined,
        sellerId: user.uid,
        sellerName: user.displayName || form.phone.trim(),
        sellerPhone: form.phone.trim(),
        sellerEmail: form.email.trim() || undefined,
        sellerPhotoURL: user.photoURL || undefined,
        status: 'active',
      });
      setSuccess('تم نشر المنتج بنجاح. سيتم نقلك إلى صفحته الآن.');
      router.push(`/product/${created.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'تعذر نشر المنتج. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="page-shell flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>;
  }

  if (!user || user.userType !== 'seller') {
    const isBuyer = user?.userType === 'buyer';
    return (
      <div className="page-shell flex min-h-[60vh] items-center justify-center" dir="rtl">
        <div className="surface-card w-full max-w-md p-8 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Store className="h-8 w-8" /></span>
          <h1 className="mt-5 text-2xl font-black text-slate-950">{isBuyer ? 'هذه المساحة مخصصة للبائعين' : 'سجّل الدخول لبدء البيع'}</h1>
          <p className="mt-3 leading-7 text-slate-600">{isBuyer ? 'أنشئ حساب بائع منفصلاً لتتمكن من إضافة منتجاتك وإدارة الطلبات.' : 'أنشئ حساب بائع، ثم أضف صور المنتج وسعره وبيانات التواصل.'}</p>
          <Link href="/auth?mode=signup&type=seller&next=%2Fsell" className="btn-primary mt-6 w-full">{isBuyer ? 'إنشاء حساب بائع' : 'الدخول أو إنشاء حساب بائع'}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell max-w-4xl" dir="rtl">
      <div className="mb-7">
        <span className="text-sm font-extrabold text-emerald-700">لوحة البائع</span>
        <h1 className="mt-2 text-3xl font-black text-slate-950">أضف منتجاً جديداً</h1>
        <p className="mt-2 text-slate-600">الحقول الواضحة والصور الجيدة تساعد المشترين على اتخاذ قرار أسرع.</p>
      </div>

      <form onSubmit={onSubmit} className="surface-card space-y-8 p-5 sm:p-8">
        {error && <div className="notice-error" role="alert">{error}</div>}
        {success && <div className="notice-success" role="status">{success}</div>}

        <FormSection number="1" title="معلومات المنتج">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="اسم المنتج" required className="sm:col-span-2">
              <input className="field" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="مثال: هاتف سامسونج Galaxy S24" maxLength={120} />
            </Field>
            <Field label="الوصف" required className="sm:col-span-2">
              <textarea className="field min-h-36 resize-y" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="اذكر الحالة والمواصفات وما يشمله العرض..." maxLength={3000} />
            </Field>
            <Field label="السعر الحالي (د.ج)" required>
              <input className="field" type="number" min="1" step="1" inputMode="numeric" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder="85000" />
            </Field>
            <Field label="السعر قبل التخفيض">
              <input className="field" type="number" min="1" step="1" inputMode="numeric" value={form.originalPrice} onChange={(event) => setForm((current) => ({ ...current, originalPrice: event.target.value }))} placeholder="95000" />
            </Field>
            <Field label="الفئة" required>
              <select className="field" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                <option value="">اختر الفئة</option>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </Field>
            <Field label="حالة المنتج" required>
              <select className="field" value={form.condition} onChange={(event) => setForm((current) => ({ ...current, condition: event.target.value as Product['condition'] }))}>
                {conditions.map((condition) => <option key={condition.value} value={condition.value}>{condition.label}</option>)}
              </select>
            </Field>
          </div>
        </FormSection>

        <FormSection number="2" title="صور المنتج" description="حتى 6 صور، وبحجم لا يتجاوز 5 ميغابايت للصورة.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {previews.map((preview, index) => (
              <div key={preview} className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <Image src={preview} alt={`معاينة الصورة ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 180px" className="object-cover" unoptimized />
                <button type="button" onClick={() => removeImage(index)} className="absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/85 text-white" aria-label={`حذف الصورة ${index + 1}`}><X className="h-4 w-4" /></button>
                {index === 0 && <span className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-extrabold text-slate-800">الصورة الرئيسية</span>}
              </div>
            ))}
            {previews.length < maxImages && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 p-3 text-center text-emerald-800 hover:bg-emerald-50">
                <ImagePlus className="h-7 w-7" />
                <span className="mt-2 text-sm font-extrabold">اختر الصور</span>
                <span className="mt-1 text-xs">{previews.length}/{maxImages}</span>
                <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFileChange} />
              </label>
            )}
          </div>
        </FormSection>

        <FormSection number="3" title="خيارات المنتج" description="أضفها فقط إذا كان المنتج متوفراً بألوان أو أحجام مختلفة.">
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_1.5fr_auto] sm:items-end">
                <Field label="اسم الخيار"><input className="field" value={option.name} onChange={(event) => updateOption(index, 'name', event.target.value)} placeholder="اللون" /></Field>
                <Field label="القيم، مفصولة بفاصلة"><input className="field" value={option.values} onChange={(event) => updateOption(index, 'values', event.target.value)} placeholder="أسود، أبيض، أزرق" /></Field>
                <button type="button" onClick={() => setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index))} className="btn-secondary h-12 px-3 text-red-700" aria-label="حذف الخيار"><Trash2 className="h-5 w-5" /></button>
              </div>
            ))}
            <button type="button" onClick={() => setOptions((current) => [...current, { name: '', values: '' }])} className="btn-secondary"><Plus className="h-4 w-4" />إضافة خيار</button>
          </div>
        </FormSection>

        <FormSection number="4" title="التواصل والموقع">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="رقم الهاتف" required><input className="field" type="tel" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="0555 00 00 00" dir="ltr" /></Field>
            <Field label="البريد الإلكتروني"><input className="field" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="seller@example.com" dir="ltr" /></Field>
            <Field label="المدينة أو الولاية" className="sm:col-span-2"><input className="field" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="الجزائر العاصمة" /></Field>
          </div>
        </FormSection>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {loading ? 'جاري رفع الصور ونشر المنتج...' : 'نشر المنتج'}
        </button>
      </form>
    </div>
  );
}

function FormSection({ number, title, description, children }: { number: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-sm font-black text-white">{number}</span>
        <div><h2 className="text-lg font-black text-slate-950">{title}</h2>{description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}</div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, required = false, className = '', children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return <label className={`block ${className}`}><span className="mb-2 block text-sm font-extrabold text-slate-800">{label}{required && <span className="mr-1 text-red-600">*</span>}</span>{children}</label>;
}
