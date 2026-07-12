'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Hero from '@/components/Hero';
import ProductList from '@/components/ProductList';
import { getProducts } from '@/lib/services';
import type { Product } from '@/types';
import {
  Smartphone,
  Shirt,
  Sofa,
  Dumbbell,
  Car,
  BookOpen,
  Gamepad2,
  Briefcase,
  ArrowLeft,
  Camera,
  FileText,
  MessagesSquare,
  Handshake,
} from 'lucide-react';

const categories = [
  { slug: 'إلكترونيات', label: 'إلكترونيات', icon: Smartphone },
  { slug: 'أزياء', label: 'أزياء', icon: Shirt },
  { slug: 'منزل', label: 'منزل', icon: Sofa },
  { slug: 'رياضة', label: 'رياضة', icon: Dumbbell },
  { slug: 'سيارات', label: 'سيارات', icon: Car },
  { slug: 'كتب', label: 'كتب', icon: BookOpen },
  { slug: 'ألعاب', label: 'ألعاب', icon: Gamepad2 },
  { slug: 'خدمات', label: 'خدمات', icon: Briefcase },
];

const steps = [
  { icon: Camera, title: 'أضف منتجك', desc: 'صور، وصف، سعر، وخيارات اختيارية' },
  { icon: FileText, title: 'انشر إعلانك', desc: 'يظهر للمشترين في أقل من دقيقة' },
  { icon: MessagesSquare, title: 'تواصل مباشر', desc: 'يتواصل المشتري معك عبر الهاتف' },
  { icon: Handshake, title: 'أكمل الصفقة', desc: 'بيع بأمان وبدون عمولات معقدة' },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    getProducts({})
      .then((data) => setProducts(data || []))
      .catch(() => setError('تعذر تحميل المنتجات حالياً. أعد المحاولة بعد قليل.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col">
      <Hero />
      <section className="page-shell">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold text-emerald-700">وصول سريع</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">تصفح حسب الفئة</h2>
          </div>
          <Link href="/search" className="text-sm font-extrabold text-emerald-700 hover:text-emerald-900">كل الفئات</Link>
        </div>
        <div className="mb-16 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8" dir="rtl">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.slug}
                href={`/categories/${encodeURIComponent(c.slug)}`}
                className="group flex min-h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
              >
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700 transition-colors group-hover:bg-emerald-700 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-extrabold text-slate-700">{c.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mb-6 flex items-center justify-between gap-4" dir="rtl">
          <div>
            <p className="text-sm font-extrabold text-emerald-700">مختارات حديثة</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">منتجات تستحق المشاهدة</h2>
          </div>
          <Link
            href="/search"
            className="flex shrink-0 items-center gap-1 font-extrabold text-emerald-700 transition-colors hover:text-emerald-900"
          >
            عرض الكل
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        {error ? <div className="notice-error">{error}</div> : <ProductList products={products} loading={loading} />}

        <div id="how-it-works" className="mt-24 scroll-mt-36" dir="rtl">
          <div className="text-center mb-10">
            <p className="text-sm font-extrabold text-emerald-700">خطوات بسيطة</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950 md:text-3xl">كيف يعمل Algshop؟</h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">من العثور على المنتج إلى إتمام التواصل، كل شيء مرتب وواضح.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="surface-card relative p-6 text-center"
                >
                  <span className="absolute left-4 top-4 text-xs font-black text-slate-300">0{i + 1}</span>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-black text-slate-900">{step.title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
