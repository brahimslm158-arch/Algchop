import Link from 'next/link';
import { ArrowLeft, BadgeCheck, MapPin, Search, ShieldCheck, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-emerald-950/10 bg-gradient-to-b from-emerald-50 via-white to-transparent" dir="rtl">
      <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-extrabold text-emerald-800 shadow-sm">
            <Sparkles className="h-4 w-4" />
            سوق الجزائر، بطريقة أبسط
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.3] text-slate-950 sm:text-5xl lg:text-6xl">
            كل ما تبحث عنه،
            <span className="block text-emerald-700">أقرب مما تتوقع.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            اكتشف منتجات من بائعين محليين، قارن الأسعار، وتواصل مباشرة. وإن كنت بائعاً، انشر إعلانك بخطوات واضحة وسريعة.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/search" className="btn-primary w-full sm:w-auto">
              <Search className="h-5 w-5" />
              تصفح المنتجات
            </Link>
            <Link href="/auth?mode=signup&type=seller&next=%2Fsell" className="btn-secondary w-full sm:w-auto">
              ابدأ البيع
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold text-slate-600">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-700" />تواصل مباشر وآمن</span>
            <span className="inline-flex items-center gap-2"><MapPin className="h-5 w-5 text-emerald-700" />بائعون من مختلف الولايات</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="surface-card relative overflow-hidden p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-emerald-700">تجربة واضحة من البداية</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">ابحث. اختر. تواصل.</h2>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                <BadgeCheck className="h-6 w-6" />
              </span>
            </div>
            <div className="space-y-3">
              {[
                ['01', 'اكتب ما تبحث عنه', 'بحث سريع حسب المنتج أو الفئة'],
                ['02', 'قارن التفاصيل', 'صور وأسعار وحالة المنتج بوضوح'],
                ['03', 'أرسل طلبك', 'يتواصل معك البائع لتأكيد التفاصيل'],
              ].map(([number, title, description]) => (
                <div key={number} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white font-black text-emerald-700 shadow-sm">{number}</span>
                  <div>
                    <p className="font-black text-slate-900">{title}</p>
                    <p className="mt-1 text-sm text-slate-500">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-5 -left-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-lg sm:-left-8">
            <p className="text-xs font-bold text-slate-500">النشر</p>
            <p className="font-black text-emerald-700">بدون عمولات معقدة</p>
          </div>
        </div>
      </div>
    </section>
  );
}
