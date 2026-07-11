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
  MapPin,
  ChevronDown,
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setOpen(false);
    }
  };

  const active = (href: string) =>
    pathname === href ? 'text-zinc-900 font-semibold' : 'text-zinc-500 hover:text-zinc-900';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-zinc-100' : 'bg-white/60 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-18 py-3">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-zinc-900 text-white font-extrabold px-3 py-1.5 rounded-xl text-xl tracking-tight">
              alg
            </div>
            <span className="font-bold text-2xl tracking-tight text-zinc-900">shop</span>
          </Link>

          <div className="hidden md:flex items-center text-sm text-zinc-500 flex-shrink-0">
            <MapPin className="w-4 h-4 ml-1" />
            <span>الجزائر</span>
          </div>

          <form onSubmit={onSearch} className="flex-1 mx-4">
            <div className="relative flex rounded-full overflow-hidden bg-zinc-100 border border-zinc-200/60 focus-within:bg-white focus-within:border-zinc-300 focus-within:ring-2 focus-within:ring-zinc-200 transition-all">
              <select className="hidden sm:block bg-transparent text-zinc-600 text-sm px-4 outline-none border-l border-zinc-200/60">
                <option>الكل</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن منتج، فئة، بائع..."
                className="w-full px-4 py-2.5 bg-transparent text-zinc-900 outline-none"
                dir="rtl"
              />
              <button
                type="submit"
                className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 flex items-center justify-center rounded-full transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="hidden md:flex items-center gap-3 text-sm flex-shrink-0">
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-zinc-700 hover:text-zinc-900 font-medium bg-white/60 hover:bg-white border border-zinc-200/60 rounded-full px-3 py-2 transition-all">
                  <User className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">{user.displayName || 'حسابي'}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute left-0 top-full mt-2 w-52 glass rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl hover:bg-zinc-50 transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    <span>إدارة المبيعات والطلبات</span>
                  </Link>
                  {user.userType === 'seller' && (
                    <Link
                      href="/sell"
                      className="flex items-center gap-2 px-4 py-3 rounded-2xl hover:bg-zinc-50 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>أضف منتج للبيع</span>
                    </Link>
                  )}
                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl hover:bg-zinc-50 text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth"
                className="text-zinc-700 hover:text-zinc-900 font-medium px-4 py-2 rounded-full hover:bg-zinc-100 transition-colors"
              >
                تسجيل الدخول
              </Link>
            )}
            {(!user || user.userType === 'seller') && (
              <Link
                href="/sell"
                className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-zinc-900/10 hover:shadow-zinc-900/20"
              >
                <PlusCircle className="w-4 h-4" />
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

      <nav className="hidden md:block border-t border-zinc-100/50 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8 h-10 overflow-x-auto text-sm font-medium">
            <Link href="/search" className={active('/search')}>
              كل الفئات
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/categories/${encodeURIComponent(c.slug)}`}
                className={active(`/categories/${c.slug}`)}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {open && (
        <div className="md:hidden glass border-t border-zinc-100/50">
          <div className="px-4 py-4 space-y-3 max-w-7xl mx-auto">
            <form onSubmit={onSearch} className="flex">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث..."
                className="flex-1 px-4 py-2 text-zinc-900 bg-zinc-100 rounded-r-full outline-none"
                dir="rtl"
              />
              <button
                type="submit"
                className="bg-zinc-900 text-white px-5 rounded-l-full"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/categories/${encodeURIComponent(c.slug)}`}
                className="block text-zinc-700 hover:text-zinc-900 font-medium"
                onClick={() => setOpen(false)}
              >
                {c.label}
              </Link>
            ))}
            <hr className="border-zinc-100" />
            {user ? (
              <>
                <Link href="/profile" className="block text-zinc-700 hover:text-zinc-900">
                  حسابي
                </Link>
                {user.userType === 'seller' && (
                  <Link href="/sell" className="block text-zinc-700 hover:text-zinc-900">
                    أضف منتج للبيع
                  </Link>
                )}
                <button onClick={signOut} className="block text-red-600">
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <Link href="/auth" className="block text-zinc-700 hover:text-zinc-900">
                تسجيل الدخول / حساب جديد
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
