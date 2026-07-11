'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import {
  getProduct,
  createOrder,
  getProducts,
  incrementViews,
  getSellerRating,
  getSellerReviews,
  addSellerReview,
} from '@/lib/services';
import type { Product, Order, Review } from '@/types';
import {
  Phone,
  Mail,
  MapPin,
  Store,
  Calendar,
  Eye,
  CheckCircle,
  Tag,
  ShieldCheck,
  Star,
  User,
} from 'lucide-react';

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

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [related, setRelated] = useState<Product[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [form, setForm] = useState({
    buyerName: user?.displayName || '',
    buyerPhone: user?.phone || '',
    buyerEmail: user?.email || '',
    buyerAddress: '',
    notes: '',
  });
  const [rating, setRating] = useState({ rating: 0, count: 0 });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const viewed = useRef(false);

  useEffect(() => {
    setLoading(true);
    getProduct(id)
      .then((p) => {
        setProduct(p);
        if (p) {
          setSelectedImage(0);
          setForm({
            buyerName: user?.displayName || '',
            buyerPhone: user?.phone || '',
            buyerEmail: user?.email || '',
            buyerAddress: '',
            notes: '',
          });
          getProducts({ category: p.category, sellerId: p.sellerId })
            .then((list) => setRelated(list.filter((x) => x.id !== p.id).slice(0, 4)))
            .catch(() => setRelated([]));
          getSellerRating(p.sellerId).then(setRating);
          getSellerReviews(p.sellerId).then(setReviews);
        }
      })
      .finally(() => setLoading(false));
  }, [id, user?.displayName, user?.phone, user?.email]);

  useEffect(() => {
    if (id && !viewed.current) {
      viewed.current = true;
      incrementViews(id).catch(() => {});
    }
  }, [id]);

  const onSubmitOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.buyerName || !form.buyerPhone) return;
    setOrderLoading(true);
    try {
      const order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        productId: product!.id,
        productTitle: product!.title,
        productImage: product!.images[0],
        price: product!.price,
        selectedOptions: selectedOptions,
        buyerName: form.buyerName,
        buyerPhone: form.buyerPhone,
        buyerEmail: form.buyerEmail || undefined,
        buyerAddress: form.buyerAddress || undefined,
        buyerId: user?.uid,
        sellerId: product!.sellerId,
        sellerName: product!.sellerName,
        sellerPhone: product!.sellerPhone,
        notes: form.notes || undefined,
      };
      await createOrder(order);
      setOrderSuccess(true);
    } finally {
      setOrderLoading(false);
    }
  };

  const onSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    if (reviewForm.rating < 1) return;
    setReviewLoading(true);
    try {
      await addSellerReview(
        product.sellerId,
        user.uid,
        user.displayName || 'مشتري',
        reviewForm.rating,
        reviewForm.comment
      );
      const [newRating, newReviews] = await Promise.all([
        getSellerRating(product.sellerId),
        getSellerReviews(product.sellerId),
      ]);
      setRating(newRating);
      setReviews(newReviews);
      setReviewSuccess(true);
      setReviewForm({ rating: 0, comment: '' });
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center" dir="rtl">
        جاري تحميل المنتج...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center" dir="rtl">
        <h1 className="text-xl font-bold text-zinc-900 mb-2">المنتج غير موجود</h1>
        <Link href="/search" className="text-zinc-700 hover:underline">
          العودة إلى المنتجات
        </Link>
      </div>
    );
  }

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const canReview = user && user.userType === 'buyer' && user.uid !== product.sellerId;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-4">
            <div className="relative aspect-square md:aspect-[16/10] bg-zinc-100 rounded-2xl overflow-hidden">
              <Image
                src={product.images[selectedImage] || '/images/placeholder.svg'}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-contain"
                unoptimized
                priority
              />
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-zinc-900 text-white font-bold px-3 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto p-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-zinc-900 shadow-md' : 'border-zinc-200'
                    }`}
                  >
                    <Image src={img} alt="" fill sizes="80px" className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6 mt-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-zinc-100 text-zinc-700 text-sm font-medium px-3 py-1 rounded-full">
                {product.category}
              </span>
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  conditionClasses[product.condition] || 'bg-zinc-100 text-zinc-700'
                }`}
              >
                {conditionLabels[product.condition] || product.condition}
              </span>
              <span className="text-zinc-400 text-sm flex items-center gap-1 mr-auto">
                <Eye className="w-4 h-4" />
                {product.views}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4">
              {product.title}
            </h1>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-bold text-zinc-900">
                {product.price.toLocaleString('ar-DZ')} د.ج
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-zinc-400 line-through">
                  {product.originalPrice.toLocaleString('ar-DZ')} د.ج
                </span>
              )}
            </div>

            <div className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </div>

            {product.options && product.options.length > 0 && (
              <div className="mt-6 pt-6 border-t border-zinc-100">
                <h3 className="font-bold text-zinc-900 mb-4">الخيارات المتاحة</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.options.map((opt) => (
                    <div key={opt.name}>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                        {opt.name}
                      </label>
                      <select
                        value={selectedOptions[opt.name] || ''}
                        onChange={(e) =>
                          setSelectedOptions((prev) => ({ ...prev, [opt.name]: e.target.value }))
                        }
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                      >
                        <option value="">اختر {opt.name}</option>
                        {opt.values.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {reviews.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-zinc-900 mb-4">تقييمات البائع</h3>
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="bg-white rounded-2xl border border-zinc-100 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-700">
                          <User className="w-4 h-4" />
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
                ))}
              </div>
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-zinc-900 mb-4">منتجات ذات صلة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    className="bg-white rounded-2xl border border-zinc-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-[4/3] bg-zinc-100">
                      <Image
                        src={p.images[0] || '/images/placeholder.svg'}
                        alt={p.title}
                        fill
                        sizes="25vw"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-zinc-900 line-clamp-2">{p.title}</h4>
                      <p className="text-zinc-900 font-bold mt-1">
                        {p.price.toLocaleString('ar-DZ')} د.ج
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center">
                <Store className="w-7 h-7 text-zinc-700" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900">{product.sellerName}</h3>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <StarRating rating={rating.rating} />
                  <span>({rating.count} تقييم)</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-zinc-700 mb-6">
              {product.sellerPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-zinc-900" />
                  <a href={`tel:${product.sellerPhone}`} className="hover:text-zinc-900 hover:underline">
                    {product.sellerPhone}
                  </a>
                </div>
              )}
              {product.sellerEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-zinc-900" />
                  <a href={`mailto:${product.sellerEmail}`} className="hover:text-zinc-900 hover:underline">
                    {product.sellerEmail}
                  </a>
                </div>
              )}
              {product.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-zinc-900" />
                  <span>{product.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-900" />
                <span>نُشر: {new Date(product.createdAt).toLocaleDateString('ar-DZ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-zinc-900" />
                <span>الحالة: {conditionLabels[product.condition] || product.condition}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-900" />
                <span>الدفع عند الاستلام متاح</span>
              </div>
            </div>

            {orderSuccess ? (
              <div className="bg-zinc-100 text-zinc-900 p-5 rounded-2xl flex items-start gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p>تم إرسال طلبك بنجاح. سيتواصل البائع معك قريباً.</p>
              </div>
            ) : (
              <form onSubmit={onSubmitOrder} className="space-y-3">
                <h4 className="font-bold text-zinc-900">طلب شراء</h4>
                <input
                  type="text"
                  required
                  placeholder="الاسم الكامل"
                  value={form.buyerName}
                  onChange={(e) => setForm((f) => ({ ...f, buyerName: e.target.value }))}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                />
                <input
                  type="tel"
                  required
                  placeholder="رقم الهاتف"
                  value={form.buyerPhone}
                  onChange={(e) => setForm((f) => ({ ...f, buyerPhone: e.target.value }))}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                />
                <input
                  type="email"
                  placeholder="البريد الإلكتروني (اختياري)"
                  value={form.buyerEmail}
                  onChange={(e) => setForm((f) => ({ ...f, buyerEmail: e.target.value }))}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                />
                <input
                  type="text"
                  placeholder="العنوان (اختياري)"
                  value={form.buyerAddress}
                  onChange={(e) => setForm((f) => ({ ...f, buyerAddress: e.target.value }))}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                />
                <textarea
                  placeholder="ملاحظات (اختياري)"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={orderLoading}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-bold py-3 rounded-full transition-all shadow-lg shadow-zinc-900/10"
                >
                  {orderLoading ? 'جاري الإرسال...' : 'اطلب الآن'}
                </button>
                <p className="text-xs text-zinc-500 text-center">
                  لا يتم خصم أي مبلغ. البائع سيتواصل معك لتأكيد الطلب.
                </p>
              </form>
            )}

            {canReview && !reviewSuccess && (
              <form onSubmit={onSubmitReview} className="mt-6 pt-6 border-t border-zinc-100 space-y-3">
                <h4 className="font-bold text-zinc-900">قيّم البائع</h4>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReviewForm((f) => ({ ...f, rating: i + 1 }))}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          i < reviewForm.rating ? 'text-yellow-500 fill-current' : 'text-zinc-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="تعليقك (اختياري)"
                  rows={2}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-200 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={reviewLoading || reviewForm.rating === 0}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-bold py-2.5 rounded-full transition-all"
                >
                  {reviewLoading ? 'جاري الإرسال...' : 'إرسال التقييم'}
                </button>
              </form>
            )}

            {reviewSuccess && (
              <div className="mt-6 pt-6 border-t border-zinc-100 text-center text-zinc-700 font-medium">
                شكراً! تم إرسال تقييمك.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
