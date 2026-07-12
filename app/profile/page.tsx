'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  LogOut,
  Package,
  PlusCircle,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  TrendingUp,
  User,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { getSellerRating, getSellerReviews, getUserOrders, getUserProducts, getUserSales } from '@/lib/services';
import type { Order, Product, Review } from '@/types';

type Tab = 'products' | 'sales' | 'reviews' | 'orders';

const orderLabels: Record<Order['status'], string> = {
  pending: 'قيد المراجعة',
  confirmed: 'تم التأكيد',
  shipped: 'قيد التوصيل',
  delivered: 'مكتمل',
  cancelled: 'ملغي',
};

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState({ rating: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isSeller = user?.userType === 'seller';
  const tabs: { key: Tab; label: string; icon: React.ElementType; count: number }[] = isSeller
    ? [
        { key: 'products', label: 'منتجاتي', icon: Package, count: products.length },
        { key: 'sales', label: 'الطلبات الواردة', icon: TrendingUp, count: sales.length },
        { key: 'reviews', label: 'التقييمات', icon: Star, count: reviews.length },
      ]
    : [{ key: 'orders', label: 'طلباتي', icon: ShoppingCart, count: orders.length }];

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setActiveTab(user.userType === 'seller' ? 'products' : 'orders');
    setLoading(true);
    setError('');
    const requests =
      user.userType === 'seller'
        ? Promise.all([getUserProducts(user.uid), getUserSales(user.uid), getSellerReviews(user.uid), getSellerRating(user.uid)])
            .then(([nextProducts, nextSales, nextReviews, nextRating]) => {
              setProducts(nextProducts);
              setSales(nextSales);
              setReviews(nextReviews);
              setRating(nextRating);
            })
        : getUserOrders(user.uid).then(setOrders);

    requests
      .catch(() => setError('تعذر تحميل بيانات الحساب حالياً. حاول تحديث الصفحة.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return <PageLoader />;

  if (!user) {
    return (
      <div className="page-shell flex min-h-[60vh] items-center justify-center">
        <div className="surface-card w-full max-w-md p-7 text-center sm:p-9">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><User className="h-8 w-8" /></span>
          <h1 className="mt-5 text-2xl font-black text-slate-950">سجّل الدخول لعرض حسابك</h1>
          <p className="mt-3 leading-7 text-slate-600">ستجد هنا منتجاتك وطلباتك وتقييماتك في مكان واحد.</p>
          <Link href="/auth?next=%2Fprofile" className="btn-primary mt-6 w-full">تسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell" dir="rtl">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-lg">
            {isSeller ? <Store className="h-9 w-9" /> : <ShoppingBag className="h-9 w-9" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-3xl font-black">{user.displayName || 'مستخدم Algshop'}</h1>
              <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-extrabold text-emerald-200">{isSeller ? 'حساب بائع' : 'حساب مشتري'}</span>
            </div>
            <p className="mt-2 break-all text-sm text-slate-300">{user.email}</p>
            {user.phone && <p className="mt-1 text-sm text-slate-300" dir="ltr">{user.phone}</p>}
            {isSeller && (
              <div className="mt-3 flex items-center gap-2">
                <Stars rating={rating.rating} />
                <span className="text-sm font-bold text-slate-300">{rating.rating || 0} من 5 · {rating.count} تقييم</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {isSeller && <Link href="/sell" className="btn-primary"><PlusCircle className="h-5 w-5" />أضف منتجاً</Link>}
            <button type="button" onClick={signOut} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 font-extrabold text-white hover:bg-white/10">
              <LogOut className="h-5 w-5" />
              خروج
            </button>
          </div>
        </div>
      </section>

      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-extrabold ${activeTab === tab.key ? 'border-emerald-700 bg-emerald-700 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300'}`} role="tab" aria-selected={activeTab === tab.key}>
              <Icon className="h-4 w-4" />
              {tab.label}
              <span className={`rounded-md px-2 py-0.5 text-xs ${activeTab === tab.key ? 'bg-white/15' : 'bg-slate-100'}`}>{tab.count}</span>
            </button>
          );
        })}
      </div>

      <section className="mt-6">
        {error ? (
          <div className="notice-error">{error}</div>
        ) : loading ? (
          <div className="surface-card flex min-h-52 items-center justify-center gap-3 font-bold text-slate-500"><Loader2 className="h-6 w-6 animate-spin text-emerald-700" />جاري تحميل البيانات...</div>
        ) : activeTab === 'products' ? (
          <ProductsList products={products} />
        ) : activeTab === 'sales' ? (
          <OrdersList orders={sales} sellerView />
        ) : activeTab === 'reviews' ? (
          <ReviewsList reviews={reviews} rating={rating} />
        ) : (
          <OrdersList orders={orders} />
        )}
      </section>
    </div>
  );
}

function ProductsList({ products }: { products: Product[] }) {
  if (!products.length) {
    return <EmptyState icon={<Package className="h-7 w-7" />} title="لم تنشر أي منتجات بعد" description="ابدأ بإضافة صور واضحة وسعر ووصف مختصر لمنتجك." action={<Link href="/sell" className="btn-primary">أضف أول منتج<ArrowLeft className="h-4 w-4" /></Link>} />;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Link key={product.id} href={`/product/${product.id}`} className="surface-card flex min-w-0 gap-4 p-4 transition hover:-translate-y-0.5 hover:border-emerald-300">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
            <Image src={product.images[0] || '/images/placeholder.svg'} alt={product.title} fill sizes="96px" className="object-cover" unoptimized />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 font-extrabold text-slate-900">{product.title}</h3>
            <p className="mt-2 font-black text-emerald-700">{product.price.toLocaleString('ar-DZ')} د.ج</p>
            <p className="mt-2 flex items-center gap-1 text-xs font-bold text-slate-500"><CalendarDays className="h-3.5 w-3.5" />{new Date(product.createdAt).toLocaleDateString('ar-DZ')}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function OrdersList({ orders, sellerView = false }: { orders: Order[]; sellerView?: boolean }) {
  if (!orders.length) {
    return <EmptyState icon={<ShoppingCart className="h-7 w-7" />} title={sellerView ? 'لا توجد طلبات واردة بعد' : 'لم ترسل أي طلبات بعد'} description={sellerView ? 'ستظهر هنا الطلبات الجديدة التي يرسلها المشترون.' : 'تصفح المنتجات وأرسل طلباً للبائع، ثم تابعه من هنا.'} action={!sellerView ? <Link href="/search" className="btn-primary">تصفح المنتجات<ArrowLeft className="h-4 w-4" /></Link> : undefined} />;
  }
  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <article key={order.id} className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:w-24">
            <Image src={order.productImage || '/images/placeholder.svg'} alt={order.productTitle} fill sizes="96px" className="object-cover" unoptimized />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 font-extrabold text-slate-900">{order.productTitle}</h3>
            <p className="mt-1 font-black text-emerald-700">{order.price.toLocaleString('ar-DZ')} د.ج</p>
            <p className="mt-2 text-sm text-slate-600">{sellerView ? `المشتري: ${order.buyerName} · ${order.buyerPhone}` : `البائع: ${order.sellerName || 'بائع Algshop'}`}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">{new Date(order.createdAt).toLocaleDateString('ar-DZ')}</p>
          </div>
          <span className={`w-fit rounded-lg px-3 py-1.5 text-xs font-extrabold ${order.status === 'cancelled' ? 'bg-red-50 text-red-700' : order.status === 'delivered' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
            {orderLabels[order.status]}
          </span>
        </article>
      ))}
    </div>
  );
}

function ReviewsList({ reviews, rating }: { reviews: Review[]; rating: { rating: number; count: number } }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[17rem_1fr]">
      <div className="surface-card h-fit p-6 text-center">
        <p className="text-5xl font-black text-slate-950">{rating.rating || 0}</p>
        <div className="mt-3 flex justify-center"><Stars rating={rating.rating} /></div>
        <p className="mt-2 text-sm font-bold text-slate-500">{rating.count} تقييم</p>
      </div>
      {!reviews.length ? (
        <EmptyState icon={<Star className="h-7 w-7" />} title="لا توجد تقييمات بعد" description="ستظهر تقييمات المشترين هنا بعد التعامل معك." />
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="surface-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><User className="h-5 w-5" /></span>
                  <div><p className="font-extrabold text-slate-900">{review.buyerName}</p><p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString('ar-DZ')}</p></div>
                </div>
                <Stars rating={review.rating} />
              </div>
              {review.comment && <p className="mt-4 leading-7 text-slate-600">{review.comment}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return <div className="flex items-center gap-0.5 text-amber-400">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className={`h-4 w-4 ${index < Math.round(rating) ? 'fill-current' : 'text-slate-300'}`} />)}</div>;
}

function EmptyState({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="surface-card flex min-h-60 flex-col items-center justify-center p-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">{icon}</span>
      <h2 className="mt-4 text-xl font-black text-slate-900">{title}</h2>
      <p className="mt-2 max-w-md leading-7 text-slate-600">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function PageLoader() {
  return <div className="page-shell flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>;
}
