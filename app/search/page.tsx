'use client';

import { Suspense, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import ProductList from '@/components/ProductList';
import { getProducts } from '@/lib/services';
import type { Product } from '@/types';

const categories = ['إلكترونيات', 'أزياء', 'منزل', 'رياضة', 'سيارات', 'كتب', 'ألعاب', 'خدمات'];
const conditions = [
  { value: 'new', label: 'جديد' },
  { value: 'used', label: 'مستعمل' },
  { value: 'refurbished', label: 'مجدد' },
];

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="page-shell text-center font-bold text-slate-500">جاري تحميل المنتجات...</div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();
  const applied = useMemo(() => ({
    q: params.get('q') || '',
    category: params.get('category') || '',
    condition: params.get('condition') || '',
    min: params.get('min') || '',
    max: params.get('max') || '',
  }), [params]);
  const [draft, setDraft] = useState(applied);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setDraft(applied);
  }, [applied]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getProducts({
      q: applied.q || undefined,
      category: applied.category || undefined,
      condition: applied.condition || undefined,
      min: applied.min ? Number(applied.min) : undefined,
      max: applied.max ? Number(applied.max) : undefined,
    })
      .then((data) => {
        if (active) setProducts(data || []);
      })
      .catch(() => {
        if (active) setError('تعذر تحميل نتائج البحث. حاول مجدداً.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applied]);

  const applyFilters = (event?: FormEvent) => {
    event?.preventDefault();
    const query = new URLSearchParams();
    Object.entries(draft).forEach(([key, value]) => {
      const normalized = value.trim();
      if (normalized) query.set(key, normalized);
    });
    router.push(query.size ? `/search?${query.toString()}` : '/search');
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    const empty = { q: '', category: '', condition: '', min: '', max: '' };
    setDraft(empty);
    router.push('/search');
    setFiltersOpen(false);
  };

  const activeFilterCount = [applied.category, applied.condition, applied.min, applied.max].filter(Boolean).length;
  const filterPanel = (
    <form onSubmit={applyFilters} className="surface-card p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-black text-slate-900">
          <SlidersHorizontal className="h-5 w-5 text-emerald-700" />
          تصفية النتائج
        </h2>
        <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 text-sm font-extrabold text-slate-500 hover:text-red-700">
          <X className="h-4 w-4" />
          مسح
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="filter-search" className="mb-1.5 block text-sm font-extrabold text-slate-700">كلمة البحث</label>
          <div className="relative">
            <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="filter-search" type="search" value={draft.q} onChange={(event) => setDraft((value) => ({ ...value, q: event.target.value }))} className="field pr-10" placeholder="مثال: هاتف سامسونج" />
          </div>
        </div>
        <div>
          <label htmlFor="filter-category" className="mb-1.5 block text-sm font-extrabold text-slate-700">الفئة</label>
          <select id="filter-category" value={draft.category} onChange={(event) => setDraft((value) => ({ ...value, category: event.target.value }))} className="field">
            <option value="">كل الفئات</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filter-condition" className="mb-1.5 block text-sm font-extrabold text-slate-700">حالة المنتج</label>
          <select id="filter-condition" value={draft.condition} onChange={(event) => setDraft((value) => ({ ...value, condition: event.target.value }))} className="field">
            <option value="">كل الحالات</option>
            {conditions.map((condition) => <option key={condition.value} value={condition.value}>{condition.label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-extrabold text-slate-700">نطاق السعر (د.ج)</label>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" min="0" inputMode="numeric" value={draft.min} onChange={(event) => setDraft((value) => ({ ...value, min: event.target.value }))} className="field" placeholder="من" aria-label="أقل سعر" />
            <input type="number" min="0" inputMode="numeric" value={draft.max} onChange={(event) => setDraft((value) => ({ ...value, max: event.target.value }))} className="field" placeholder="إلى" aria-label="أعلى سعر" />
          </div>
        </div>
        <button type="submit" className="btn-primary w-full">عرض النتائج</button>
      </div>
    </form>
  );

  return (
    <div className="page-shell" dir="rtl">
      <div className="mb-8 rounded-3xl bg-slate-950 px-5 py-8 text-white sm:px-8">
        <p className="text-sm font-extrabold text-emerald-300">ابحث بدقة</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-black">{applied.q ? `نتائج: ${applied.q}` : 'كل المنتجات'}</h1>
            <p className="mt-2 text-sm text-slate-300">استخدم الفلاتر للوصول إلى المنتج المناسب بسرعة.</p>
          </div>
          <span className="w-fit rounded-xl bg-white/10 px-4 py-2 text-sm font-extrabold">{loading ? 'جاري البحث...' : `${products.length} نتيجة`}</span>
        </div>
      </div>

      <div className="mb-5 md:hidden">
        <button type="button" onClick={() => setFiltersOpen((value) => !value)} className="btn-secondary w-full justify-between" aria-expanded={filtersOpen}>
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-emerald-700" />
            الفلاتر
            {activeFilterCount > 0 && <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-700 px-1.5 text-xs text-white">{activeFilterCount}</span>}
          </span>
          <ChevronDown className={`h-5 w-5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {filtersOpen && <div className="mb-6 md:hidden">{filterPanel}</div>}

      <div className="grid gap-7 md:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="hidden md:block">{filterPanel}</aside>
        <section className="min-w-0">
          {error ? <div className="notice-error">{error}</div> : <ProductList products={products} loading={loading} emptyMessage="لم نجد منتجات مطابقة. غيّر كلمة البحث أو وسّع نطاق الفلاتر." />}
        </section>
      </div>
    </div>
  );
}
