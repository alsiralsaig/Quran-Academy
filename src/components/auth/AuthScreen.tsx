import React, { useEffect, useState } from 'react';
import { LogIn, UserPlus, GraduationCap, Phone, Lock, User as UserIcon, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useApp, type AuthMode } from '../../context/AppContext';
import { APP_FLAVOR, FLAVOR_INFO } from '../../lib/appFlavor';

const TABS: { id: AuthMode; label: string; icon: React.ReactNode }[] = [
  { id: 'login', label: 'تسجيل الدخول', icon: <LogIn className="w-4 h-4" /> },
  { id: 'student', label: 'حساب طالب جديد', icon: <UserPlus className="w-4 h-4" /> },
  { id: 'teacher', label: 'انضمام كمعلمة', icon: <GraduationCap className="w-4 h-4" /> },
];

// في تطبيق منفصل: تبويب الدخول + تسجيل الدور ده بس (الإدارة: دخول بس)
const tabsFor = () => (APP_FLAVOR ? TABS.filter((t) => t.id === 'login' || t.id === APP_FLAVOR) : TABS);

export const AuthScreen: React.FC<{ initialMode?: AuthMode }> = ({ initialMode = 'login' }) => {
  const { login, register } = useApp();
  const tabs = tabsFor();
  const allowed = (m: AuthMode): AuthMode => (tabs.some((t) => t.id === m) ? m : 'login');
  const [mode, setModeRaw] = useState<AuthMode>(allowed(initialMode));
  const setMode = (m: AuthMode) => setModeRaw(allowed(m));
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setMode(initialMode), [initialMode]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setError(''), [mode]);

  const isRegister = mode !== 'login';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isRegister) {
      if (name.trim().length < 2) return setError('اكتب الاسم كامل');
      if (password.length < 6) return setError('كلمة السر لازم تكون 6 أحرف أو أرقام على الأقل');
      if (password !== password2) return setError('كلمتا السر غير متطابقتين');
    }
    setBusy(true);
    try {
      if (isRegister) {
        await register({ role: mode as 'student' | 'teacher', name: name.trim(), phone, password });
      } else {
        await login(phone, password);
      }
    } catch (err: any) {
      setError(err?.message || 'حصل خطأ، جرّب تاني');
    } finally {
      setBusy(false);
    }
  };

  const input =
    'w-full pr-10 pl-3 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';

  return (
    <div className="max-w-md mx-auto my-6 bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden" data-testid="auth-screen">
      <div className="bg-gradient-to-l from-emerald-800 to-teal-900 p-6 text-white text-center">
        <img src="/logo.png" alt="" className="w-14 h-14 mx-auto rounded-2xl bg-white p-1 mb-3" />
        <h2 className="text-xl font-extrabold font-serif">{APP_FLAVOR ? FLAVOR_INFO[APP_FLAVOR].name : 'أكاديمية القرآن الكريم'}</h2>
        <p className="text-emerald-100/80 text-xs mt-1">
          {mode === 'login' && 'ادخل برقم تلفونك وكلمة السر'}
          {mode === 'student' && 'أنشئ حساب الطالب أو ولي الأمر للاشتراك في الحلقات'}
          {mode === 'teacher' && 'أنشئ حسابك، وبعدها املئي بيانات المؤهلات لمراجعة الإدارة'}
        </p>
      </div>

      {tabs.length > 1 ? (
      <div className={`grid ${tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-1 p-1.5 bg-slate-100 m-4 rounded-2xl`} role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={mode === t.id}
            onClick={() => setMode(t.id)}
            className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              mode === t.id ? 'bg-white text-emerald-800 shadow' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      ) : (
        <div className="h-4" />
      )}

      <form onSubmit={submit} className="px-6 pb-6 space-y-3">
        {isRegister && (
          <label className="block">
            <span className="text-xs font-bold text-slate-700">{mode === 'teacher' ? 'الاسم الكامل للمعلمة' : 'اسم الطالب'}</span>
            <div className="relative mt-1">
              <UserIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required maxLength={100} />
            </div>
          </label>
        )}

        <label className="block">
          <span className="text-xs font-bold text-slate-700">رقم التلفون</span>
          <div className="relative mt-1">
            <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              className={input + ' text-left'}
              dir="ltr"
              type="tel"
              inputMode="tel"
              placeholder="0912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              required
            />
          </div>
          <span className="text-[10px] text-slate-400">رقم سوداني عادي، أو رقم من دولة تانية بالمفتاح الدولي (‎+966…)</span>
        </label>

        <label className="block">
          <span className="text-xs font-bold text-slate-700">كلمة السر</span>
          <div className="relative mt-1">
            <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              className={input}
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              minLength={isRegister ? 6 : 1}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700"
              aria-label={showPw ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </label>

        {isRegister && (
          <label className="block">
            <span className="text-xs font-bold text-slate-700">تأكيد كلمة السر</span>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                className={input}
                type={showPw ? 'text' : 'password'}
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </label>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl p-3" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {mode === 'login' ? 'دخول' : 'إنشاء الحساب'}
        </button>

        {mode === 'login' && (
          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            نسيت كلمة السر؟ تواصل مع إدارة الأكاديمية على واتساب{' '}
            <a href="https://wa.me/249913009060" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold" dir="ltr">
              +249 913 009 060
            </a>{' '}
            وبيدّوك كلمة سر مؤقتة.
          </p>
        )}

        <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3" /> كلمة السر محفوظة مشفّرة ولا يمكن لأي شخص الاطلاع عليها
        </p>
      </form>
    </div>
  );
};
