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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({})
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col">
      <Hero />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4 mb-14" dir="rtl">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.slug}
                href={`/categories/${encodeURIComponent(c.slug)}`}
                className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="p-3 bg-zinc-100 rounded-2xl group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6 text-zinc-700 group-hover:text-white" />
                </div>
                <span className="text-sm font-medium text-zinc-700">{c.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-between mb-8" dir="rtl">
          <h2 className="text-2xl font-bold text-zinc-900">منتجات مميزة</h2>
          <Link
            href="/search"
            className="flex items-center gap-1 text-zinc-700 hover:text-zinc-900 font-medium transition-colors"
          >
            عرض الكل
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        <ProductList products={products} loading={loading} />
      </section>
    </div>
  );
}
