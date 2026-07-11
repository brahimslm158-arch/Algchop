'use client';

import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  FieldValue,
  orderBy,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { isDemoMode } from './config';
import type { Product, Order, UserProfile, ProductStatus, Review, UserType } from '@/types';

const PRODUCTS_KEY = 'algshop_products_v2';
const ORDERS_KEY = 'algshop_orders_v2';
const USER_KEY = 'algshop_user_v2';
const REVIEWS_KEY = 'algshop_reviews_v1';

// --- helpers ---

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value && typeof value === 'object' && (value as { toDate?: unknown }).toDate) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

function normalizeProduct(docId: string, data: Record<string, unknown>): Product {
  return {
    id: docId,
    title: (data.title as string) || '',
    description: (data.description as string) || '',
    price: Number(data.price) || 0,
    originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
    category: (data.category as string) || '',
    condition: (data.condition as 'new' | 'used' | 'refurbished') || 'new',
    images: Array.isArray(data.images) ? (data.images as string[]) : [],
    options: data.options ? (data.options as Product['options']) : undefined,
    phone: (data.phone as string) || '',
    email: (data.email as string) || undefined,
    location: (data.location as string) || undefined,
    sellerId: (data.sellerId as string) || '',
    sellerName: (data.sellerName as string) || '',
    sellerPhone: (data.sellerPhone as string) || undefined,
    sellerEmail: (data.sellerEmail as string) || undefined,
    sellerPhotoURL: (data.sellerPhotoURL as string) || undefined,
    status: (data.status as ProductStatus) || 'active',
    views: Number(data.views) || 0,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function normalizeOrder(docId: string, data: Record<string, unknown>): Order {
  return {
    id: docId,
    productId: (data.productId as string) || '',
    productTitle: (data.productTitle as string) || '',
    productImage: (data.productImage as string) || undefined,
    price: Number(data.price) || 0,
    selectedOptions: (data.selectedOptions as Record<string, string>) || undefined,
    buyerName: (data.buyerName as string) || '',
    buyerPhone: (data.buyerPhone as string) || '',
    buyerAddress: (data.buyerAddress as string) || undefined,
    buyerEmail: (data.buyerEmail as string) || undefined,
    buyerId: (data.buyerId as string) || undefined,
    sellerId: (data.sellerId as string) || '',
    sellerName: (data.sellerName as string) || undefined,
    sellerPhone: (data.sellerPhone as string) || undefined,
    status: (data.status as Order['status']) || 'pending',
    notes: (data.notes as string) || undefined,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function normalizeUserProfile(uid: string, data: Record<string, unknown>): UserProfile {
  return {
    uid,
    displayName: (data.displayName as string) || null,
    email: (data.email as string) || null,
    phone: (data.phone as string) || null,
    photoURL: (data.photoURL as string) || null,
    userType: ((data.userType as UserType) === 'seller' ? 'seller' : 'buyer'),
    bio: (data.bio as string) || undefined,
    location: (data.location as string) || undefined,
    createdAt: (data.createdAt as string) || new Date().toISOString(),
  };
}

// --- demo ---

function getDemoData<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function setDemoData<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function seedDemoProducts() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(PRODUCTS_KEY)) return;
  const products: Product[] = [
    {
      id: 'demo-1',
      title: 'آيفون 15 Pro Max - 256GB',
      description:
        'هاتف أيفون 15 برو ماكس بحالة ممتازة، مع الكرتون وجميع الملحقات. ضمان لمدة سنة.',
      price: 145000,
      originalPrice: 160000,
      category: 'إلكترونيات',
      condition: 'new',
      images: [
        'https://picsum.photos/seed/algshop1/800/600',
        'https://picsum.photos/seed/algshop1b/800/600',
      ],
      phone: '0555123456',
      email: 'seller@example.com',
      location: 'الجزائر العاصمة',
      sellerId: 'demo-seller',
      sellerName: 'متجر التقنية',
      sellerPhone: '0555123456',
      sellerEmail: 'seller@example.com',
      status: 'active',
      views: 124,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'demo-2',
      title: 'ساعة ذكية Samsung Galaxy Watch 6',
      description:
        'ساعة ذكية بحالة جيدة، مع شاحن أصلي. تتبع النوم والرياضة، مقاومة للماء.',
      price: 22000,
      category: 'إلكترونيات',
      condition: 'used',
      images: [
        'https://picsum.photos/seed/algshop2/800/600',
      ],
      phone: '0666123456',
      location: 'وهران',
      sellerId: 'demo-seller-2',
      sellerName: 'أحمد',
      sellerPhone: '0666123456',
      status: 'active',
      views: 45,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'demo-3',
      title: 'كنبة جلد ثلاثية',
      description: 'كنبة جلد فاخرة باللون البني، مستعملة لمدة قصيرة، نظيفة جداً.',
      price: 65000,
      originalPrice: 90000,
      category: 'منزل',
      condition: 'used',
      images: [
        'https://picsum.photos/seed/algshop3/800/600',
      ],
      phone: '0777123456',
      location: 'قسنطينة',
      sellerId: 'demo-seller-3',
      sellerName: 'محمد',
      sellerPhone: '0777123456',
      status: 'active',
      views: 78,
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: 'demo-4',
      title: 'حذاء رياضي Nike Air Max',
      description: 'حذاء رياضي أصلي مقاس 43، لون أسود/أبيض، جديد غير مستعمل.',
      price: 9500,
      category: 'أزياء',
      condition: 'new',
      images: [
        'https://picsum.photos/seed/algshop4/800/600',
      ],
      options: [{ name: 'المقاس', values: ['41', '42', '43', '44'] }],
      phone: '0555987654',
      location: 'عنابة',
      sellerId: 'demo-seller-4',
      sellerName: 'رياضة سبور',
      sellerPhone: '0555987654',
      status: 'active',
      views: 210,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'demo-5',
      title: 'دراجة هوائية جبلية',
      description: 'دراجة هوائية جبلية بـ 21 سرعة، مناسبة للطرق الوعرة والمغامرات.',
      price: 42000,
      originalPrice: 55000,
      category: 'رياضة',
      condition: 'refurbished',
      images: [
        'https://picsum.photos/seed/algshop5/800/600',
      ],
      phone: '0666998877',
      location: 'البليدة',
      sellerId: 'demo-seller-5',
      sellerName: 'ياسين',
      sellerPhone: '0666998877',
      status: 'active',
      views: 33,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];
  setDemoData(PRODUCTS_KEY, products);
}

function seedDemoOrders() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(ORDERS_KEY)) return;
  const orders: Order[] = [];
  setDemoData(ORDERS_KEY, orders);
}

function getDemoCurrentUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
}

