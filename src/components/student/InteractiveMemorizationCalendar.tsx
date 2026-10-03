import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Flame, Sparkles, BookOpen, Clock, ChevronRight, ChevronLeft, Award } from 'lucide-react';
import { triggerFireworksCelebration } from '../achievements/AchievementCelebrationModal';

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
  // Generate default 30 days for October 2026
  const initialDays: DailyMemorizationTask[] = Array.from({ length: 30 }, (_, index) => {
    const day = index + 1;
    const isPastCompleted = day <= 12; // Days 1-12 completed for demo
    
    // Sample Quran memorization plan sequence
    let plan = 'حفظ مقطع جديد';
    if (day <= 5) plan = `حفظ سورة الملك - صفحة ${day}`;
    else if (day <= 10) plan = `حفظ سورة النبأ - صفحة ${day - 5}`;
    else if (day <= 15) plan = `حفظ سورة النازعات - صفحة ${day - 10}`;
    else if (day <= 20) plan = `مراجعة وتثبيت جزء عمّ كاملاً`;
    else if (day <= 25) plan = `حفظ سورة الأعلى والطارق`;
    else plan = `تسميع واختبار السور الجديدة`;

    return {
      dayNumber: day,
      dateStr: `2026-10-${day.toString().padStart(2, '0')}`,
      planTitle: plan,
      completed: isPastCompleted,
      notes: isPastCompleted ? 'تم التسميع بنجاح لمدرسة الحلقة' : undefined,
    };
  });

  const [daysList, setDaysList] = useState<DailyMemorizationTask[]>(initialDays);
  const [selectedDay, setSelectedDay] = useState<DailyMemorizationTask>(daysList[11]); // Default to today (Day 12)

  // Calculate stats
  const completedDaysCount = daysList.filter((d) => d.completed).length;
  const completionPercentage = Math.round((completedDaysCount / daysList.length) * 100);

  // Calculate current active streak
  let currentStreak = 0;
  for (let i = 0; i < daysList.length; i++) {
    if (daysList[i].completed) {
      currentStreak++;
    } else {
      break;
    }
  }

  const handleToggleDayCompletion = (dayNumber: number) => {
    setDaysList((prev) =>
      prev.map((item) => {
        if (item.dayNumber === dayNumber) {
          const nextState = !item.completed;
          
          if (nextState) {
            // Trigger fireworks celebration for daily accomplishment!
            triggerFireworksCelebration();
          }

          return { ...item, completed: nextState };
        }
        return item;
      })
    );

    // Update selected day view
    setSelectedDay((prev) => ({
      ...prev,
      completed: prev.dayNumber === dayNumber ? !prev.completed : prev.completed,
    }));
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
