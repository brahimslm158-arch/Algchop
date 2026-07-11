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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" dir="rtl">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-zinc-200 rounded-2xl overflow-hidden h-full flex flex-col"
          >
            <div className="aspect-[4/3] bg-zinc-100 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-zinc-100 rounded-full w-3/4 animate-pulse" />
              <div className="h-4 bg-zinc-100 rounded-full w-1/2 animate-pulse" />
              <div className="h-4 bg-zinc-100 rounded-full w-2/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center" dir="rtl">
        <p className="text-zinc-600 text-lg font-bold">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" dir="rtl">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
