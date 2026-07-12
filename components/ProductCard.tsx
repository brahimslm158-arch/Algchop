import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpLeft, Eye, MapPin } from 'lucide-react';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

const conditionLabels: Record<string, string> = {
  new: 'جديد',
  used: 'مستعمل',
  refurbished: 'مجدد',
};

export default function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0] || '/images/placeholder.svg';
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discount = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <Link href={`/product/${product.id}`} className="group block h-full" dir="rtl">
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_26px_rgba(15,50,43,0.05)] transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_16px_35px_rgba(15,80,68,0.12)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {hasDiscount && (
            <span className="absolute right-3 top-3 z-10 rounded-lg bg-emerald-700 px-2.5 py-1 text-xs font-extrabold text-white shadow-sm">
              -{discount}%
            </span>
          )}
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            unoptimized
          />
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-extrabold text-emerald-800">
              {conditionLabels[product.condition] || product.condition}
            </span>
            <span className="truncate text-xs font-bold text-slate-500">{product.category}</span>
          </div>

          <h3 className="mb-3 line-clamp-2 min-h-12 font-extrabold leading-6 text-slate-900">
            {product.title}
          </h3>

          <div className="mb-3 flex flex-wrap items-end gap-2">
            <span className="text-xl font-black text-emerald-800">
              {product.price.toLocaleString('ar-DZ')} د.ج
            </span>
            {hasDiscount && (
              <span className="mb-0.5 text-sm text-slate-400 line-through">
                {product.originalPrice!.toLocaleString('ar-DZ')}
              </span>
            )}
          </div>

          {product.location && (
            <div className="mb-3 flex items-center gap-1 text-xs font-bold text-slate-500">
              <MapPin className="w-3.5 h-3.5" />
              <span>{product.location}</span>
            </div>
          )}

          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="max-w-[65%] truncate text-xs font-extrabold text-slate-700">
              {product.sellerName || 'بائع'}
            </span>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span className="text-xs font-bold">{product.views || 0}</span>
              </span>
              <ArrowUpLeft className="h-4 w-4 text-emerald-700" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
