import React, { useState } from 'react';
import { BookOpenCheck, Plus, Trash2, CheckCircle2, Hand, Undo2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { KhatmCampaign } from '../../types';

interface GroupKhatmPlannerProps {
  userRole: 'teacher' | 'student' | 'admin';
  userName: string;
}

const JUZ = Array.from({ length: 30 }, (_, i) => i + 1);

/** الختمة الجماعية — المعلم يفتح ختمة، والطلاب يحجزوا أجزاء ويعلّموها مقروءة. محفوظة ومشتركة بين الأجهزة. */
export const GroupKhatmPlanner: React.FC<GroupKhatmPlannerProps> = ({ userRole }) => {
  const { khatms, createKhatm, deleteKhatm } = useApp();
  const isTeacher = userRole === 'teacher';
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createKhatm({ title: title.trim(), targetDate: targetDate || undefined });
      setTitle('');
      setTargetDate('');
    } catch {
      /* الخطأ بيظهر من النظام */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
          <BookOpenCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg">الختمة الجماعية</h3>
          <p className="text-xs text-slate-500">
            {isTeacher ? 'افتح ختمة لطلابك، وكل واحد يحجز جزء أو أكتر ويعلّمه لما يكمّله.' : 'احجز جزءك من ختمة الحلقة وعلّمه لما تكمّل قراءته.'}
          </p>
        </div>
      </div>

      {isTeacher && (
        <form onSubmit={create} className="flex flex-wrap gap-2 text-xs bg-slate-50 p-3 rounded-2xl border">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="اسم الختمة: مثلاً ختمة رمضان" className="flex-1 min-w-[180px] p-2.5 border rounded-xl font-bold" required />
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="p-2.5 border rounded-xl" title="تاريخ الختم المستهدف (اختياري)" />
          <button type="submit" disabled={busy} className="px-4 py-2.5 rounded-xl bg-emerald-600 disabled:opacity-50 text-white font-black flex items-center gap-1">
            <Plus className="w-4 h-4" /> ختمة جديدة
          </button>
        </form>
      )}

      {khatms.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm border border-dashed rounded-2xl">
          {isTeacher ? 'ما في ختمات مفتوحة — افتح أول ختمة' : 'ما في ختمة مفتوحة من معلمك حالياً'}
        </div>
      ) : (
        khatms.map((k) => <KhatmCard key={k.id} k={k} canManage={isTeacher || userRole === 'admin'} onDelete={() => confirm(`قفل ختمة «${k.title}»؟`) && deleteKhatm(k.id)} />)
      )}
    </div>
  );
};

const KhatmCard: React.FC<{ k: KhatmCampaign; canManage: boolean; onDelete: () => void }> = ({ k, canManage, onDelete }) => {
  const { currentUser, khatmAction } = useApp();
  const [sel, setSel] = useState<number | null>(null);
  const parts = k.parts || {};
  const doneCount = Object.values(parts).filter((p) => p.done).length;
  const claimed = Object.keys(parts).length;
  const pct = Math.round((doneCount / 30) * 100);
  const selPart = sel ? parts[String(sel)] : undefined;
  const mine = selPart && selPart.userId === currentUser.id;
  const canTouch = selPart && (mine || canManage);

  const act = async (a: 'claim' | 'done' | 'undone' | 'release') => {
    if (!sel) return;
    await khatmAction(k.id, a, sel);
    setSel(null);
  };

  return (
    <div className="rounded-2xl border p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-extrabold text-slate-900">{k.title}</div>
          <div className="text-[11px] text-slate-500">
            مع {k.teacherName}
            {k.targetDate && <> • الختم المستهدف {new Date(k.targetDate + 'T00:00:00').toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}</>}
          </div>
        </div>
        {canManage && (
          <button onClick={onDelete} className="p-2 rounded-xl bg-rose-50 text-rose-600" title="قفل الختمة">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div>
        <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
          <span>مكتمل {doneCount} من 30 • محجوز {claimed}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
        {JUZ.map((j) => {
          const p = parts[String(j)];
          const isMine = p?.userId === currentUser.id;
          const cls = !p
            ? 'bg-white border-slate-200 text-slate-500 hover:border-emerald-400'
            : p.done
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : isMine
            ? 'bg-amber-100 border-amber-400 text-amber-900'
            : 'bg-slate-100 border-slate-200 text-slate-600';
          return (
            <button
              key={j}
              onClick={() => setSel(sel === j ? null : j)}
              title={p ? `${p.name}${p.done ? ' ✓' : ''}` : 'متاح'}
              className={`aspect-square rounded-lg border text-xs font-black ${cls} ${sel === j ? 'ring-2 ring-sky-500' : ''}`}
            >
              {j}
            </button>
          );
        })}
      </div>

      {sel && (
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 border rounded-xl p-3 text-xs">
          <span className="font-black text-slate-800">الجزء {sel}:</span>
          {!selPart ? (
            <>
              <span className="text-slate-500">متاح</span>
              <button onClick={() => act('claim')} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold flex items-center gap-1">
                <Hand className="w-3.5 h-3.5" /> احجزه لي
              </button>
            </>
          ) : (
            <>
              <span className="text-slate-600">
                {mine ? 'محجوز ليك' : `محجوز لـ ${selPart.name}`}
                {selPart.done && ' — مكتمل ✓'}
              </span>
              {canTouch && !selPart.done && (
                <button onClick={() => act('done')} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> كمّلته
                </button>
              )}
              {canTouch && selPart.done && (
                <button onClick={() => act('undone')} className="px-3 py-1.5 rounded-lg bg-white border font-bold flex items-center gap-1">
                  <Undo2 className="w-3.5 h-3.5" /> لسه ما كمل
                </button>
              )}
              {canTouch && (
                <button onClick={() => act('release')} className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-bold flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> إلغاء الحجز
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
