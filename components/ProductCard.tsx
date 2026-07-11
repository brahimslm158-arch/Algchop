import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Heart } from 'lucide-react';
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
    <Link href={`/product/${product.id}`} className="group" dir="rtl">
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-900 transition-colors h-full flex flex-col">
        <div className="relative aspect-[4/3] bg-zinc-100">
          {hasDiscount && (
            <span className="absolute top-3 right-3 z-10 bg-zinc-900 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">
              {conditionLabels[product.condition] || product.condition}
            </span>
            <span className="text-xs font-bold text-zinc-500">{product.category}</span>
          </div>

          <h3 className="text-zinc-900 font-bold mb-2 line-clamp-2 leading-snug">
            {product.title}
          </h3>

          <div className="flex items-end gap-2 mb-3">
            <span className="text-xl font-black text-zinc-900">
              {product.price.toLocaleString('ar-DZ')} د.ج
            </span>
            {hasDiscount && (
              <span className="text-sm text-zinc-400 line-through mb-0.5">
                {product.originalPrice!.toLocaleString('ar-DZ')}
              </span>
            )}
          </div>

          {product.location && (
            <div className="flex items-center gap-1 text-zinc-500 text-xs font-bold mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{product.location}</span>
            </div>
          )}

          <div className="mt-auto flex items-center justify-between pt-3 border-t border-zinc-100">
            <span className="text-xs font-bold text-zinc-700 truncate max-w-[70%]">
              {product.sellerName || 'بائع'}
            </span>
            <div className="flex items-center gap-1 text-zinc-500">
              <Heart className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{product.views || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
