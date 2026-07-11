import Link from 'next/link';
import { ShieldCheck, Zap, HeadphonesIcon } from 'lucide-react';

export default function Hero() {
  return (
    <section className="bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:pt-20 md:pb-14">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block mb-4 text-sm font-bold text-zinc-600 bg-zinc-100 border border-zinc-200 px-4 py-1.5 rounded-full">
            منصة البيع والشراء في الجزائر
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-zinc-900 leading-tight mb-4">
            اشترِ وبيع كل ما تريد في <span className="text-zinc-500">alg shop</span>
          </h1>
          <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
            منصة موحدة لإعلان منتجاتك للبيع والشراء بسهولة. أضف صور، وصف، سعر، وتواصل مباشر مع المشترين.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/search"
              className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 py-3 rounded-full transition-colors"
            >
              تصفح المنتجات
            </Link>
            <Link
              href="/sell"
              className="w-full sm:w-auto bg-white hover:bg-zinc-100 text-zinc-900 font-bold px-8 py-3 rounded-full border border-zinc-300 transition-colors"
            >
              أضف منتجك للبيع
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 px-4 py-2 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-zinc-900" />
              <span>تواصل آمن</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 px-4 py-2 rounded-xl">
              <Zap className="w-4 h-4 text-zinc-900" />
              <span>إعلان سريع</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 px-4 py-2 rounded-xl">
              <HeadphonesIcon className="w-4 h-4 text-zinc-900" />
              <span>دعم مباشر</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
