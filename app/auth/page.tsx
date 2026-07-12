'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Store,
  User,
} from 'lucide-react';
import Brand from '@/components/Brand';
import { useAuth } from '@/components/AuthProvider';

type Mode = 'signin' | 'signup';
type UserType = 'buyer' | 'seller';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth();
  const initialMode: Mode = params.get('mode') === 'signup' ? 'signup' : 'signin';
  const initialType: UserType = params.get('type') === 'seller' ? 'seller' : 'buyer';
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: initialType,
  });

  const requestedPath = params.get('next');
  const nextPath = requestedPath?.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '/profile';

  useEffect(() => {
    if (!loading && user) router.replace(nextPath);
  }, [loading, nextPath, router, user]);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError('');
  };

  const validate = () => {
    const email = form.email.trim().toLowerCase();
    if (!emailPattern.test(email)) return 'أدخل بريداً إلكترونياً صحيحاً.';
    if (form.password.length < 8) return 'كلمة المرور يجب أن تتكون من 8 أحرف على الأقل.';
    if (mode === 'signup') {
      if (form.displayName.trim().length < 2) return 'أدخل اسمك الكامل.';
      if (form.phone.replace(/\D/g, '').length < 8) return 'أدخل رقم هاتف صحيحاً.';
      if (form.password !== form.confirmPassword) return 'كلمتا المرور غير متطابقتين.';
    }
    return '';
  };

  const completeAuth = async (action: () => Promise<unknown>) => {
    setError('');
    setSubmitting(true);
    try {
      await action();
      router.replace(nextPath);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'تعذر إكمال العملية. حاول مجدداً.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (mode === 'signup') {
      await completeAuth(() =>
        signUp(
          form.email.trim().toLowerCase(),
          form.password,
          form.displayName.trim(),
          form.phone.trim(),
          form.userType
        )
      );
      return;
    }
    await completeAuth(() => signIn(form.email.trim().toLowerCase(), form.password));
  };

  const handleGoogle = async () => {
    if (mode === 'signup' && form.phone.replace(/\D/g, '').length < 8) {
      setError('أدخل رقم هاتف صحيحاً قبل المتابعة عبر Google.');
      return;
    }
    await completeAuth(() => signInWithGoogle(mode === 'signup' ? form.userType : undefined, form.phone.trim()));
  };

  if (loading || user) return <AuthLoading />;

  return (
    <div className="page-shell py-8 sm:py-12" dir="rtl">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,50,43,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-emerald-800 p-10 text-white lg:flex lg:flex-col">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-28 -right-20 h-72 w-72 rounded-full border-[45px] border-white/10" />
          <div className="relative">
            <Brand />
            <p className="mt-12 text-sm font-bold text-emerald-100">سوق جزائري أسهل وأكثر وضوحاً</p>
            <h1 className="mt-3 text-4xl font-black leading-[1.35]">بع، اشترِ، وتواصل بثقة.</h1>
            <p className="mt-5 leading-8 text-emerald-50/90">
              حساب واحد يمنحك وصولاً سريعاً للمنتجات والطلبات، مع لوحة منظمة وتجربة متجاوبة على كل الأجهزة.
            </p>
          </div>
          <div className="relative mt-auto space-y-3 pt-10">
            <Feature icon={<ShieldCheck className="h-5 w-5" />} text="بياناتك محمية ولا يتم عرض كلمة المرور" />
            <Feature icon={<CheckCircle2 className="h-5 w-5" />} text="تسجيل واضح ورسائل خطأ مفهومة" />
            <Feature icon={<CheckCircle2 className="h-5 w-5" />} text="تبديل سهل بين حساب المشتري والبائع" />
          </div>
        </aside>

        <section className="p-5 sm:p-8 lg:p-10">
          <div className="mb-7 lg:hidden">
            <Brand />
          </div>
          <div className="mb-7">
            <p className="text-sm font-extrabold text-emerald-700">
              {mode === 'signup' ? 'ابدأ خلال دقيقة' : 'مرحباً بعودتك'}
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">
              {mode === 'signup' ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </h1>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {mode === 'signup' ? 'أدخل معلومات صحيحة لتسهيل التواصل وإدارة طلباتك.' : 'أدخل بيانات حسابك للوصول إلى لوحة التحكم.'}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1" role="tablist" aria-label="نوع العملية">
            <button type="button" onClick={() => switchMode('signin')} className={`min-h-11 rounded-xl text-sm font-extrabold ${mode === 'signin' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`} role="tab" aria-selected={mode === 'signin'}>
              تسجيل الدخول
            </button>
            <button type="button" onClick={() => switchMode('signup')} className={`min-h-11 rounded-xl text-sm font-extrabold ${mode === 'signup' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`} role="tab" aria-selected={mode === 'signup'}>
              حساب جديد
            </button>
          </div>

          {error && <div className="notice-error mb-5" role="alert" aria-live="polite">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'signup' && (
              <>
                <fieldset>
                  <legend className="mb-2 text-sm font-extrabold text-slate-700">اختر نوع الحساب</legend>
                  <div className="grid grid-cols-2 gap-3">
                    <AccountTypeButton active={form.userType === 'buyer'} onClick={() => setForm((value) => ({ ...value, userType: 'buyer' }))} icon={<ShoppingBag className="h-5 w-5" />} title="مشتري" subtitle="تصفح واطلب" />
                    <AccountTypeButton active={form.userType === 'seller'} onClick={() => setForm((value) => ({ ...value, userType: 'seller' }))} icon={<Store className="h-5 w-5" />} title="بائع" subtitle="انشر وتابع" />
                  </div>
                </fieldset>
                <InputField label="الاسم الكامل" icon={<User className="h-5 w-5" />} input={<input id="displayName" name="displayName" autoComplete="name" value={form.displayName} onChange={(event) => setForm((value) => ({ ...value, displayName: event.target.value }))} className="field pr-11" placeholder="مثال: محمد بن علي" disabled={submitting} />} />
                <InputField label="رقم الهاتف" hint="يستخدم للتواصل حول الإعلانات والطلبات" icon={<Phone className="h-5 w-5" />} input={<input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(event) => setForm((value) => ({ ...value, phone: event.target.value }))} className="field pr-11" placeholder="05 / 06 / 07..." dir="ltr" disabled={submitting} />} />
              </>
            )}

            <InputField label="البريد الإلكتروني" icon={<Mail className="h-5 w-5" />} input={<input id="email" name="email" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))} className="field pr-11 text-left" placeholder="name@example.com" dir="ltr" disabled={submitting} />} />

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-extrabold text-slate-700">كلمة المرور</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={form.password} onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))} className="field pr-11 pl-12" placeholder="8 أحرف على الأقل" disabled={submitting} />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <InputField label="تأكيد كلمة المرور" icon={<Lock className="h-5 w-5" />} input={<input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword} onChange={(event) => setForm((value) => ({ ...value, confirmPassword: event.target.value }))} className="field pr-11" placeholder="أعد كتابة كلمة المرور" disabled={submitting} />} />
            )}

            <button type="submit" disabled={submitting} className="btn-primary mt-2 w-full">
              {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
              {submitting ? 'جاري التحقق...' : mode === 'signup' ? 'إنشاء الحساب' : 'دخول آمن'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs font-bold text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            أو المتابعة باستخدام
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button type="button" onClick={handleGoogle} disabled={submitting} className="btn-secondary w-full">
            <GoogleIcon />
            {mode === 'signup' ? 'إنشاء حساب عبر Google' : 'الدخول عبر Google'}
          </button>
          <p className="mt-5 text-center text-xs leading-6 text-slate-500">
            بمتابعتك، أنت توافق على استخدام بياناتك لتشغيل الحساب وإتمام الطلبات.
          </p>
        </section>
      </div>
    </div>
  );
}

function AuthLoading() {
  return (
    <div className="page-shell flex min-h-[60vh] items-center justify-center">
      <div className="surface-card flex items-center gap-3 px-6 py-4 font-bold text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
        جاري تحميل الحساب...
      </div>
    </div>
  );
}

function InputField({ label, hint, icon, input }: { label: string; hint?: string; icon: React.ReactNode; input: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-extrabold text-slate-700">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        {input}
      </div>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function AccountTypeButton({ active, onClick, icon, title, subtitle }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <button type="button" onClick={onClick} className={`flex min-h-20 items-center gap-3 rounded-2xl border p-3 text-right transition-colors ${active ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`} aria-pressed={active}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>{icon}</span>
      <span>
        <span className="block font-black">{title}</span>
        <span className="block text-xs font-medium opacity-70">{subtitle}</span>
      </span>
    </button>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold"><span className="text-emerald-200">{icon}</span>{text}</div>;
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.31v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.99.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.56 10.56 0 0 0 12 1a11 11 0 0 0-9.82 6.06L5.84 9.9A6.58 6.58 0 0 1 12 5.38Z" />
    </svg>
  );
}
