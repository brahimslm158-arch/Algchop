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
  Loader2,
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
  const [loadError, setLoadError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [related, setRelated] = useState<Product[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');
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
  const [reviewError, setReviewError] = useState('');
  const viewed = useRef(false);

  useEffect(() => {
    setLoading(true);
    setLoadError('');
    getProduct(id)
      .then((p) => {
        setProduct(p);
        if (p) {
          setSelectedImage(0);
          getProducts({ category: p.category })
            .then((list) => setRelated((list || []).filter((x) => x.id !== p.id).slice(0, 4)))
            .catch(() => setRelated([]));
          getSellerRating(p.sellerId).then(setRating).catch(() => setRating({ rating: 0, count: 0 }));
          getSellerReviews(p.sellerId).then(setReviews).catch(() => setReviews([]));
        }
      })
      .catch(() => {
        setProduct(null);
        setLoadError('تعذر تحميل المنتج. تحقق من اتصالك وحاول مرة أخرى.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      buyerName: current.buyerName || user?.displayName || '',
      buyerPhone: current.buyerPhone || user?.phone || '',
      buyerEmail: current.buyerEmail || user?.email || '',
    }));
  }, [user]);

  useEffect(() => {
    if (id && !viewed.current) {
      viewed.current = true;
      incrementViews(id).catch(() => {});
    }
  }, [id]);

  const onSubmitOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setOrderError('');
    const missingOption = product.options?.find((option) => !selectedOptions[option.name]);
    if (missingOption) {
      setOrderError(`اختر ${missingOption.name} قبل إرسال الطلب.`);
      return;
    }
    if (form.buyerName.trim().length < 2) {
      setOrderError('أدخل اسمك الكامل.');
      return;
    }
    if (form.buyerPhone.replace(/\D/g, '').length < 8) {
      setOrderError('أدخل رقم هاتف صحيحاً.');
      return;
    }
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
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'تعذر إرسال الطلب. حاول مرة أخرى.');
    } finally {
      setOrderLoading(false);
    }
  };

  const onSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    setReviewError('');
    if (reviewForm.rating < 1) {
      setReviewError('اختر تقييماً من نجمة إلى خمس نجوم.');
      return;
    }
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
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'تعذر إرسال التقييم. حاول مرة أخرى.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell flex min-h-[60vh] items-center justify-center gap-3 font-extrabold text-slate-600" dir="rtl">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-700" />جاري تحميل المنتج...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-shell flex min-h-[60vh] items-center justify-center text-center" dir="rtl">
        <div className="surface-card w-full max-w-md p-8">
          <h1 className="text-2xl font-black text-slate-950">{loadError ? 'تعذر عرض المنتج' : 'المنتج غير موجود'}</h1>
          <p className="mt-3 leading-7 text-slate-600">{loadError || 'ربما تم حذف المنتج أو إيقاف عرضه.'}</p>
          <Link href="/search" className="btn-primary mt-6 w-full">العودة إلى المنتجات</Link>
        </div>
      </div>
    );
  }

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const canReview = Boolean(user && user.uid !== product.sellerId);
  const canOrder = !user || user.uid !== product.sellerId;

  return (
    <div className="page-shell" dir="rtl">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="surface-card p-3 sm:p-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 md:aspect-[16/10]">
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
                <span className="absolute left-3 top-3 rounded-lg bg-emerald-700 px-3 py-1 font-extrabold text-white">
                  -{discount}%
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto p-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                      selectedImage === i ? 'border-emerald-700' : 'border-slate-200'
                    }`}
                  >
                    <Image src={img} alt="" fill sizes="80px" className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="surface-card mt-6 p-5 sm:p-7">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-extrabold text-emerald-800">
                {product.category}
              </span>
              <span
                className={`text-sm font-bold px-3 py-1 rounded-full ${
                  conditionClasses[product.condition] || 'bg-zinc-100 text-zinc-700'
                }`}
              >
                {conditionLabels[product.condition] || product.condition}
              </span>
              <span className="text-zinc-500 text-sm font-bold flex items-center gap-1 mr-auto">
                <Eye className="w-4 h-4" />
                {product.views}
              </span>
            </div>
            <h1 className="mb-4 text-2xl font-black text-slate-950 md:text-3xl">
              {product.title}
            </h1>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-black text-emerald-700">
                {product.price.toLocaleString('ar-DZ')} د.ج
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-zinc-400 line-through font-bold">
                  {product.originalPrice.toLocaleString('ar-DZ')} د.ج
                </span>
              )}
            </div>

            <div className="whitespace-pre-wrap text-base font-medium leading-8 text-slate-700">
              {product.description}
            </div>

            {product.options && product.options.length > 0 && (
              <div className="mt-6 pt-6 border-t border-zinc-100">
                <h3 className="font-bold text-zinc-900 mb-4">الخيارات المتاحة</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.options.map((opt) => (
                    <div key={opt.name}>
                      <label className="block text-sm font-bold text-zinc-700 mb-1.5">
                        {opt.name}
                      </label>
                      <select
                        value={selectedOptions[opt.name] || ''}
                        onChange={(e) =>
                          setSelectedOptions((prev) => ({ ...prev, [opt.name]: e.target.value }))
                        }
                        className="field"
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
              <h3 className="text-xl font-black text-zinc-900 mb-4">تقييمات البائع</h3>
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="surface-card p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-700">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 text-sm">{review.buyerName}</p>
                          <p className="text-xs text-zinc-500 font-bold">
                            {new Date(review.createdAt).toLocaleDateString('ar-DZ')}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.comment && <p className="text-zinc-700 text-sm leading-relaxed font-bold">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-black text-zinc-900 mb-4">منتجات ذات صلة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    className="surface-card overflow-hidden transition hover:-translate-y-0.5 hover:border-emerald-300"
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
                      <h4 className="font-bold text-zinc-900 line-clamp-2">{p.title}</h4>
                      <p className="mt-1 font-black text-emerald-700">
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
          <div className="surface-card p-5 sm:p-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                <Store className="h-7 w-7 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900">{product.sellerName}</h3>
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-500">
                  <StarRating rating={rating.rating} />
                  <span>({rating.count} تقييم)</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm font-bold text-zinc-700 mb-6">
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
              <div className="notice-success flex items-start gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p>تم إرسال طلبك بنجاح. سيتواصل البائع معك قريباً.</p>
              </div>
            ) : canOrder ? (
              <form onSubmit={onSubmitOrder} className="space-y-3">
                <h4 className="font-black text-slate-950">أرسل طلب شراء</h4>
                {orderError && <div className="notice-error text-sm" role="alert">{orderError}</div>}
                <input
                  type="text"
                  required
                  placeholder="الاسم الكامل"
                  value={form.buyerName}
                  onChange={(e) => setForm((f) => ({ ...f, buyerName: e.target.value }))}
                  className="field text-sm"
                />
                <input
                  type="tel"
                  required
                  placeholder="رقم الهاتف"
                  value={form.buyerPhone}
                  onChange={(e) => setForm((f) => ({ ...f, buyerPhone: e.target.value }))}
                  className="field text-sm"
                />
                <input
                  type="email"
                  placeholder="البريد الإلكتروني (اختياري)"
                  value={form.buyerEmail}
                  onChange={(e) => setForm((f) => ({ ...f, buyerEmail: e.target.value }))}
                  className="field text-sm"
                />
                <input
                  type="text"
                  placeholder="العنوان (اختياري)"
                  value={form.buyerAddress}
                  onChange={(e) => setForm((f) => ({ ...f, buyerAddress: e.target.value }))}
                  className="field text-sm"
                />
                <textarea
                  placeholder="ملاحظات (اختياري)"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="field min-h-20 resize-y text-sm"
                />
                <button
                  type="submit"
                  disabled={orderLoading}
                  className="btn-primary w-full"
                >
                  {orderLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {orderLoading ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </button>
                <p className="text-xs text-zinc-500 text-center font-bold">
                  لا يتم خصم أي مبلغ. البائع سيتواصل معك لتأكيد الطلب.
                </p>
              </form>
            ) : (
              <div className="notice-info">هذا منتجك، لذلك لا يمكنك إرسال طلب شراء لنفسك.</div>
            )}

            <div className="mt-6 pt-6 border-t border-zinc-100 space-y-3">
              <h4 className="font-bold text-zinc-900">قيّم البائع</h4>
              {!user ? (
                <Link
                  href={`/auth?next=${encodeURIComponent(`/product/${product.id}`)}`}
                  className="btn-secondary w-full"
                >
                  سجّل الدخول للتقييم
                </Link>
              ) : reviewSuccess ? (
                <p className="text-center text-zinc-700 font-bold">شكراً! تم إرسال تقييمك.</p>
              ) : canReview ? (
                <form onSubmit={onSubmitReview} className="space-y-3">
                  {reviewError && <div className="notice-error text-sm" role="alert">{reviewError}</div>}
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
                    className="field min-h-20 resize-y text-sm"
                  />
                  <button
                    type="submit"
                    disabled={reviewLoading || reviewForm.rating === 0}
                    className="btn-primary w-full"
                  >
                    {reviewLoading ? 'جاري الإرسال...' : 'إرسال التقييم'}
                  </button>
                </form>
              ) : (
                <p className="text-sm text-zinc-500 font-bold">لا يمكنك تقييم نفسك.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
