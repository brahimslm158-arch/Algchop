'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  Grid3X3,
  Home,
  LogOut,
  Menu,
  Package,
  Search,
  Store,
  User,
  X,
} from 'lucide-react';
import Brand from './Brand';
import { useAuth } from './AuthProvider';

const categories = ['إلكترونيات', 'أزياء', 'منزل', 'رياضة', 'سيارات', 'كتب', 'ألعاب', 'خدمات'];

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const closeProfile = (event: PointerEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('pointerdown', closeProfile);
    return () => document.removeEventListener('pointerdown', closeProfile);
  }, []);

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/search?q=${encodeURIComponent(value)}` : '/search');
    setMenuOpen(false);
  };

  const handleSignOut = async () => {
    setProfileOpen(false);
    setMenuOpen(false);
    await signOut();
    router.push('/');
  };

  const authHref = `/auth?next=${encodeURIComponent(pathname || '/')}`;

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-white/95 shadow-[0_6px_24px_rgba(15,50,43,0.05)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0" aria-label="الصفحة الرئيسية">
          <span className="hidden sm:inline"><Brand /></span>
          <span className="sm:hidden"><Brand compact /></span>
        </Link>

        <form onSubmit={onSearch} className="mx-auto hidden w-full max-w-xl sm:block" role="search">
          <div className="relative">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث عن منتج أو فئة..."
              className="field h-11 bg-slate-50 pr-11 pl-24"
              aria-label="البحث في المنتجات"
            />
            <button type="submit" className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-extrabold text-white hover:bg-emerald-800">
              بحث
            </button>
          </div>
        </form>

        <div className="mr-auto hidden shrink-0 items-center gap-2 md:flex">
          {!loading && user ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="btn-secondary h-11 max-w-48 px-3"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <User className="h-4 w-4" />
                </span>
                <span className="truncate">{user.displayName || 'حسابي'}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl" role="menu">
                  <div className="mb-2 rounded-xl bg-slate-50 p-3">
                    <p className="truncate font-extrabold text-slate-900">{user.displayName || 'مستخدم'}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                    <span className="mt-2 inline-flex rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800">
                      {user.userType === 'seller' ? 'حساب بائع' : 'حساب مشتري'}
                    </span>
                  </div>
                  <Link href="/profile" className="btn-ghost w-full justify-start text-sm" role="menuitem">
                    <Package className="h-4 w-4" />
                    لوحة الحساب
                  </Link>
                  {user.userType === 'seller' && (
                    <Link href="/sell" className="btn-ghost w-full justify-start text-sm" role="menuitem">
                      <Store className="h-4 w-4" />
                      إضافة منتج
                    </Link>
                  )}
                  <button type="button" onClick={handleSignOut} className="flex min-h-11 w-full items-center gap-2 rounded-xl px-4 text-sm font-extrabold text-red-700 hover:bg-red-50" role="menuitem">
                    <LogOut className="h-4 w-4" />
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          ) : !loading ? (
            <Link href={authHref} className="btn-secondary h-11">
              <User className="h-4 w-4" />
              دخول
            </Link>
          ) : (
            <span className="h-11 w-24 animate-pulse rounded-xl bg-slate-100" />
          )}

          {user?.userType === 'seller' ? (
            <Link href="/sell" className="btn-primary h-11">
              <Store className="h-4 w-4" />
              أضف إعلاناً
            </Link>
          ) : !user && !loading ? (
            <Link href="/auth?mode=signup&type=seller" className="btn-primary h-11">
              ابدأ البيع
            </Link>
          ) : null}
        </div>

        <button
          type="button"
          className="mr-auto flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="فتح القائمة"
          aria-expanded={menuOpen}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <nav className="hidden border-t border-slate-100 bg-white md:block" aria-label="التصفح الرئيسي">
        <div className="no-scrollbar mx-auto flex h-11 max-w-7xl items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
          <NavLink href="/" active={pathname === '/'}><Home className="h-4 w-4" />الرئيسية</NavLink>
          <NavLink href="/search" active={pathname === '/search'}><Grid3X3 className="h-4 w-4" />كل المنتجات</NavLink>
          {categories.map((category) => {
            const href = `/categories/${encodeURIComponent(category)}`;
            return <NavLink key={category} href={href} active={pathname === href}>{category}</NavLink>;
          })}
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-950/40 md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-y-0 right-0 flex w-[min(90vw,23rem)] flex-col overflow-y-auto bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <Brand />
              <button type="button" onClick={() => setMenuOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100" aria-label="إغلاق القائمة">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onSearch} className="mb-5" role="search">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="field pr-11" placeholder="ابحث في السوق..." aria-label="البحث في المنتجات" />
              </div>
            </form>

            {user && (
              <div className="mb-4 rounded-2xl bg-emerald-50 p-4">
                <p className="font-black text-slate-900">{user.displayName || 'مستخدم'}</p>
                <p className="mt-1 truncate text-xs text-slate-600">{user.email}</p>
              </div>
            )}

            <div className="space-y-1">
              <MobileLink href="/" icon={<Home className="h-5 w-5" />}>الرئيسية</MobileLink>
              <MobileLink href="/search" icon={<Grid3X3 className="h-5 w-5" />}>استعراض المنتجات</MobileLink>
              <MobileLink href="/profile" icon={<Package className="h-5 w-5" />}>{user ? 'لوحة الحساب' : 'حسابي'}</MobileLink>
              {user?.userType === 'seller' && <MobileLink href="/sell" icon={<Store className="h-5 w-5" />} primary>إضافة منتج للبيع</MobileLink>}
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="mb-3 text-xs font-extrabold text-slate-500">الفئات</p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <Link key={category} href={`/categories/${encodeURIComponent(category)}`} className="rounded-xl border border-slate-200 px-3 py-2.5 text-center text-sm font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50">
                    {category}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-6">
              {user ? (
                <button type="button" onClick={handleSignOut} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-50 font-extrabold text-red-700">
                  <LogOut className="h-5 w-5" />
                  تسجيل الخروج
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href={authHref} className="btn-secondary">دخول</Link>
                  <Link href="/auth?mode=signup" className="btn-primary">حساب جديد</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-bold transition-colors ${
        active ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileLink({ href, icon, primary = false, children }: { href: string; icon: React.ReactNode; primary?: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`flex min-h-12 items-center gap-3 rounded-xl px-4 font-extrabold ${primary ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
      {icon}
      {children}
    </Link>
  );
}
