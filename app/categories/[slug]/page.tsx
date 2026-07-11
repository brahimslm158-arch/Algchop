'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductList from '@/components/ProductList';
import { getProducts } from '@/lib/services';
import type { Product } from '@/types';

export default function CategoryPage() {
  const params = useParams();
  const slug = decodeURIComponent((params.slug as string) || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProducts({ category: slug })
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">{slug}</h1>
        <p className="text-zinc-500 mt-1">{products.length} منتج في هذه الفئة</p>
      </div>
      <ProductList
        products={products}
        loading={loading}
        emptyMessage={`لا توجد منتجات في فئة ${slug} حالياً.`}
      />
    </div>
  );
}
