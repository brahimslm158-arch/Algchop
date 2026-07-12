import ProductCard from './ProductCard';
import type { Product } from '@/types';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  emptyMessage?: string;
}

export default function ProductList({
  products,
  loading,
  emptyMessage = 'لا توجد منتجات مطابقة.',
}: ProductListProps) {
  if (loading) {
    return (
      <div className="product-grid" dir="rtl" aria-label="جاري تحميل المنتجات">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white"
          >
            <div className="aspect-[4/3] animate-pulse bg-slate-100" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-100" />
              <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="surface-card p-10 text-center" dir="rtl">
        <p className="text-lg font-extrabold text-slate-700">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="product-grid" dir="rtl">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
