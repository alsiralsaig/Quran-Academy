import React, { useMemo, useState } from 'react';
import { Archive, Search, Star, BookOpen, CalendarCheck, EyeOff, Eye, Printer, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SessionRecord, Subscription } from '../../types';

/**
 * أرشيف الطلاب المكتملين — من البيانات الحقيقية:
 * كل اشتراك معتمد استُهلكت حصصه كلها (أو انتهت صلاحيته) يظهر هنا مع ملخص حصصه.
 * «إخفاء» يحفظ في قاعدة البيانات مع حساب المعلم (مفتاح archived_circles = قائمة معرّفات مخفية).
 */
interface ArchivedEntry {
  sub: Subscription;
  sessions: SessionRecord[];
  avgRating: number;
  presentCount: number;
  lastSurah: string;
  lastDate: string;
}

const isFinished = (s: Subscription) => {
  if (s.paymentStatus !== 'approved') return false;
  if (s.usedSessions >= s.totalSessions) return true;
  return !!s.expiryDate && new Date(s.expiryDate).getTime() < Date.now();
};

export const ArchivedStudyCircles: React.FC = () => {
  const { currentUser, subscriptions, sessions, userData, saveUserData } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [report, setReport] = useState<ArchivedEntry | null>(null);

  const hidden: string[] = Array.isArray(userData.archived_circles) ? userData.archived_circles : [];

  const entries: ArchivedEntry[] = useMemo(() => {
    return subscriptions
      .filter((s) => (currentUser.role === 'admin' || s.teacherId === currentUser.id) && isFinished(s))
      .map((sub) => {
        const list = sessions
          .filter((x) => x.subscriptionId === sub.id)
          .sort((a, b) => (a.date < b.date ? 1 : -1));
        const rated = list.filter((x) => x.attendance === 'present');
        const avg = rated.length ? rated.reduce((n, x) => n + (x.rating || 0), 0) / rated.length : 0;
        return {
          sub,
          sessions: list,
          avgRating: Math.round(avg * 10) / 10,
          presentCount: rated.length,
          lastSurah: list[0]?.surahName || '—',
          lastDate: list[0]?.date || sub.expiryDate || '',
        };
      });
  }, [subscriptions, sessions, currentUser]);

  const q = searchQuery.trim().toLowerCase();
  const visible = entries.filter((e) => {
    if (!showHidden && hidden.includes(e.sub.id)) return false;
    if (!q) return true;
    return (
      e.sub.studentName.toLowerCase().includes(q) ||
      e.sub.packageName.toLowerCase().includes(q) ||
      e.sessions.some((x) => x.surahName.toLowerCase().includes(q))
    );
  });

  const toggleHidden = (id: string) => {
    saveUserData('archived_circles', hidden.includes(id) ? hidden.filter((x) => x !== id) : [...hidden, id]);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
            <Archive className="w-4 h-4 text-amber-700" />
            <span>الأرشيف</span>
          </div>
          <h3 className="text-xl font-extrabold font-serif text-slate-900 dark:text-white">الطلاب الأكملوا باقاتهم</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            أي اشتراك خلصت حصصه أو انتهت مدته بيظهر هنا تلقائياً مع ملخص الحضور والتقييم وآخر سورة.
          </p>
        </div>
        <div className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث باسم الطالب أو الباقة أو السورة..."
              className="w-full pr-9 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            />
          </div>
          {hidden.length > 0 && (
            <button
              onClick={() => setShowHidden((v) => !v)}
              className="px-3 py-2.5 text-[11px] font-bold rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 shrink-0"
            >
              {showHidden ? 'إخفاء المخفي' : `المخفي (${hidden.length})`}
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 space-y-2">
          <Archive className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="font-extrabold text-sm text-slate-700 dark:text-slate-300">
            {entries.length === 0 ? 'لسه ما في طالب أكمل باقته' : 'ما في نتائج مطابقة'}
          </h4>
          <p className="text-xs text-slate-400">لما طالب يستهلك كل حصص باقته بيظهر هنا براه.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((e) => (
            <div key={e.sub.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-slate-900">{e.sub.studentName}</h4>
                  <p className="text-[11px] text-emerald-700 font-bold">{e.sub.packageName}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {e.sub.usedSessions}/{e.sub.totalSessions} حصة
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="bg-white rounded-xl p-2 border">
                  <Star className="w-3.5 h-3.5 mx-auto text-amber-500" />
                  <div className="font-black text-slate-800">{e.avgRating || '—'}</div>
                  <div className="text-slate-400">متوسط التقييم</div>
                </div>
                <div className="bg-white rounded-xl p-2 border">
                  <CalendarCheck className="w-3.5 h-3.5 mx-auto text-emerald-600" />
                  <div className="font-black text-slate-800">{e.presentCount}</div>
                  <div className="text-slate-400">حضور</div>
                </div>
                <div className="bg-white rounded-xl p-2 border">
                  <BookOpen className="w-3.5 h-3.5 mx-auto text-sky-600" />
                  <div className="font-black text-slate-800 truncate">{e.lastSurah}</div>
                  <div className="text-slate-400">آخر سورة</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setReport(e)}
                  className="flex-1 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> التقرير النهائي
                </button>
                <button
                  onClick={() => toggleHidden(e.sub.id)}
                  className="px-3 py-2 rounded-xl bg-white border text-slate-600 text-xs font-bold flex items-center gap-1"
                  title={hidden.includes(e.sub.id) ? 'إظهار' : 'إخفاء من القائمة'}
                >
                  {hidden.includes(e.sub.id) ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {hidden.includes(e.sub.id) ? 'إظهار' : 'إخفاء'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {report && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4" onClick={() => setReport(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">التقرير النهائي — {report.sub.studentName}</h3>
                <p className="text-xs text-slate-500">
                  {report.sub.packageName} • المعلم/ة: {report.sub.teacherName}
                </p>
              </div>
              <button onClick={() => setReport(null)} className="p-2 rounded-xl bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50"><b className="block text-lg">{report.sessions.length}</b>حصة مسجّلة</div>
              <div className="p-3 rounded-2xl bg-amber-50"><b className="block text-lg">{report.avgRating || '—'}</b>متوسط التقييم</div>
              <div className="p-3 rounded-2xl bg-sky-50"><b className="block text-lg">{report.presentCount}</b>حضور</div>
            </div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="p-2 text-right">التاريخ</th>
                  <th className="p-2 text-right">السورة والآيات</th>
                  <th className="p-2">التقييم</th>
                  <th className="p-2">الحضور</th>
                </tr>
              </thead>
              <tbody>
                {report.sessions.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-slate-400">ما في حصص مسجّلة</td></tr>
                ) : (
                  report.sessions.map((x) => (
                    <tr key={x.id} className="border-b">
                      <td className="p-2">{x.date}</td>
                      <td className="p-2">{x.surahName} ({x.fromAyah}–{x.toAyah})</td>
                      <td className="p-2 text-center">{x.attendance === 'present' ? `${x.rating}/5` : '—'}</td>
                      <td className="p-2 text-center">
                        {x.attendance === 'present' ? 'حاضر' : x.attendance === 'absent_excused' ? 'غياب بعذر' : 'غياب'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <button onClick={() => window.print()} className="w-full py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1">
              <Printer className="w-4 h-4" /> طباعة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
