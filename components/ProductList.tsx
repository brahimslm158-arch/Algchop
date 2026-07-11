import ProductCard from './ProductCard';
import type { Product } from '@/types';

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function ProductList({
  products,
  loading,
  emptyMessage = 'لا توجد منتجات مطابقة',
}: ProductListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm animate-pulse"
          >
            <div className="aspect-[4/3] bg-zinc-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-zinc-200 rounded-full w-3/4" />
              <div className="h-4 bg-zinc-200 rounded-full w-1/2" />
              <div className="h-8 bg-zinc-200 rounded-full w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-16 text-zinc-500" dir="rtl">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
