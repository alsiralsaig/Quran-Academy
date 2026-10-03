import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Calendar,
  BookOpen,
  Target,
  Zap,
  Clock,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../../types';

export interface WeeklyStatPoint {
  day: string; // e.g. "السبت", "الأحد"...
  newAyahsCount: number;
  revisionAyahsCount: number;
  scorePercent: number;
}

export interface TajweedProficiencyMetric {
  ruleName: string;
  status: 'mastered' | 'improving' | 'needs_practice';
  masteryPercent: number;
  note: string;
}

interface PeriodicPerformanceAnalyticsDashboardProps {
  userRole: UserRole;
  userName: string;
}

const WEEKLY_STAT_DATA: WeeklyStatPoint[] = [
  { day: 'السبت', newAyahsCount: 15, revisionAyahsCount: 40, scorePercent: 95 },
  { day: 'الأحد', newAyahsCount: 20, revisionAyahsCount: 50, scorePercent: 98 },
  { day: 'الإثنين', newAyahsCount: 12, revisionAyahsCount: 35, scorePercent: 88 },
  { day: 'الثلاثاء', newAyahsCount: 25, revisionAyahsCount: 60, scorePercent: 100 },
  { day: 'الأربعاء', newAyahsCount: 18, revisionAyahsCount: 45, scorePercent: 92 },
  { day: 'الخميس', newAyahsCount: 30, revisionAyahsCount: 70, scorePercent: 96 },
  { day: 'الجمعة', newAyahsCount: 10, revisionAyahsCount: 80, scorePercent: 94 },
];

const TAJWEED_PROFICIENCY_RULES: TajweedProficiencyMetric[] = [
  { ruleName: 'مخارج الحروف وصفاتها', status: 'mastered', masteryPercent: 98, note: 'إتقان تام لمخارج الحلق والشفتين' },
  { ruleName: 'أحكام النون الساكنة والتنوين', status: 'mastered', masteryPercent: 95, note: 'إظهار وإدغام متقن جداً' },
  { ruleName: 'المدود الطبيعية والفرعية', status: 'improving', masteryPercent: 85, note: 'مراعاة زمن المد المنفصل بحاجة لثبات أكبر' },
  { ruleName: 'الإخفاء الحقيقي (خاصة القاف والكاف)', status: 'needs_practice', masteryPercent: 72, note: 'يحتاج تركيزاً على تفخيم غنة الإخفاء عند القاف' },
  { ruleName: 'أحكام الميم الساكنة والشفوي', status: 'mastered', masteryPercent: 92, note: 'أداء ممتاز في الإخفاء الشفوي' },
];

