'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductList from '@/components/ProductList';
import { getProducts } from '@/lib/services';
import type { Product } from '@/types';
import { SlidersHorizontal, X } from 'lucide-react';

const categories = ['إلكترونيات', 'أزياء', 'منزل', 'رياضة', 'سيارات', 'كتب', 'ألعاب', 'خدمات'];
const conditions = [
  { value: 'new', label: 'جديد' },
  { value: 'used', label: 'مستعمل' },
  { value: 'refurbished', label: 'مجدد' },
];

function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get('q') || '';
  const categoryParam = params.get('category') || '';
  const conditionParam = params.get('condition') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(q);
  const [category, setCategory] = useState(categoryParam);
  const [condition, setCondition] = useState(conditionParam);
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  useEffect(() => {
    setLoading(true);
    getProducts({
      q,
      category: category || undefined,
      condition: condition || undefined,
      min: min ? Number(min) : undefined,
      max: max ? Number(max) : undefined,
    })
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [q, category, condition, min, max]);

  useEffect(() => {
    setSearch(q);
    setCategory(categoryParam);
    setCondition(conditionParam);
  }, [q, categoryParam, conditionParam]);

  const applyFilters = () => {
    const url = new URLSearchParams();
    if (search) url.set('q', search);
    if (category) url.set('category', category);
    if (condition) url.set('condition', condition);
    if (min) url.set('min', min);
    if (max) url.set('max', max);
    router.push(`/search?${url.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setCondition('');
    setMin('');
    setMax('');
    router.push('/search');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                الفلاتر
              </h3>
              <button
                onClick={clearFilters}
                className="text-sm text-zinc-500 hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <X className="w-4 h-4" />
                مسح
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">البحث</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="كلمة البحث"
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">الفئة</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                >
                  <option value="">كل الفئات</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">الحالة</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                >
                  <option value="">الكل</option>
                  {conditions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">السعر (د.ج)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={min}
                    onChange={(e) => setMin(e.target.value)}
                    placeholder="من"
                    className="w-1/2 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                  />
                  <input
                    type="number"
                    value={max}
                    onChange={(e) => setMax(e.target.value)}
                    placeholder="إلى"
                    className="w-1/2 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                onClick={applyFilters}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 rounded-full transition-all shadow-lg shadow-zinc-900/10"
              >
                تطبيق الفلاتر
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-zinc-900">
              {q ? `نتائج البحث: "${q}"` : 'كل المنتجات'}
            </h1>
            <span className="text-sm text-zinc-500">{products.length} نتيجة</span>
          </div>
          <ProductList
            products={products}
            loading={loading}
            emptyMessage="لم يتم العثور على منتجات مطابقة لبحثك."
          />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-zinc-500">
          جاري التحميل...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
