import React, { useState, useEffect } from 'react';
import {
  Target,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  Award,
  Plus,
  Minus,
  RotateCcw,
  BookOpen,
  Edit2,
  Save
} from 'lucide-react';

export interface DayGoal {
  dayName: string;
  targetPages: number;
  completedPages: number;
  notes?: string;
}

const DEFAULT_WEEKLY_GOALS: DayGoal[] = [
  { dayName: 'الأحد', targetPages: 2, completedPages: 2 },
  { dayName: 'الإثنين', targetPages: 2, completedPages: 2 },
  { dayName: 'الثلاثاء', targetPages: 2, completedPages: 1 },
  { dayName: 'الأربعاء', targetPages: 2, completedPages: 2 },
  { dayName: 'الخميس', targetPages: 2, completedPages: 0 },
  { dayName: 'الجمعة', targetPages: 1, completedPages: 1 },
  { dayName: 'السبت', targetPages: 3, completedPages: 2 },
];

export const WeeklyGoalsPlanner: React.FC = () => {
  const STORAGE_KEY = 'etqan_weekly_quran_goals';
  const [goals, setGoals] = useState<DayGoal[]>(DEFAULT_WEEKLY_GOALS);
  const [isEditingTargets, setIsEditingTargets] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  // Load saved goals from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setGoals(JSON.parse(saved));
      } catch {
        setGoals(DEFAULT_WEEKLY_GOALS);
      }
    }
  }, []);

  const saveGoalsToStorage = (updatedGoals: DayGoal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGoals));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  // Toggle completed pages for a day
  const handleUpdateCompletedPages = (index: number, delta: number) => {
    const updated = [...goals];
    const current = updated[index].completedPages;
    const newCompleted = Math.max(0, current + delta);
    updated[index].completedPages = newCompleted;
    saveGoalsToStorage(updated);
  };

  // Update target pages for a day
  const handleUpdateTargetPages = (index: number, delta: number) => {
    const updated = [...goals];
    const current = updated[index].targetPages;
    const newTarget = Math.max(1, current + delta);
    updated[index].targetPages = newTarget;
    saveGoalsToStorage(updated);
  };

  // Reset weekly progress
  const handleResetProgress = () => {
    if (confirm('هل أنت تأكد من إعادة ضبط إنجاز الأسبوع للبدء من جديد؟')) {
      const resetGoals = goals.map((g) => ({ ...g, completedPages: 0 }));
      saveGoalsToStorage(resetGoals);
    }
  };

  // Overall Weekly Calculations
  const totalTargetPages = goals.reduce((acc, g) => acc + g.targetPages, 0);
  const totalCompletedPages = goals.reduce((acc, g) => acc + g.completedPages, 0);
  const weeklyPercentage = totalTargetPages > 0 ? Math.round((totalCompletedPages / totalTargetPages) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-100 dark:border-slate-800 shadow-lg space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Weekly Quran Goals Planner 🎯</span>
          </div>
          <h3 className="text-xl font-extrabold font-serif text-slate-900 dark:text-white">
            تخطيط الأهداف ومتابعة الإنجاز الأسبوعي
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            حدد عدد الصفحات المستهدفة لكل يوم وتابع نسبة إنجازك الفعلي لتثبيت وردك القرآني.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditingTargets(!isEditingTargets)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all ${
              isEditingTargets
                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            {isEditingTargets ? <Save className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
            <span>{isEditingTargets ? 'إنهاء التعديل' : 'تعديل الأهداف'}</span>
          </button>

          <button
            onClick={handleResetProgress}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
            title="إعادة ضبط إنجاز الأسبوع"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* OVERALL WEEKLY PROGRESS STATS CARD */}
      <div className="p-5 bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-white rounded-2xl shadow-xl space-y-4 border border-emerald-800/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-300 block">إجمالي الإنجاز الأسبوعي:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400 font-serif">{totalCompletedPages}</span>
              <span className="text-sm font-extrabold text-emerald-200">من أصل {totalTargetPages} صفحة</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-3xl font-black text-emerald-300 font-serif">{weeklyPercentage}%</span>
            <span className="text-xs font-bold text-emerald-200 block">نسبة تحقيق الهدف 🎉</span>
          </div>
        </div>

        {/* Animated Weekly Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-emerald-900/90 h-3.5 rounded-full overflow-hidden p-0.5 border border-emerald-700">
            <div
              style={{ width: `${weeklyPercentage}%` }}
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-full rounded-full transition-all duration-700 shadow-md"
            />
          </div>
          <p className="text-[11px] text-emerald-200 font-medium">
            {weeklyPercentage >= 100
              ? '🌟 ما شاء الله! أتممت هدفك الأسبوعي كاملاً، زادك الله توفيقاً وإتقاناً!'
              : weeklyPercentage >= 70
              ? '👍 أداء مميز جداً! أنت على بعد خطوات قليلة من إتمام كامل الورد الأسبوعي.'
              : 'واصل اجتهادك اليومي للحفاظ على تعاهد القرآن الكريم واستكمال وردك.'}
          </p>
        </div>
      </div>

      {/* DAILY GOALS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {goals.map((day, idx) => {
          const isDone = day.completedPages >= day.targetPages;

          return (
            <div
              key={day.dayName}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative ${
                isDone
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-800 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-serif font-black text-sm text-slate-900 dark:text-white">
                  {day.dayName}
                </span>

                {isDone ? (
                  <span className="p-1 bg-emerald-500 text-white rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold text-slate-400">متبقي</span>
                )}
              </div>

              {/* Target vs Completed Stats */}
              <div className="space-y-1 text-center py-1">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-serif">
                    {day.completedPages}
                  </span>
                  <span className="text-xs font-bold text-slate-400">/ {day.targetPages} ص</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 block">
                  {isDone ? 'مكتمل ✅' : `${day.targetPages - day.completedPages} صفحة متبقية`}
                </span>
              </div>

              {/* Incremental Control Buttons */}
              <div className="pt-2 border-t flex items-center justify-between gap-1">
                {isEditingTargets ? (
                  // Target Page Incrementor
                  <div className="w-full flex items-center justify-between bg-white dark:bg-slate-900 p-1 rounded-xl border">
                    <button
                      onClick={() => handleUpdateTargetPages(idx, -1)}
                      className="p-1 text-slate-500 hover:text-rose-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      الهدف: {day.targetPages}
                    </span>
                    <button
                      onClick={() => handleUpdateTargetPages(idx, 1)}
                      className="p-1 text-slate-500 hover:text-emerald-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  // Completed Pages Incrementor
                  <div className="w-full flex items-center justify-between bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                    <button
                      onClick={() => handleUpdateCompletedPages(idx, -1)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="إنقاص صفحة"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                      {day.completedPages} ص
                    </span>

                    <button
                      onClick={() => handleUpdateCompletedPages(idx, 1)}
                      className="p-1 text-emerald-700 hover:text-emerald-900 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800"
                      title="إضافة صفحة مكتملة"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