export const PeriodicPerformanceAnalyticsDashboard: React.FC<PeriodicPerformanceAnalyticsDashboardProps> = ({
  userRole,
  userName,
}) => {
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('weekly');
  const [selectedBar, setSelectedBar] = useState<WeeklyStatPoint | null>(WEEKLY_STAT_DATA[3]);

  // Total summary calculations
  const totalNewAyahs = WEEKLY_STAT_DATA.reduce((acc, curr) => acc + curr.newAyahsCount, 0);
  const totalRevisionAyahs = WEEKLY_STAT_DATA.reduce((acc, curr) => acc + curr.revisionAyahsCount, 0);
  const averageAccuracyScore = Math.round(
    WEEKLY_STAT_DATA.reduce((acc, curr) => acc + curr.scorePercent, 0) / WEEKLY_STAT_DATA.length
  );

  const maxAyahsInDay = Math.max(...WEEKLY_STAT_DATA.map((d) => d.newAyahsCount + d.revisionAyahsCount));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
      
      {/* HEADER BANNER & TIME FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 text-xs font-black px-3.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>لوحة التحليلات والإحصائيات الدورية 📊</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-serif text-slate-900 dark:text-white">
            تقرير الأداء ومعدلات الحفظ والمراجعة
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            تحليل دقيق وشامل لنشاط الحفظ الجديد، عدد الآيات المراجعة، ونقاط القوة وأحكام التجويد.
          </p>
        </div>

        {/* Time Period Filter Selector */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-extrabold border shrink-0">
          <button
            onClick={() => setTimeFilter('weekly')}
            className={`px-3 py-2 rounded-xl transition-all ${
              timeFilter === 'weekly'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            أسبوعي 📅
          </button>
          <button
            onClick={() => setTimeFilter('monthly')}
            className={`px-3 py-2 rounded-xl transition-all ${
              timeFilter === 'monthly'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            شهري 🗓️
          </button>
          <button
            onClick={() => setTimeFilter('quarterly')}
            className={`px-3 py-2 rounded-xl transition-all ${
              timeFilter === 'quarterly'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            فصلي 📈
          </button>
        </div>
      </div>

      {/* METRIC KPI CARDS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: New Memorized Ayahs */}
        <div className="p-5 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-3xl shadow-lg border border-emerald-600 space-y-2">
          <div className="flex items-center justify-between text-emerald-100">
            <span className="text-xs font-extrabold">الآيات الجديدة المحفوظة</span>
            <BookOpen className="w-5 h-5 text-amber-300" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono">{totalNewAyahs}</span>
            <span className="text-xs font-bold text-emerald-100">آية مباركة</span>
          </div>
          <span className="text-[10px] font-bold text-amber-200 bg-emerald-950/40 px-2.5 py-0.5 rounded-full inline-block">
            +18% ارتفاع عن الأسبوع الماضي 🚀
          </span>
        </div>

        {/* KPI 2: Reviewed Ayahs Volume */}
        <div className="p-5 bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 rounded-3xl shadow-lg border border-amber-500 space-y-2">
          <div className="flex items-center justify-between text-slate-900">
            <span className="text-xs font-extrabold">إجمالي الآيات المراجعة</span>
            <Target className="w-5 h-5 text-slate-950" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono">{totalRevisionAyahs}</span>
            <span className="text-xs font-bold text-slate-900">آية مراجعة</span>
          </div>
          <span className="text-[10px] font-bold text-slate-950 bg-amber-200/60 px-2.5 py-0.5 rounded-full inline-block">
            معدل ثبات وحفظ عالي جداً 🛡️
          </span>
        </div>

        {/* KPI 3: Accuracy Score */}
        <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold">متوسط جودة التسميع</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-amber-300">{averageAccuracyScore}%</span>
            <span className="text-xs font-bold text-slate-300">معدل الإتقان</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-slate-950 px-2.5 py-0.5 rounded-full inline-block">
            درجة ممتازة جداً 🌟
          </span>
        </div>

        {/* KPI 4: Streak Days */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-extrabold">سلسلة المواظبة المباشرة</span>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">12</span>
            <span className="text-xs font-bold text-slate-500">يوماً متواصلاً</span>
          </div>
          <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-950 px-2.5 py-0.5 rounded-full inline-block">
            التزام يومي استثنائي 🔥
          </span>
        </div>

      </div>

      {/* TWO-COLUMN ANALYTICS: INTERACTIVE GRAPH (7 cols) & STRENGTHS/WEAKNESSES Breakdown (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* INTERACTIVE COLUMN GRAPH CHART (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white font-serif flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                حجم الإنجاز اليومي (حفظ جديد + مراجعة)
              </h4>
              <span className="text-[10px] text-slate-400 font-bold block">اضغط على أي عمود لاستعراض التفاصيل اليومية</span>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block" />
                حفظ جديد
              </span>
              <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                <span className="w-3 h-3 rounded-md bg-amber-500 inline-block" />
                مراجعة
              </span>
            </div>
          </div>

          {/* GRAPH COLUMNS VISUALIZER */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2 border-b pb-2">
            {WEEKLY_STAT_DATA.map((item) => {
              const totalVal = item.newAyahsCount + item.revisionAyahsCount;
              const heightPercent = Math.round((totalVal / maxAyahsInDay) * 100);
              const isSelected = selectedBar?.day === item.day;

              return (
                <div
                  key={item.day}
                  onClick={() => setSelectedBar(item)}
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end"
                >
                  {/* Tooltip on hover/selection */}
                  <span className={`text-[10px] font-black font-mono transition-opacity ${
                    isSelected ? 'opacity-100 text-emerald-700 dark:text-emerald-300' : 'opacity-0 group-hover:opacity-100 text-slate-400'
                  }`}>
                    {totalVal} آية
                  </span>

                  {/* Dual Column Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
                      isSelected ? 'ring-2 ring-amber-400 shadow-lg scale-105' : 'hover:opacity-90'
                    }`}
                  >
                    {/* Revision part */}
                    <div
                      style={{ height: `${Math.round((item.revisionAyahsCount / totalVal) * 100)}%` }}
                      className="bg-amber-400 dark:bg-amber-500 transition-all"
                      title={`مراجعة: ${item.revisionAyahsCount} آية`}
                    />
                    {/* New memorization part */}
                    <div
                      style={{ height: `${Math.round((item.newAyahsCount / totalVal) * 100)}%` }}
                      className="bg-emerald-600 dark:bg-emerald-500 flex-1 transition-all"
                      title={`حفظ جديد: ${item.newAyahsCount} آية`}
                    />
                  </div>

                  <span className={`text-xs font-bold font-serif transition-colors ${
                    isSelected ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-slate-500'
                  }`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* SELECTED DAY DETAIL BREAKDOWN */}
          {selectedBar && (
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-emerald-800 dark:text-emerald-300 font-serif">
                  تفاصيل يوم ({selectedBar.day}):
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-mono">
                  نسبة إتقان التسميع: {selectedBar.scorePercent}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-slate-700 dark:text-slate-300">
                <div>• حفظ جديد: <span className="font-bold text-emerald-700">{selectedBar.newAyahsCount} آية</span></div>
                <div>• مراجعة وتثبيت: <span className="font-bold text-amber-600">{selectedBar.revisionAyahsCount} آية</span></div>
              </div>
            </div>
          )}

        </div>

        {/* STRENGTHS & WEAKNESSES TAJWEED ANALYSIS (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="border-b pb-3">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white font-serif flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              تحليل نقاط القوة وملاحظات التجويد
            </h4>
            <span className="text-[10px] text-slate-400 font-bold block">متابعة دقيقة لمستوى إتقان الأحكام</span>
          </div>

          <div className="space-y-3">
            {TAJWEED_PROFICIENCY_RULES.map((rule, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-white font-serif">
                    {rule.ruleName}
                  </span>
                  
                  {rule.status === 'mastered' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      مُتقَن 🌟
                    </span>
                  ) : rule.status === 'improving' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                      <TrendingUp className="w-3 h-3 text-amber-600" />
                      قيد التحسن 📈
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      يحتاج تدريباً ⚠️
                    </span>
                  )}
                </div>

                {/* Mastery Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${rule.masteryPercent}%` }}
                      className={`h-full rounded-full transition-all ${
                        rule.status === 'mastered'
                          ? 'bg-emerald-600'
                          : rule.status === 'improving'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">
                    {rule.note}
                  </span>
                </div>

              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
