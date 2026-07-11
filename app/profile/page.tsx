'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getUserProducts, getUserSales, getUserOrders, getProduct, getSellerReviews, getSellerRating } from '@/lib/services';
import Image from 'next/image';
import type { Product, Order, Review } from '@/types';
import {
  User,
  Package,
  ShoppingCart,
  TrendingUp,
  LogOut,
  PlusCircle,
  ArrowLeft,
  Loader2,
  Star,
  Store,
  ShoppingBag,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState({ rating: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  const isSeller = user?.userType === 'seller';
  const isBuyer = user?.userType === 'buyer';

  const tabs = [
    isSeller && { key: 'products', label: 'منتجاتي', icon: Package },
    isSeller && { key: 'sales', label: 'مبيعاتي', icon: TrendingUp },
    isSeller && { key: 'reviews', label: 'التقييمات', icon: Star },
    isBuyer && { key: 'orders', label: 'طلباتي', icon: ShoppingCart },
  ].filter(Boolean) as { key: string; label: string; icon: React.ElementType }[];

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      getUserProducts(user.uid),
      getUserSales(user.uid),
      getUserOrders(user.uid),
      getSellerReviews(user.uid),
      getSellerRating(user.uid),
    ])
      .then(([p, s, o, r, ratingResult]) => {
        setProducts(p);
        setSales(s);
        setOrders(o);
        setReviews(r);
        setRating(ratingResult);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center" dir="rtl">
        جاري التحميل...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center" dir="rtl">
        <h1 className="text-2xl font-bold text-zinc-900 mb-4">يجب تسجيل الدخول</h1>
        <p className="text-zinc-500 mb-6">سجّل الدخول أو أنشئ حساباً جديداً لعرض ملفك الشخصي.</p>
        <a
          href="/auth"
          className="inline-block bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 py-3 rounded-full transition-all shadow-lg shadow-zinc-900/10"
        >
          تسجيل الدخول / حساب جديد
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
      <div className="glass rounded-3xl p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center text-white shrink-0">
            {isSeller ? <Store className="w-10 h-10" /> : <ShoppingBag className="w-10 h-10" />}
          </div>
          <div className="flex-1 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-bold text-zinc-900">{user.displayName || 'مستخدم'}</h1>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                {isSeller ? 'بائع' : 'مشتري'}
              </span>
            </div>
            <p className="text-zinc-500">{user.email}</p>
            {user.phone && <p className="text-zinc-500 text-sm">{user.phone}</p>}
            {isSeller && (
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-zinc-700">
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold mx-1">{rating.rating || 0}</span>
                </div>
                <span className="text-sm text-zinc-500">({rating.count} تقييم)</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href="/sell"
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-zinc-900/10"
            >
              <PlusCircle className="w-4 h-4" />
              أضف منتج
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 px-5 py-2.5 rounded-full font-medium transition-all"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/10'
                  : 'bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-zinc-500">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : activeTab === 'products' ? (
        <ProductsList products={products} />
      ) : activeTab === 'sales' ? (
        <SalesList sales={sales} />
      ) : activeTab === 'reviews' ? (
        <ReviewsList reviews={reviews} rating={rating} />
      ) : (
        <OrdersList orders={orders} />
      )}
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-yellow-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < Math.round(rating) ? 'fill-current' : 'text-zinc-300'}`}
        />
      ))}
    </div>
  );
}

function ProductsList({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="text-center py-16 glass rounded-3xl">
        <p className="text-zinc-500 mb-4">لم تنشر أي منتجات بعد.</p>
        <Link
          href="/sell"
          className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 rounded-full font-medium transition-all"
        >
          أضف أول منتج للبيع
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/product/${p.id}`}
          className="flex gap-4 bg-white rounded-2xl border border-zinc-100 p-4 hover:shadow-lg transition-all duration-300"
        >
          <div className="w-24 h-24 bg-zinc-100 rounded-2xl shrink-0 overflow-hidden relative">
            <Image src={p.images[0] || '/images/placeholder.svg'} alt={p.title} fill sizes="96px" className="object-cover" unoptimized />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-zinc-900 line-clamp-2 mb-1">{p.title}</h3>
            <p className="text-zinc-900 font-bold">{p.price.toLocaleString('ar-DZ')} د.ج</p>
            <p className="text-xs text-zinc-400 mt-2">
              {new Date(p.createdAt).toLocaleDateString('ar-DZ')}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function SalesList({ sales }: { sales: Order[] }) {
  if (!sales.length) {
    return (
      <div className="text-center py-16 glass rounded-3xl">
        <p className="text-zinc-500">لا توجد مبيعات بعد.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {sales.map((order) => (
        <OrderItem key={order.id} order={order} />
      ))}
    </div>
  );
}

function ReviewsList({ reviews, rating }: { reviews: Review[]; rating: { rating: number; count: number } }) {
  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-5 flex items-center gap-4">
        <div className="text-4xl font-extrabold text-zinc-900">{rating.rating || 0}</div>
        <div>
          <StarRating rating={rating.rating} />
          <p className="text-sm text-zinc-500 mt-1">{rating.count} تقييم</p>
        </div>
      </div>
      {!reviews.length ? (
        <div className="text-center py-12 glass rounded-3xl">
          <p className="text-zinc-500">لا توجد تقييمات بعد.</p>
        </div>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-700">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 text-sm">{review.buyerName}</p>
                  <p className="text-xs text-zinc-400">
                    {new Date(review.createdAt).toLocaleDateString('ar-DZ')}
                  </p>
                </div>
              </div>
              <StarRating rating={review.rating} />
            </div>
            {review.comment && <p className="text-zinc-700 text-sm leading-relaxed">{review.comment}</p>}
          </div>
        ))
      )}
    </div>
  );
}

function OrdersList({ orders }: { orders: Order[] }) {
  if (!orders.length) {
    return (
      <div className="text-center py-16 glass rounded-3xl">
        <p className="text-zinc-500">لم تُقدم أي طلبات بعد.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderItem key={order.id} order={order} />
      ))}
    </div>
  );
}

function OrderItem({ order }: { order: Order }) {
  const [product, setProduct] = useState<Product | null>(null);
  useEffect(() => {
    getProduct(order.productId).then(setProduct);
  }, [order.productId]);

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-4 flex gap-4 items-center hover:shadow-lg transition-all duration-300">
      <div className="w-20 h-20 bg-zinc-100 rounded-2xl overflow-hidden shrink-0 relative">
        <Image src={product?.images[0] || order.productImage || '/images/placeholder.svg'} alt={order.productTitle} fill sizes="80px" className="object-cover" unoptimized />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-zinc-900 line-clamp-1">{order.productTitle}</h3>
        <p className="text-zinc-900 font-bold text-sm mt-1">{order.price.toLocaleString('ar-DZ')} د.ج</p>
        <p className="text-xs text-zinc-500 mt-1">المشتري: {order.buyerName} - {order.buyerPhone}</p>
        <p className="text-xs text-zinc-400 mt-1">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-DZ') : ''}</p>
      </div>
      <span className="text-xs font-medium px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full">
        {order.status === 'pending' ? 'قيد الانتظار' : order.status === 'delivered' ? 'مكتمل' : 'ملغي'}
      </span>
    </div>
  );
}
