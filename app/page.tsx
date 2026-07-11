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

  useEffect(() => {
    getProducts({})
      .then((data) => setProducts(data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col">
      <Hero />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 mb-14" dir="rtl">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.slug}
                href={`/categories/${encodeURIComponent(c.slug)}`}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-zinc-200 hover:border-zinc-900 transition-colors group"
              >
                <div className="p-2.5 bg-zinc-100 rounded-xl group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6 text-zinc-700 group-hover:text-white" />
                </div>
                <span className="text-sm font-bold text-zinc-700">{c.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-between mb-6" dir="rtl">
          <h2 className="text-xl md:text-2xl font-black text-zinc-900">منتجات مميزة</h2>
          <Link
            href="/search"
            className="flex items-center gap-1 text-zinc-600 hover:text-zinc-900 font-bold transition-colors"
          >
            عرض الكل
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        <ProductList products={products} loading={loading} />

        <div className="mt-20" dir="rtl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mb-3">كيف يعمل <span className="text-zinc-500">alg shop</span>؟</h2>
            <p className="text-zinc-600 max-w-xl mx-auto font-bold">بيع وشراء في أربع خطوات بسيطة بدون تعقيد.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-zinc-200 p-6 text-center"
                >
                  <div className="w-12 h-12 bg-zinc-100 text-zinc-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-zinc-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-zinc-600 font-bold">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
