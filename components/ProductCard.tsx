import Link from 'next/link';
import Image from 'next/image';
import { MapPin, User } from 'lucide-react';
import type { Product } from '@/types';

const conditionLabels: Record<string, string> = {
  new: 'جديد',
  used: 'مستعمل',
  refurbished: 'مجدد',
};

const conditionClasses: Record<string, string> = {
  new: 'bg-zinc-900 text-white',
  used: 'bg-zinc-200 text-zinc-800',
  refurbished: 'bg-zinc-100 text-zinc-800 border border-zinc-200',
};

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images[0] || '/images/placeholder.svg';
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
        <Image
          src={image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-zinc-900 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1" dir="rtl">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              conditionClasses[product.condition] || 'bg-zinc-100 text-zinc-700'
            }`}
          >
            {conditionLabels[product.condition] || product.condition}
          </span>
          <span className="text-xs text-zinc-400">{product.category}</span>
        </div>
        <h3 className="font-semibold text-zinc-900 line-clamp-2 mb-2 group-hover:text-zinc-700 transition-colors">
          {product.title}
        </h3>
        <div className="mt-auto flex items-end gap-2">
          <span className="text-lg font-bold text-zinc-900">
            {product.price.toLocaleString('ar-DZ')} د.ج
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-zinc-400 line-through">
              {product.originalPrice.toLocaleString('ar-DZ')} د.ج
            </span>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{product.sellerName}</span>
          </div>
          {product.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{product.location}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
