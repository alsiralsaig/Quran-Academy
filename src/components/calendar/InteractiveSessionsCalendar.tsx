import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Video, Bell, ChevronRight, ChevronLeft, Plus, CheckCircle2, User, BookOpen } from 'lucide-react';
import { SessionRecord, UserRole } from '../../types';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD or formatted
  time: string; // e.g. "05:00 مساءً"
  teacherName: string;
  studentName: string;
  surahFocus: string;
  zoomUrl: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  minutesUntilSession?: number;
}

interface InteractiveSessionsCalendarProps {
  userRole: UserRole;
  userName: string;
  sessions?: SessionRecord[];
}

export const InteractiveSessionsCalendar: React.FC<InteractiveSessionsCalendarProps> = ({
  userRole,
  userName,
  sessions = [],
}) => {
  // Calendar date selection
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [currentMonthName, setCurrentMonthName] = useState<string>('أكتوبر 2026');

  // Reminders state
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Default sample scheduled upcoming sessions
  const [scheduledEvents, setScheduledEvents] = useState<CalendarEvent[]>([
    {
      id: 'evt_1',
      title: 'حلسة حفظ وتسميع سورة البقرة',
      date: new Date().toISOString().split('T')[0],
      time: '05:30 مساءً',
      teacherName: 'أ. عائشة محمود العلي',
      studentName: 'عبدالرحمن الشمري',
      surahFocus: 'سورة البقرة (آيات 1 - 25)',
      zoomUrl: 'https://zoom.us/j/9876543210',
      status: 'upcoming',
      minutesUntilSession: 15,
    },
    {
      id: 'evt_2',
      title: 'مراجعة وتثبيت سورة آل عمران',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '06:00 مساءً',
      teacherName: 'أ. فاطمة الزهراء',
      studentName: 'عبدالرحمن الشمري',
      surahFocus: 'سورة آل عمران (آيات 1 - 30)',
      zoomUrl: 'https://zoom.us/j/9876543210',
      status: 'upcoming',
      minutesUntilSession: 1440,
    },
  ]);

  // Modal for scheduling a new session event
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('جلسة تسميع قرآن كريم');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('04:00 مساءً');
  const [newSurah, setNewSurah] = useState('سورة البقرة');
  const [newPartnerName, setNewPartnerName] = useState(
    userRole === 'teacher' ? 'عبدالرحمن الشمري' : 'أ. عائشة محمود العلي'
  );

  const handleTrigger15MinReminder = (evt: CalendarEvent) => {
    setReminderToast(
      `🔔 تذكير حصة قريب: حلقة "${evt.title}" مع (${userRole === 'student' ? evt.teacherName : evt.studentName}) ستنسجم بعد 15 دقيقة! رابط القاعة المباشرة جاهز.`
    );
    setTimeout(() => setReminderToast(null), 6000);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();

    const newEvt: CalendarEvent = {
      id: `evt_${Date.now()}`,
      title: newTitle,
      date: newDate,
      time: newTime,
      teacherName: userRole === 'teacher' ? userName : newPartnerName,
      studentName: userRole === 'student' ? userName : newPartnerName,
      surahFocus: newSurah,
      zoomUrl: 'https://zoom.us/j/9876543210',
      status: 'upcoming',
      minutesUntilSession: 60,
    };

    setScheduledEvents([newEvt, ...scheduledEvents]);
    setShowAddModal(false);
    setReminderToast(`تم إضافة الموعد الجديد في التقويم وتفعيل التذكير الفوري بنجاح!`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  // Upcoming sessions for selected or overall
  const upcomingEvents = scheduledEvents.filter((e) => e.status === 'upcoming');

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
            <CalendarIcon className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                Interactive Calendar & 15m Alerts
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg font-serif">
              جدول الحصص والتذكيرات التفاعلية
            </h3>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          إضافة موعد حصة جديد
        </button>
      </div>

      {/* Reminder Notification Toast Banner */}
      {reminderToast && (
        <div className="p-4 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg border-2 border-amber-300 flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-950 shrink-0" />
            <span>{reminderToast}</span>
          </div>
          <button
            onClick={() => setReminderToast(null)}
            className="text-xs bg-slate-950 text-white px-2.5 py-1 rounded-xl"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Immediate 15-Minute Countdown Alert Banner */}
      {upcomingEvents.some((e) => e.minutesUntilSession && e.minutesUntilSession <= 30) && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 p-5 rounded-2xl shadow-md border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-950 text-amber-400 rounded-2xl font-bold animate-pulse">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold block text-slate-900">تنبيه الموعد القريب (خلال 15 دقيقة)</span>
              <h4 className="font-extrabold text-base">
                حصة {upcomingEvents[0].surahFocus} مع ({userRole === 'student' ? upcomingEvents[0].teacherName : upcomingEvents[0].studentName})
              </h4>
              <p className="text-xs text-slate-900 mt-0.5 font-semibold">الموعد اليوم: {upcomingEvents[0].time}</p>
            </div>
          </div>

          <a
            href={upcomingEvents[0].zoomUrl}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 bg-slate-950 hover:bg-slate-900 text-amber-300 font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
          >
            <Video className="w-4 h-4 text-amber-300 animate-pulse" />
            دخول القاعة المباشرة الآن
          </a>
        </div>
      )}

      {/* Calendar List View */}
      <div className="space-y-4">
        <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-700" />
          الحصص المجدولة القادمة:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scheduledEvents.map((event) => (
            <div
              key={event.id}
              className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 hover:border-emerald-300 transition-all"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-extrabold text-emerald-900 text-sm">{event.title}</span>
                <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {event.time}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-bold flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    المقرر: {event.surahFocus}
                  </span>
                  <span className="text-[11px] text-slate-500">{event.date}</span>
                </div>

                <div className="flex items-center gap-1 text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {userRole === 'student' ? `المعلمة: ${event.teacherName}` : `الطالب: ${event.studentName}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t text-xs">
                <button
                  onClick={() => handleTrigger15MinReminder(event)}
                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl flex items-center gap-1 border border-amber-300"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-700" />
                  تفعيل تذكير الـ 15 دقيقة
                </button>

                <a
                  href={event.zoomUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1"
                >
                  <Video className="w-3.5 h-3.5" />
                  رابط القاعة
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL TO ADD CUSTOM SESSION APPOINTMENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-emerald-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-700" />
                جدولة موعد حصة جديد
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الحصة</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التاريخ</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الوقت</label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">السورة والمقرر</label>
                <input
                  type="text"
                  required
                  value={newSurah}
                  onChange={(e) => setNewSurah(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {userRole === 'student' ? 'اسم المعلمة' : 'اسم الطالب'}
                </label>
                <input
                  type="text"
                  required
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
                >
                  تأكيد الجدول والتذكير
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
