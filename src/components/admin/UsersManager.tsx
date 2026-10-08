import React, { useMemo, useState } from 'react';
import { Users, Search, KeyRound, Copy, Check, MessageCircle, X, UserX } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/** إدارة حسابات الطلاب والمعلمات: كلمة سر مؤقتة لمن نسي، وإيقاف الحسابات */
export const UsersManager: React.FC = () => {
  const { students, teachers, resetUserPassword, setUserActive, showToast } = useApp();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'student' | 'teacher'>('all');
  const [result, setResult] = useState<{ name: string; phone: string; tempPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const people = useMemo(() => {
    const list = [
      ...students.map((s) => ({ id: s.id, name: s.name, phone: s.phone, role: 'student' as const, extra: '' })),
      ...teachers.map((t) => ({
        id: t.id,
        name: t.name,
        phone: t.phone,
        role: 'teacher' as const,
        extra: t.status === 'approved' ? 'معتمدة' : t.status === 'pending' ? 'قيد المراجعة' : 'مرفوضة',
      })),
    ];
    const term = q.trim().toLowerCase();
    return list
      .filter((p) => filter === 'all' || p.role === filter)
      .filter((p) => !term || p.name.toLowerCase().includes(term) || p.phone.includes(term.replace(/\s/g, '')));
  }, [students, teachers, q, filter]);

  const doReset = async (id: string, name: string) => {
    if (!confirm(`إعطاء (${name}) كلمة سر مؤقتة جديدة؟ كلمة السر القديمة بتتلغى.`)) return;
    setBusyId(id);
    try {
      setResult(await resetUserPassword(id));
      setCopied(false);
    } catch {
      /* الرسالة بتظهر من النظام */
    } finally {
      setBusyId(null);
    }
  };

  const doDeactivate = async (id: string, name: string) => {
    if (!confirm(`إيقاف حساب (${name})؟ ما بيقدر يدخل لحدي ما تتواصل معاه.`)) return;
    setBusyId(id);
    try {
      await setUserActive(id, false);
      showToast(`تم إيقاف حساب (${name})`, 'info');
    } catch {
      /* الرسالة بتظهر من النظام */
    } finally {
      setBusyId(null);
    }
  };

  const msg = result
    ? `السلام عليكم ${result.name}\nكلمة السر المؤقتة لحسابك في أكاديمية القرآن الكريم: ${result.tempPassword}\nادخل بيها وغيّرها من قائمة حسابك.`
    : '';

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4" data-testid="users-manager">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-emerald-700" />
        <h3 className="font-extrabold text-slate-900">حسابات الطلاب والمعلمات</h3>
        <span className="text-[11px] text-slate-500">({students.length} طالب، {teachers.length} معلمة)</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث بالاسم أو رقم التلفون"
            className="w-full pr-9 pl-3 py-2.5 border border-slate-300 rounded-xl text-sm"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {(['all', 'student', 'teacher'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg ${filter === f ? 'bg-white shadow text-emerald-800' : 'text-slate-500'}`}
            >
              {f === 'all' ? 'الكل' : f === 'student' ? 'الطلاب' : 'المعلمات'}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto border border-slate-100 rounded-2xl">
        {people.length === 0 && <p className="text-center text-xs text-slate-400 py-8">ما في نتائج</p>}
        {people.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-2 p-3 text-xs">
            <div className="min-w-0">
              <p className="font-bold text-slate-900 truncate">{p.name}</p>
              <p className="text-slate-500" dir="ltr" style={{ textAlign: 'right' }}>{p.phone}</p>
              <span className="text-[10px] text-slate-400">{p.role === 'student' ? 'طالب' : `معلمة · ${p.extra}`}</span>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                disabled={busyId === p.id}
                onClick={() => doReset(p.id, p.name)}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold flex items-center gap-1 disabled:opacity-50"
              >
                <KeyRound className="w-3.5 h-3.5" /> كلمة سر مؤقتة
              </button>
              <button
                disabled={busyId === p.id}
                onClick={() => doDeactivate(p.id, p.name)}
                className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg disabled:opacity-50"
                title="إيقاف الحساب"
                aria-label="إيقاف الحساب"
              >
                <UserX className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {result && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={() => setResult(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-3 text-right" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold">كلمة السر المؤقتة</h3>
              <button onClick={() => setResult(null)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-600">لـ <b>{result.name}</b> — أرسلها له، وبعد ما يدخل يغيّرها.</p>
            <div className="text-3xl font-black tracking-widest text-center bg-emerald-50 text-emerald-900 rounded-2xl py-4" dir="ltr">
              {result.tempPassword}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(msg); setCopied(true); }}
                className="py-2.5 rounded-xl bg-slate-100 font-bold text-xs flex items-center justify-center gap-1"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'اتنسخت' : 'نسخ الرسالة'}
              </button>
              <a
                href={`https://wa.me/${result.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1"
              >
                <MessageCircle className="w-4 h-4" /> واتساب
              </a>
            </div>
            <p className="text-[10px] text-slate-400">كلمة السر دي ما بتظهر تاني بعد ما تقفل النافذة.</p>
          </div>
        </div>
      )}
    </div>
  );
};
