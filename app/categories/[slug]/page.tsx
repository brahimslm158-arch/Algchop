'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import ProductList from '@/components/ProductList';
import { getProducts } from '@/lib/services';
import type { Product } from '@/types';

export default function CategoryPage() {
  const params = useParams();
  const slug = decodeURIComponent((params.slug as string) || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getProducts({ category: slug })
      .then(setProducts)
      .catch(() => setError('تعذر تحميل منتجات هذه الفئة. حاول مرة أخرى.'))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="page-shell" dir="rtl">
      <section className="mb-7 overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-l from-emerald-950 to-emerald-700 p-6 text-white sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10"><LayoutGrid className="h-8 w-8" /></span>
          <div className="flex-1">
            <p className="text-sm font-extrabold text-emerald-200">تصفح حسب الفئة</p>
            <h1 className="mt-1 text-3xl font-black">{slug}</h1>
            <p className="mt-2 text-sm font-bold text-emerald-100">{loading ? 'جاري تحميل المنتجات...' : `${products.length} منتج متاح حالياً`}</p>
          </div>
          <Link href="/search" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-extrabold text-emerald-800 hover:bg-emerald-50">كل المنتجات<ArrowLeft className="h-4 w-4" /></Link>
        </div>
      </section>
      {error ? <div className="notice-error">{error}</div> : <ProductList products={products} loading={loading} emptyMessage={`لا توجد منتجات في فئة ${slug} حالياً.`} />}
    </div>
  );
}
