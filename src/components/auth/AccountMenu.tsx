import React, { useEffect, useRef, useState } from 'react';
import { LogIn, LogOut, KeyRound, ChevronDown, Shield, GraduationCap, UserCheck, X, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ROLE_LABEL = { admin: 'الإدارة', teacher: 'معلمة', student: 'طالب' } as const;
const ROLE_ICON = {
  admin: <Shield className="w-3.5 h-3.5" />,
  teacher: <GraduationCap className="w-3.5 h-3.5" />,
  student: <UserCheck className="w-3.5 h-3.5" />,
};

export const AccountMenu: React.FC<{ onGoWorkspace: () => void }> = ({ onGoWorkspace }) => {
  const { isGuest, currentUser, logout, requestAuth, changePassword, showToast } = useApp();
  const [open, setOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (isGuest) {
    return (
      <button
        onClick={() => {
          onGoWorkspace();
          requestAuth('login');
        }}
        className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl flex items-center gap-1.5 shadow"
        data-testid="nav-login"
      >
        <LogIn className="w-4 h-4" />
        <span>دخول</span>
      </button>
    );
  }

  const role = currentUser.role;
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-emerald-950 text-white pl-2 pr-2.5 py-1.5 rounded-2xl border border-emerald-800/60 flex items-center gap-1.5 max-w-[150px] sm:max-w-[220px]"
        data-testid="account-menu"
      >
        <span className="bg-emerald-500 text-emerald-950 rounded-lg p-1">{ROLE_ICON[role]}</span>
        <span className="text-[11px] sm:text-xs font-bold truncate">{currentUser.name}</span>
        <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 text-right">
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <p className="font-extrabold text-sm text-slate-900 truncate">{currentUser.name}</p>
            <p className="text-[11px] text-slate-500" dir="ltr" style={{ textAlign: 'right' }}>{currentUser.phone}</p>
            <span className="inline-flex items-center gap-1 mt-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {ROLE_ICON[role]} {ROLE_LABEL[role]}
            </span>
          </div>
          <button
            onClick={() => { setPwOpen(true); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700"
          >
            <KeyRound className="w-4 h-4 text-emerald-700" /> تغيير كلمة السر
          </button>
          <button
            onClick={async () => { setOpen(false); await logout(); showToast('تم تسجيل الخروج', 'info'); onGoWorkspace(); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-xs font-bold text-rose-700"
            data-testid="logout"
          >
            <LogOut className="w-4 h-4" /> تسجيل الخروج
          </button>
        </div>
      )}

      {pwOpen && <ChangePasswordModal onClose={() => setPwOpen(false)} onSubmit={changePassword} onDone={() => showToast('تم تغيير كلمة السر — الأجهزة التانية اتسجّل خروجها', 'success')} />}
    </div>
  );
};

const ChangePasswordModal: React.FC<{
  onClose: () => void;
  onSubmit: (cur: string, next: string) => Promise<void>;
  onDone: () => void;
}> = ({ onClose, onSubmit, onDone }) => {
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [next2, setNext2] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (next.length < 6) return setErr('كلمة السر الجديدة لازم تكون 6 أحرف على الأقل');
    if (next !== next2) return setErr('كلمتا السر غير متطابقتين');
    setBusy(true);
    try {
      await onSubmit(cur, next);
      onDone();
      onClose();
    } catch (e: any) {
      setErr(e?.message || 'حصل خطأ');
    } finally {
      setBusy(false);
    }
  };

  const input = 'w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-3 text-right">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900">تغيير كلمة السر</h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>
        <input className={input} type="password" placeholder="كلمة السر الحالية" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" required />
        <input className={input} type="password" placeholder="كلمة السر الجديدة" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required />
        <input className={input} type="password" placeholder="تأكيد كلمة السر الجديدة" value={next2} onChange={(e) => setNext2(e.target.value)} autoComplete="new-password" required />
        {err && <p className="text-xs font-bold text-rose-700 bg-rose-50 p-2 rounded-lg">{err}</p>}
        <button disabled={busy} className="w-full py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} حفظ
        </button>
      </form>
    </div>
  );
};
