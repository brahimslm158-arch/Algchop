import { ShoppingBag } from 'lucide-react';

export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" dir="ltr" aria-label="Algshop">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="text-xl font-black tracking-tight text-slate-900">
          alg<span className="text-emerald-700">shop</span>
        </span>
      )}
    </span>
  );
}