function setDemoCurrentUser(user: UserProfile | null) {
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event('algshop-auth'));
}

// --- auth ---

export function onAuthStateChange(callback: (user: UserProfile | null) => void) {
  if (isDemoMode) {
    const handler = () => callback(getDemoCurrentUser());
    window.addEventListener('algshop-auth', handler);
    return () => window.removeEventListener('algshop-auth', handler);
  }
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, async (user) => {
    callback(user ? await getUserProfile(user.uid) : null);
  });
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (isDemoMode) return getDemoCurrentUser();
  if (!auth) return null;
  const user = auth.currentUser;
  return user ? getUserProfile(user.uid) : null;
}

async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (isDemoMode) return getDemoCurrentUser();
  if (!db) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return normalizeUserProfile(uid, snap.data() as Record<string, unknown>);
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  phone: string,
  userType: UserType = 'buyer'
): Promise<UserProfile> {
  if (isDemoMode) {
    const user: UserProfile = {
      uid: `demo-${Date.now()}`,
      displayName,
      email,
      phone,
      photoURL: null,
      userType,
      createdAt: new Date().toISOString(),
    };
    setDemoCurrentUser(user);
    return user;
  }
  if (!auth || !db) throw new Error('Firebase not configured');
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  const profile: UserProfile = {
    uid: cred.user.uid,
    displayName,
    email,
    phone,
    photoURL: null,
    userType,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', cred.user.uid), profile, { merge: true });
  return profile;
}

export async function signIn(email: string, password: string): Promise<UserProfile> {
  if (isDemoMode) {
    const user = getDemoCurrentUser();
    if (!user) throw new Error('لا يوجد حساب تجريبي');
    return user;
  }
  if (!auth) throw new Error('Firebase not configured');
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(cred.user.uid);
  if (!profile) throw new Error('لم يتم العثور على الملف الشخصي');
  return profile;
}

export async function signInWithGoogle(
  userType?: UserType,
  phone?: string
): Promise<UserProfile> {
  if (isDemoMode) {
    const user: UserProfile = {
      uid: `demo-google-${Date.now()}`,
      displayName: 'مستخدم Google',
      email: 'demo-google@example.com',
      phone: phone || null,
      photoURL: null,
      userType: userType || 'buyer',
      createdAt: new Date().toISOString(),
    };
    setDemoCurrentUser(user);
    return user;
  }
  if (!auth || !db) throw new Error('Firebase not configured');
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const existing = await getUserProfile(cred.user.uid);
  if (existing) return existing;
  const profile: UserProfile = {
    uid: cred.user.uid,
    displayName: cred.user.displayName || 'مستخدم Google',
    email: cred.user.email,
    phone: phone || cred.user.phoneNumber,
    photoURL: cred.user.photoURL,
    userType: userType || 'buyer',
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', cred.user.uid), profile, { merge: true });
  return profile;
}

export async function signOut() {
  if (isDemoMode) {
    setDemoCurrentUser(null);
    return;
  }
  if (!auth) return;
  await firebaseSignOut(auth);
}

export async function updateUserProfile(data: Partial<UserProfile>) {
  if (isDemoMode) {
    const user = getDemoCurrentUser();
    if (!user) throw new Error('غير مسجل الدخول');
    const updated = { ...user, ...data };
    setDemoCurrentUser(updated);
    return updated;
  }
  const current = await getCurrentUser();
  if (!current || !db) throw new Error('غير مسجل الدخول');
  await updateDoc(doc(db, 'users', current.uid), { ...data, updatedAt: serverTimestamp() });
  return { ...current, ...data };
}

// --- reviews ---

function normalizeReview(docId: string, data: Record<string, unknown>): Review {
  return {
    id: docId,
    sellerId: (data.sellerId as string) || '',
    buyerId: (data.buyerId as string) || '',
    buyerName: (data.buyerName as string) || '',
    rating: Number(data.rating) || 0,
    comment: (data.comment as string) || undefined,
    createdAt: toIso(data.createdAt),
  };
}

export async function getSellerReviews(sellerId: string): Promise<Review[]> {
  if (isDemoMode) {
    const reviews = getDemoData<Review>(REVIEWS_KEY);
    return reviews
      .filter((r) => r.sellerId === sellerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  if (!db) return [];
  const snap = await getDocs(query(collection(db, 'reviews'), where('sellerId', '==', sellerId), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => normalizeReview(d.id, d.data() as Record<string, unknown>));
}

export async function getSellerRating(sellerId: string): Promise<{ rating: number; count: number }> {
  const reviews = await getSellerReviews(sellerId);
  if (!reviews.length) return { rating: 0, count: 0 };
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return { rating: Math.round(avg * 10) / 10, count: reviews.length };
}

export async function addSellerReview(sellerId: string, buyerId: string, buyerName: string, rating: number, comment?: string): Promise<Review> {
  if (rating < 1 || rating > 5) throw new Error('التقييم يجب أن يكون بين 1 و 5');
  const review: Review = {
    id: `review-${Date.now()}`,
    sellerId,
    buyerId,
    buyerName,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  };
  if (isDemoMode) {
    const reviews = getDemoData<Review>(REVIEWS_KEY);
    reviews.push(review);
    setDemoData(REVIEWS_KEY, reviews);
    return review;
  }
  if (!db) throw new Error('Firebase not configured');
  const docRef = await addDoc(collection(db, 'reviews'), {
    ...review,
    createdAt: serverTimestamp(),
  });
  return { ...review, id: docRef.id };
}

// --- products ---

export interface ProductFilters {
  q?: string;
  category?: string;
  min?: number;
  max?: number;
  condition?: string;
  sellerId?: string;
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  if (isDemoMode) {
    seedDemoProducts();
    let products = getDemoData<Product>(PRODUCTS_KEY);
    products = products.filter((p) => p.status === 'active');
    if (filters.category) products = products.filter((p) => p.category === filters.category);
    if (filters.condition) products = products.filter((p) => p.condition === filters.condition);
    if (filters.sellerId) products = products.filter((p) => p.sellerId === filters.sellerId);
    if (filters.min) products = products.filter((p) => p.price >= (filters.min || 0));
    if (filters.max) products = products.filter((p) => p.price <= (filters.max || Infinity));
    if (filters.q) {
      const q = filters.q.toLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  if (!db) return [];
  const q = filters.category
    ? query(collection(db, 'products'), where('category', '==', filters.category))
    : query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  let products = snap.docs.map((d) => normalizeProduct(d.id, d.data() as Record<string, unknown>));
  products = products.filter((p) => p.status === 'active');
  if (filters.q) {
    const q = filters.q.toLowerCase();
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }
  if (filters.condition) products = products.filter((p) => p.condition === filters.condition);
  if (filters.sellerId) products = products.filter((p) => p.sellerId === filters.sellerId);
  if (filters.min) products = products.filter((p) => p.price >= (filters.min || 0));
  if (filters.max) products = products.filter((p) => p.price <= (filters.max || Infinity));
  return products;
}

export async function getProduct(id: string): Promise<Product | null> {
  if (isDemoMode) {
    seedDemoProducts();
    const products = getDemoData<Product>(PRODUCTS_KEY);
    return products.find((p) => p.id === id) || null;
  }
  if (!db) return null;
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) return null;
  return normalizeProduct(snap.id, snap.data() as Record<string, unknown>);
}

export async function getUserProducts(userId: string): Promise<Product[]> {
  if (isDemoMode) {
    seedDemoProducts();
    const products = getDemoData<Product>(PRODUCTS_KEY);
    return products.filter((p) => p.sellerId === userId);
  }
  if (!db) return [];
  const snap = await getDocs(query(collection(db, 'products'), where('sellerId', '==', userId)));
  return snap.docs.map((d) => normalizeProduct(d.id, d.data() as Record<string, unknown>));
}

export async function createProduct(input: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<Product> {
  const payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & {
    createdAt: string | FieldValue;
    updatedAt: string | FieldValue;
    views: number;
  } = {
    ...input,
    views: 0,
    createdAt: isDemoMode ? new Date().toISOString() : serverTimestamp(),
    updatedAt: isDemoMode ? new Date().toISOString() : serverTimestamp(),
  };
  if (isDemoMode) {
    seedDemoProducts();
    const products = getDemoData<Product>(PRODUCTS_KEY);
    const product: Product = { ...payload, id: `demo-${Date.now()}`, createdAt: payload.createdAt as string, updatedAt: payload.updatedAt as string };
    products.unshift(product);
    setDemoData(PRODUCTS_KEY, products);
    return product;
  }
  if (!db) throw new Error('Firebase not configured');
  const docRef = await addDoc(collection(db, 'products'), payload as Record<string, unknown>);
  return { ...payload, id: docRef.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

export async function updateProduct(
  id: string,
  input: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Product> {
  if (isDemoMode) {
    const products = getDemoData<Product>(PRODUCTS_KEY);
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('المنتج غير موجود');
    products[idx] = { ...products[idx], ...input, updatedAt: new Date().toISOString() };
    setDemoData(PRODUCTS_KEY, products);
    return products[idx];
  }
  if (!db) throw new Error('Firebase not configured');
  await updateDoc(doc(db, 'products', id), { ...input, updatedAt: serverTimestamp() });
  const updated = await getProduct(id);
  if (!updated) throw new Error('المنتج غير موجود');
  return updated;
}

export async function deleteProduct(id: string) {
  if (isDemoMode) {
    const products = getDemoData<Product>(PRODUCTS_KEY).filter((p) => p.id !== id);
    setDemoData(PRODUCTS_KEY, products);
    return;
  }
  if (!db) throw new Error('Firebase not configured');
  await deleteDoc(doc(db, 'products', id));
}

export async function incrementViews(id: string) {
  const product = await getProduct(id);
  if (!product) return;
  await updateProduct(id, { views: (product.views || 0) + 1 });
}

// --- orders ---

export async function createOrder(input: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Order> {
  const order: Omit<Order, 'id'> = {
    ...input,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (isDemoMode) {
    seedDemoOrders();
    const orders = getDemoData<Order>(ORDERS_KEY);
    const created = { ...order, id: `order-${Date.now()}` } as Order;
    orders.unshift(created);
    setDemoData(ORDERS_KEY, orders);
    return created;
  }
  if (!db) throw new Error('Firebase not configured');
  const docRef = await addDoc(collection(db, 'orders'), {
    ...order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { ...order, id: docRef.id };
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  if (isDemoMode) {
    seedDemoOrders();
    const orders = getDemoData<Order>(ORDERS_KEY);
    return orders.filter((o) => o.buyerId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  if (!db) return [];
  const snap = await getDocs(query(collection(db, 'orders'), where('buyerId', '==', userId)));
  return snap.docs.map((d) => normalizeOrder(d.id, d.data() as Record<string, unknown>)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getUserSales(sellerId: string): Promise<Order[]> {
  if (isDemoMode) {
    seedDemoOrders();
    const orders = getDemoData<Order>(ORDERS_KEY);
    return orders.filter((o) => o.sellerId === sellerId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  if (!db) return [];
  const snap = await getDocs(query(collection(db, 'orders'), where('sellerId', '==', sellerId)));
  return snap.docs.map((d) => normalizeOrder(d.id, d.data() as Record<string, unknown>)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateOrderStatus(id: string, status: Order['status']) {
  if (isDemoMode) {
    const orders = getDemoData<Order>(ORDERS_KEY);
    const idx = orders.findIndex((o) => o.id === id);
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], status, updatedAt: new Date().toISOString() };
      setDemoData(ORDERS_KEY, orders);
    }
    return;
  }
  if (!db) throw new Error('Firebase not configured');
  await updateDoc(doc(db, 'orders', id), { status, updatedAt: serverTimestamp() });
}

// --- upload ---

export async function uploadImages(files: File[]): Promise<string[]> {
  if (!files.length) return [];
  if (isDemoMode) {
    const urls: string[] = [];
    for (const file of files) {
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      urls.push(url);
    }
    return urls;
  }
  const urls: string[] = [];
  for (const file of files) {
    const data = new FormData();
    data.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: data,
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(body || 'فشل في الحصول على رابط الرفع');
    }
    const { publicUrl } = (await res.json()) as { publicUrl: string };
    urls.push(publicUrl);
  }
  return urls;
}
