'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import {
  Search,
  Menu,
  X,
  User,
  Package,
  LogOut,
  PlusCircle,
  ShoppingBag,
  Store,
  ChevronDown,
  Home,
  Grid3X3,
} from 'lucide-react';

const categories = [
  { slug: 'إلكترونيات', label: 'إلكترونيات' },
  { slug: 'أزياء', label: 'أزياء' },
  { slug: 'منزل', label: 'منزل' },
  { slug: 'رياضة', label: 'رياضة' },
  { slug: 'سيارات', label: 'سيارات' },
  { slug: 'كتب', label: 'كتب' },
  { slug: 'ألعاب', label: 'ألعاب' },
  { slug: 'خدمات', label: 'خدمات' },
];

export default function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setOpen(false);
    }
  };

  const isActive = (href: string) => pathname === href;
  const userTypeLabel = user?.userType === 'seller' ? 'بائع' : 'مشتري';

  const Logo = (
    <div className="inline-flex items-center gap-1.5" dir="ltr">
      <div className="bg-zinc-900 text-white font-black px-2.5 py-1 rounded-lg text-lg tracking-tight">
        alg
      </div>
      <span className="font-black text-xl tracking-tight text-zinc-900">shop</span>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 h-16">
          <Link href="/" className="flex-shrink-0">
            {Logo}
          </Link>

          <form onSubmit={onSearch} className="flex-1 max-w-2xl mx-4" dir="ltr">
            <div className="flex items-center rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن منتج، فئة، بائع..."
                className="flex-1 px-4 py-3 bg-transparent text-zinc-900 outline-none"
                dir="rtl"
              />
              <button
                type="submit"
                className="flex items-center justify-center w-10 h-10 m-1 bg-zinc-900 text-white rounded-full transition-colors"
                aria-label="بحث"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 text-zinc-700 hover:text-zinc-900 font-bold bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-full px-3 py-2 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user.displayName || 'حسابي'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
                    <div className="p-3 border-b border-zinc-100">
                      <p className="font-bold text-zinc-900 text-sm truncate">{user.displayName || 'حسابي'}</p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {userTypeLabel}
                      </span>
                    </div>
                    <div className="p-2 space-y-1">
                      <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 text-sm font-bold transition-colors">
                        <Package className="w-4 h-4" />
                        <span>إدارة الملف الشخصي</span>
                      </Link>
                      {user.userType === 'seller' && (
                        <Link href="/sell" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 text-sm font-bold transition-colors">
                          <PlusCircle className="w-4 h-4" />
                          <span>أضف منتج للبيع</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 text-sm font-bold transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}

                {profileOpen && (
                  <button
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setProfileOpen(false)}
                    aria-label="إغلاق القائمة"
                  />
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth"
                  className="text-zinc-700 hover:text-zinc-900 font-bold px-4 py-2 rounded-full hover:bg-zinc-100 transition-colors"
                >
                  دخول
                </Link>
                <Link
                  href="/auth"
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-4 py-2 rounded-full transition-colors"
                >
                  حساب جديد
                </Link>
              </div>
            )}

            {(!user || user.userType === 'seller') && (
              <Link
                href="/sell"
                className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-full font-bold transition-colors"
              >
                <Store className="w-4 h-4" />
                <span>بيع</span>
              </Link>
            )}

            <Link
              href="/profile"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="القائمة"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <nav className="hidden md:block bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 h-11 overflow-x-auto text-sm font-bold no-scrollbar">
            <Link href="/" className={`flex items-center gap-1 ${isActive('/') ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}>
              <Home className="w-3.5 h-3.5" />
              الرئيسية
            </Link>
            <Link href="/search" className={`flex items-center gap-1 ${isActive('/search') ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}>
              <Grid3X3 className="w-3.5 h-3.5" />
              كل الفئات
            </Link>
            {categories.map((c) => {
              const href = `/categories/${encodeURIComponent(c.slug)}`;
              return (
                <Link
                  key={c.slug}
                  href={href}
                  className={`whitespace-nowrap ${isActive(href) ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
                >
                  {c.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {open && (
        <div className="md:hidden fixed inset-0 z-50 bg-zinc-900/30" onClick={() => setOpen(false)}>
          <div
            className="absolute top-0 right-0 w-80 max-w-full h-full bg-white border-l border-zinc-200 p-5 flex flex-col"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="flex-shrink-0" onClick={() => setOpen(false)}>
                {Logo}
              </Link>
              <button onClick={() => setOpen(false)} className="p-2 rounded-full bg-zinc-100 text-zinc-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSearch} className="flex items-center rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden mb-6" dir="ltr">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث..."
                className="flex-1 px-4 py-2.5 bg-transparent outline-none text-zinc-900"
                dir="rtl"
              />
              <button type="submit" className="flex items-center justify-center w-9 h-9 m-1 bg-zinc-900 text-white rounded-full" aria-label="بحث">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/categories/${encodeURIComponent(c.slug)}`}
                  className="flex items-center justify-center px-3 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 text-sm font-bold hover:bg-zinc-100 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {c.label}
                </Link>
              ))}
              <Link
                href="/search"
                className="flex items-center justify-center px-3 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 text-sm font-bold hover:bg-zinc-100 transition-colors"
                onClick={() => setOpen(false)}
              >
                كل الفئات
              </Link>
            </div>

            <div className="space-y-2 mb-6">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-zinc-200 text-zinc-700 font-bold hover:bg-zinc-100 transition-colors">
                <Home className="w-5 h-5" />
                الرئيسية
              </Link>
              <Link href="/search" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-zinc-200 text-zinc-700 font-bold hover:bg-zinc-100 transition-colors">
                <Grid3X3 className="w-5 h-5" />
                استعرض المنتجات
              </Link>
              {user?.userType === 'seller' && (
                <Link href="/sell" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors">
                  <Store className="w-5 h-5" />
                  أضف منتج للبيع
                </Link>
              )}
              <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-zinc-200 text-zinc-700 font-bold hover:bg-zinc-100 transition-colors">
                <Package className="w-5 h-5" />
                {user ? 'ملفي الشخصي' : 'حسابي'}
              </Link>
            </div>

            <div className="mt-auto pt-4 border-t border-zinc-100">
              {user ? (
                <button
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  تسجيل الخروج
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/auth" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-zinc-100 text-zinc-700 font-bold hover:bg-zinc-200 transition-colors">
                    دخول
                  </Link>
                  <Link href="/auth" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors">
                    حساب جديد
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
