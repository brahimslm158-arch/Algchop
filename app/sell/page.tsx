'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import { createProduct, uploadImages } from '@/lib/services';
import type { Product } from '@/types';
import { Upload, X, Plus, Trash2, Loader2 } from 'lucide-react';

const categories = ['إلكترونيات', 'أزياء', 'منزل', 'رياضة', 'سيارات', 'كتب', 'ألعاب', 'خدمات'];
const conditions = [
  { value: 'new', label: 'جديد' },
  { value: 'used', label: 'مستعمل' },
  { value: 'refurbished', label: 'مجدد' },
];

interface OptionInput {
  name: string;
  values: string;
}

export default function SellPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
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
    condition: 'new' as 'new' | 'used' | 'refurbished',
    phone: '',
    email: '',
    location: '',
  });

  useEffect(() => {
    if (user && user.phone) {
      setForm((f) => ({ ...f, phone: user.phone || '' }));
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    if (selected.length + previews.length > 6) {
      setError('لا يمكن رفع أكثر من 6 صور');
      return;
    }
    setFiles((prev) => [...prev, ...selected]);
    setPreviews((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addOption = () => setOptions((prev) => [...prev, { name: '', values: '' }]);
  const updateOption = (i: number, field: keyof OptionInput, value: string) => {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, [field]: value } : o)));
  };
  const removeOption = (i: number) => setOptions((prev) => prev.filter((_, idx) => idx !== i));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title || !form.description || !form.price || !form.category || !form.phone) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (files.length === 0) {
      setError('يرجى رفع صورة واحدة على الأقل');
      return;
    }

    setLoading(true);
    try {
      const imageUrls = await uploadImages(files);
      const product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'views'> = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        category: form.category,
        condition: form.condition,
        images: imageUrls,
        options: options.length
          ? options
              .filter((o) => o.name && o.values)
              .map((o) => ({ name: o.name, values: o.values.split(',').map((v) => v.trim()) }))
          : undefined,
        phone: form.phone,
        email: form.email || undefined,
        location: form.location || undefined,
        sellerId: user?.uid || 'guest',
        sellerName: user?.displayName || form.phone,
        sellerPhone: form.phone,
        sellerEmail: form.email || undefined,
        sellerPhotoURL: user?.photoURL || undefined,
        status: 'active',
      };
      const created = await createProduct(product);
      setSuccess('تم إضافة المنتج بنجاح!');
      setTimeout(() => router.push(`/product/${created.id}`), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء نشر المنتج');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center" dir="rtl">
        جاري التحميل...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center" dir="rtl">
        <h1 className="text-2xl font-bold text-zinc-900 mb-4">يجب تسجيل الدخول للبيع</h1>
        <p className="text-zinc-500 mb-6">سجّل الدخول أو أنشئ حساباً جديداً لإضافة منتجاتك.</p>
        <a
          href="/auth"
          className="inline-block bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 py-3 rounded-full transition-all shadow-lg shadow-zinc-900/10"
        >
          تسجيل الدخول / حساب جديد
        </a>
      </div>
    );
  }

  if (user.userType === 'buyer') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center" dir="rtl">
        <h1 className="text-2xl font-bold text-zinc-900 mb-4">يجب أن يكون حسابك بائعاً</h1>
        <p className="text-zinc-500 mb-6">هذه الصفحة مخصصة للبائعين فقط. أنشئ حساباً بائعاً لإضافة منتجاتك.</p>
        <a
          href="/auth"
          className="inline-block bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 py-3 rounded-full transition-all shadow-lg shadow-zinc-900/10"
        >
          إنشاء حساب بائع
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10" dir="rtl">
      <h1 className="text-3xl font-bold text-zinc-900 mb-2">أضف منتج للبيع</h1>
      <p className="text-zinc-500 mb-8">املأ التفاصيل أدناه لعرض منتجك للمشترين.</p>

      <form onSubmit={onSubmit} className="glass rounded-3xl p-6 md:p-8 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-zinc-900 text-white p-4 rounded-2xl text-sm">{success}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">اسم المنتج *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
            placeholder="مثال: آيفون 14 Pro 256GB"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">الوصف *</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
            placeholder="اكتب وصفاً مفصلاً للمنتج..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">السعر (د.ج) *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">السعر قبل التخفيض (اختياري)</label>
            <input
              type="number"
              value={form.originalPrice}
              onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">الفئة *</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
            >
              <option value="">اختر الفئة</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">الحالة *</label>
            <select
              value={form.condition}
              onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value as Product['condition'] }))}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
            >
              {conditions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-3">صور المنتج * (حد أقصى 6)</label>
          <div className="flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-zinc-200">
                <Image src={src} alt="" fill sizes="96px" className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 left-1 bg-zinc-900 text-white p-1.5 rounded-full hover:bg-zinc-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {previews.length < 6 && (
              <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 rounded-2xl cursor-pointer hover:border-zinc-900 hover:bg-zinc-50 transition-all">
                <Upload className="w-6 h-6 text-zinc-400" />
                <span className="text-xs text-zinc-500 mt-1">رفع</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              </label>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-zinc-700">الخيارات الاختيارية</label>
            <button
              type="button"
              onClick={addOption}
              className="text-sm text-zinc-900 flex items-center gap-1 hover:underline font-medium"
            >
              <Plus className="w-4 h-4" />
              إضافة خيار
            </button>
          </div>
          <div className="space-y-3">
            {options.map((opt, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end bg-white/60 rounded-2xl p-3 border border-zinc-100">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">اسم الخيار</label>
                  <input
                    type="text"
                    value={opt.name}
                    onChange={(e) => updateOption(i, 'name', e.target.value)}
                    placeholder="مثال: اللون"
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-zinc-500 mb-1">القيم (افصل بفاصلة)</label>
                    <input
                      type="text"
                      value={opt.values}
                      onChange={(e) => updateOption(i, 'values', e.target.value)}
                      placeholder="أحمر، أزرق، أخضر"
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="text-red-600 p-2 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">رقم الهاتف للتواصل *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
              placeholder="0555..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">البريد الإلكتروني (اختياري)</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
              placeholder="example@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">الموقع (اختياري)</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
            placeholder="المدينة / الولاية"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-bold py-3.5 rounded-full transition-all shadow-lg shadow-zinc-900/10 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {loading ? 'جاري النشر...' : 'نشر المنتج'}
        </button>
      </form>
    </div>
  );
}
