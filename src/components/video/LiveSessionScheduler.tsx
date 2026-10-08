import React, { useMemo, useState } from 'react';
import { CalendarClock, Video, Trash2, Plus, Users, User as UserIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LiveSessionSchedulerProps {
  userRole: 'teacher' | 'student' | 'admin';
  userName: string;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

/** مواعيد الحصص القادمة — حقيقية من قاعدة البيانات. المعلم يجدول، والطالب يشوف مواعيده ويدخل بالرابط. */
export const LiveSessionScheduler: React.FC<LiveSessionSchedulerProps> = ({ userRole }) => {
  const { scheduled, subscriptions, currentUser, scheduleSession, deleteScheduled } = useApp();
  const isTeacher = userRole === 'teacher';

  const myStudents = useMemo(
    () =>
      Array.from(
        new Map(
          subscriptions
            .filter((s) => s.teacherId === currentUser.id && s.paymentStatus === 'approved')
            .map((s) => [s.studentId, s.studentName])
        ).entries()
      ),
    [subscriptions, currentUser.id]
  );

  const [title, setTitle] = useState('حصة تسميع وتجويد');
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState('17:00');
  const [studentId, setStudentId] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const upcoming = scheduled.filter((s) => s.date >= todayStr());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await scheduleSession({ title: title.trim(), date, time, note: note.trim(), studentId: studentId || undefined });
      setMsg('اتجدولت الحصة واتأرسل إشعار للطلاب');
      setNote('');
      setTimeout(() => setMsg(''), 3500);
    } catch {
      /* الرسالة بتظهر من النظام */
    } finally {
      setBusy(false);
    }
  };

  const fmtDate = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="p-3 bg-sky-100 text-sky-800 rounded-2xl">
          <CalendarClock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg">مواعيد الحصص القادمة</h3>
          <p className="text-xs text-slate-500">
            {isTeacher ? 'جدول حصة لطالب أو لكل طلابك — بيوصلهم إشعار، وبيدخلوا برابط حصتك.' : 'مواعيد حصصك من معلمك، مع زر الدخول للحصة.'}
          </p>
        </div>
      </div>

      {isTeacher && (
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الحصة" className="p-2.5 border rounded-xl font-bold" required />
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="p-2.5 border rounded-xl font-bold bg-white">
            <option value="">كل طلابي ({myStudents.length})</option>
            {myStudents.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <input type="date" value={date} min={todayStr()} onChange={(e) => setDate(e.target.value)} className="p-2.5 border rounded-xl font-bold" required />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="p-2.5 border rounded-xl font-bold" required />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="ملاحظة (اختياري): مثلاً جهّز سورة الملك" className="p-2.5 border rounded-xl sm:col-span-2" />
          <button
            type="submit"
            disabled={busy || myStudents.length === 0}
            className="sm:col-span-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-black flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {busy ? 'جاري الحفظ...' : myStudents.length === 0 ? 'ما عندك طلاب معتمدين لسه' : 'جدولة الحصة'}
          </button>
          {msg && <p className="sm:col-span-2 text-emerald-700 font-bold">{msg}</p>}
        </form>
      )}

      {upcoming.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm border border-dashed rounded-2xl">ما في مواعيد قادمة</div>
      ) : (
        <div className="space-y-2">
          {upcoming.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-2xl border bg-white">
              <div className="text-center bg-sky-50 rounded-xl px-3 py-2 shrink-0">
                <div className="text-[10px] text-sky-700 font-bold">{s.date === todayStr() ? 'اليوم' : fmtDate(s.date).split('،')[0]}</div>
                <div className="font-black text-sky-900 text-sm" dir="ltr">{s.time}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-slate-900 text-sm truncate">{s.title}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  {isTeacher ? (
                    s.studentName ? <><UserIcon className="w-3 h-3" /> {s.studentName}</> : <><Users className="w-3 h-3" /> كل الطلاب</>
                  ) : (
                    <>مع {s.teacherName}</>
                  )}
                  <span className="text-slate-300">•</span> {fmtDate(s.date)}
                </div>
                {s.note && <div className="text-[11px] text-amber-700 mt-0.5">{s.note}</div>}
              </div>
              {s.meetingUrl ? (
                <a href={s.meetingUrl} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shrink-0">
                  <Video className="w-3.5 h-3.5" /> دخول
                </a>
              ) : (
                <span className="text-[10px] text-slate-400 shrink-0">{isTeacher ? 'أضف رابط حصتك' : 'الرابط لسه'}</span>
              )}
              {isTeacher && (
                <button
                  onClick={() => confirm('مسح الموعد ده؟') && deleteScheduled(s.id)}
                  className="p-2 rounded-xl bg-rose-50 text-rose-600 shrink-0"
                  title="مسح"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
