import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Flame, Sparkles, BookOpen, Clock, ChevronRight, ChevronLeft, Award } from 'lucide-react';
import { triggerFireworksCelebration } from '../achievements/AchievementCelebrationModal';
import { useApp } from '../../context/AppContext';

export interface DailyMemorizationTask {
  dayNumber: number;
  dateStr: string;
  planTitle: string; // e.g. "حفظ سورة الملك ص1"
  completed: boolean;
  notes?: string;
}

interface InteractiveMemorizationCalendarProps {
  studentName: string;
  onStreakUpdate?: (streakDays: number) => void;
}

export const InteractiveMemorizationCalendar: React.FC<InteractiveMemorizationCalendarProps> = ({
  studentName,
  onStreakUpdate,
}) => {
  // أيام الشهر الحالي الحقيقي؛ الإنجاز محفوظ في قاعدة البيانات مع حساب الطالب
  const { userData, saveUserData } = useApp();
  const done: Record<string, boolean> = userData.memorization_days || {};
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const today = now.getDate();

  const daysList: DailyMemorizationTask[] = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const dateStr = `${ym}-${String(day).padStart(2, '0')}`;
    const weekday = new Date(now.getFullYear(), now.getMonth(), day).getDay();
    const plan = weekday === 5 ? 'مراجعة وتثبيت محفوظ الأسبوع' : 'ورد الحفظ اليومي';
    return { dayNumber: day, dateStr, planTitle: plan, completed: !!done[dateStr] };
  });
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(today);
  const selectedDay = daysList[selectedDayNumber - 1] || daysList[0];
  const setSelectedDay = (d: DailyMemorizationTask) => setSelectedDayNumber(d.dayNumber);

  // Calculate stats
  const completedDaysCount = daysList.filter((d) => d.completed).length;
  const completionPercentage = Math.round((completedDaysCount / daysList.length) * 100);

  // السلسلة: أيام متتالية منجزة تنتهي اليوم (أو أمس لو اليوم لسه ما اتسجّل)
  let currentStreak = 0;
  {
    let i = daysList[today - 1]?.completed ? today - 1 : today - 2;
    while (i >= 0 && daysList[i].completed) {
      currentStreak++;
      i--;
    }
  }

  const handleToggleDayCompletion = (dayNumber: number) => {
    const item = daysList[dayNumber - 1];
    if (!item) return;
    const next = { ...done };
    if (item.completed) delete next[item.dateStr];
    else {
      next[item.dateStr] = true;
      triggerFireworksCelebration();
    }
    // نحتفظ بآخر ~400 يوم فقط
    const keys = Object.keys(next).sort().slice(-400);
    saveUserData('memorization_days', Object.fromEntries(keys.map((k) => [k, true])));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl">
            <CalendarIcon className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                Daily Memorization Plan & Habit Calendar
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg font-serif">
              تقويم خطة الحفظ اليومية ومتابعة الإنجاز
            </h3>
          </div>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs px-4 py-2 rounded-2xl shadow-md border border-amber-300 shrink-0">
          <Flame className="w-5 h-5 text-slate-950 fill-slate-950 animate-bounce" />
          <span>سلسلة الإنجاز المتواصل: {currentStreak} يوماً متتالياً ⚡</span>
        </div>
      </div>

      {/* Progress & Month Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl border border-emerald-700 space-y-2">
          <span className="text-[11px] text-amber-300 font-bold block">شهر أكتوبر 2026</span>
          <span className="text-2xl font-black font-serif text-white block">
            {completedDaysCount} من 30 يوماً مكتمل
          </span>
          <div className="w-full bg-emerald-950 h-2 rounded-full overflow-hidden p-0.5 border border-emerald-600">
            <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>

        <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-800 font-bold block">نسبة الالتزام بالورد اليومي</span>
            <span className="text-3xl font-black text-emerald-950 font-serif">{completionPercentage}%</span>
          </div>
          <Sparkles className="w-8 h-8 text-emerald-600" />
        </div>

        <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-900 font-bold block">الأيام المكتملة (بالأخضر)</span>
            <span className="text-3xl font-black text-amber-950 font-serif">{completedDaysCount} يوماً 🟩</span>
          </div>
          <Award className="w-8 h-8 text-amber-600" />
        </div>
      </div>

      {/* Interactive 30-Day Calendar Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b pb-2 text-xs font-bold text-slate-700">
          <span>انقر على أي يوم لتأكيد إتمام الحفظ وتلوينه باللون الأخضر 🟩:</span>
          <span className="text-emerald-700 font-extrabold">🟢 الأخضر = مكتمل بنجاح</span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-10 gap-2.5">
          {daysList.map((day) => {
            const isCompleted = day.completed;
            const isSelected = selectedDay.dayNumber === day.dayNumber;

            return (
              <button
                key={day.dayNumber}
                onClick={() => {
                  setSelectedDay(day);
                  handleToggleDayCompletion(day.dayNumber);
                }}
                className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1 relative overflow-hidden group ${
                  isCompleted
                    ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-emerald-500 shadow-lg scale-[1.02] font-black'
                    : isSelected
                    ? 'bg-amber-100 text-slate-900 border-amber-400 font-bold ring-2 ring-amber-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <span className={`text-[10px] font-sans font-bold ${isCompleted ? 'text-emerald-100' : 'text-slate-500'}`}>
                  اليوم {day.dayNumber}
                </span>

                <span className="text-base font-black font-serif">
                  {day.dayNumber}
                </span>

                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-amber-300 mt-0.5" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-emerald-500 mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Task Detail Box */}
      {selectedDay && (
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              تفاصيل ورِد اليوم ({selectedDay.dayNumber} أكتوبر 2026):
            </span>

            <button
              onClick={() => handleToggleDayCompletion(selectedDay.dayNumber)}
              className={`px-4 py-2 font-black rounded-xl border transition-all shadow-sm ${
                selectedDay.completed
                  ? 'bg-emerald-700 text-white border-emerald-800'
                  : 'bg-amber-400 hover:bg-amber-500 text-slate-950 border-amber-300'
              }`}
            >
              {selectedDay.completed ? '✓ تم إتمام الحفظ (مكتمل)' : 'حدد كـ تم الإنجاز 🟩'}
            </button>
          </div>

          <p className="font-bold text-slate-800 text-sm">
            الورِد المقررة: <span className="text-emerald-700">{selectedDay.planTitle}</span>
          </p>

          {selectedDay.notes && (
            <p className="text-slate-600 bg-white p-3 rounded-xl border">
              ملحوظة الطالبة: {selectedDay.notes}
            </p>
          )}
        </div>
      )}

    </div>
  );
};
