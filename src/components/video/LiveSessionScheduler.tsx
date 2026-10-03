import React, { useState } from 'react';
import {
  Video,
  Calendar,
  Clock,
  Plus,
  Link,
  Users,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Play,
  Sparkles,
  BookOpen,
  Trash2,
  Bell
} from 'lucide-react';
import { UserRole } from '../../types';

export interface ScheduledLiveSession {
  id: string;
  title: string;
  surahTopic: string;
  teacherName: string;
  studentGroup: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "05:00 م"
  durationMinutes: number;
  meetingUrl: string;
  status: 'upcoming' | 'live' | 'completed';
}

const INITIAL_SCHEDULED_SESSIONS: ScheduledLiveSession[] = [
  {
    id: 'live_1',
    title: 'حلقة التسميع والتجويد المباشرة - سورة البقرة',
    surahTopic: 'سورة البقرة (الآيات 255-260)',
    teacherName: 'أ. عائشة محمود العلي',
    studentGroup: 'حلقة صفوة الحفاظ',
    date: '2026-10-03',
    time: '05:00 م',
    durationMinutes: 45,
    meetingUrl: 'https://meet.jit.si/itqan_quran_room_255',
    status: 'upcoming',
  },
  {
    id: 'live_2',
    title: 'مراجعة أواخر سورة آل عمران وتصحيح التلاوة',
    surahTopic: 'سورة آل عمران (الآيات 190-200)',
    teacherName: 'أ. خديجة العمري',
    studentGroup: 'حلقة أمهات المؤمنين',
    date: '2026-10-04',
    time: '07:30 م',
    durationMinutes: 60,
    meetingUrl: 'https://meet.jit.si/itqan_quran_room_190',
    status: 'upcoming',
  },
];

interface LiveSessionSchedulerProps {
  userRole: UserRole;
  userName: string;
}

export const LiveSessionScheduler: React.FC<LiveSessionSchedulerProps> = ({ userRole, userName }) => {
  const [sessions, setSessions] = useState<ScheduledLiveSession[]>(INITIAL_SCHEDULED_SESSIONS);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New session modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [titleInput, setTitleInput] = useState<string>('حلقة تصحيح التلاوة والتسميع المباشر 🎙️');
  const [surahInput, setSurahInput] = useState<string>('سورة البقرة');
  const [groupInput, setGroupInput] = useState<string>('جميع الطالبات');
  const [dateInput, setDateInput] = useState<string>('2026-10-03');
  const [timeInput, setTimeInput] = useState<string>('06:00 م');
  const [durationInput, setDurationInput] = useState<number>(45);

  // Copy Meeting URL to clipboard
  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Create new live session with auto-generated meeting room link
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const roomId = `itqan_live_${Date.now()}`;
    const autoMeetingUrl = `https://meet.jit.si/${roomId}`;

    const newSession: ScheduledLiveSession = {
      id: roomId,
      title: titleInput,
      surahTopic: surahInput,
      teacherName: userName || 'المعلمة المشرفة',
      studentGroup: groupInput,
      date: dateInput,
      time: timeInput,
      durationMinutes: durationInput,
      meetingUrl: autoMeetingUrl,
      status: 'upcoming',
    };

    setSessions([newSession, ...sessions]);
    setShowModal(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 text-xs font-black px-3.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
            <Video className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>جدولة الحصص المباشرة والتكامل مع التقويم 📹</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-serif text-slate-900 dark:text-white">
            مواعيد البث المباشر وغرف اللقاء الافتراضية
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            توليد روابط القاعات المباشرة تلقائياً ومزامنتها مع تقويم الطالبة والمعلمة.
          </p>
        </div>

        {userRole === 'teacher' && (
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>جدولة حصة فيديو جديدة 📹</span>
          </button>
        )}
      </div>

      {/* SCHEDULED SESSIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="p-5 bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 dark:from-slate-900 dark:to-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full inline-block border border-emerald-300">
                  {session.surahTopic}
                </span>
                <h4 className="font-extrabold text-sm font-serif text-slate-900 dark:text-white">
                  {session.title}
                </h4>
              </div>

              <span className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                <Video className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-bold">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>المعلمة: {session.teacherName} • {session.studentGroup}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>التاريخ: {session.date} • الوقت: {session.time} ({session.durationMinutes} دقيقة)</span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => handleCopyLink(session.id, session.meetingUrl)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                {copiedId === session.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === session.id ? 'تم نسخ الرابط!' : 'نسخ رابط الغرفة'}</span>
              </button>

              <a
                href={session.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <span>دخول القاعة الآن</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <form onSubmit={handleCreateSession} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h4 className="font-black text-slate-900 dark:text-white text-lg font-serif border-b pb-3">
              جدولة حلقة فيديو جديدة تلقائية 📹
            </h4>

            <div className="space-y-3 text-xs font-bold text-slate-700 dark:text-slate-300">
              <div>
                <label className="block mb-1">عنوان الحصة:</label>
                <input
                  type="text"
                  required
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border"
                />
              </div>

              <div>
                <label className="block mb-1">السورة أو موضوع المراجعة:</label>
                <input
                  type="text"
                  required
                  value={surahInput}
                  onChange={(e) => setSurahInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1">التاريخ:</label>
                  <input
                    type="date"
                    required
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border"
                  />
                </div>
                <div>
                  <label className="block mb-1">الوقت:</label>
                  <input
                    type="text"
                    required
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 text-slate-600 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                توليد الغرفة ومزامنة التقويم
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
