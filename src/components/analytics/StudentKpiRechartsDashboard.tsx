import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Award,
  BookOpen,
  Target,
  BarChart2,
  Sparkles,
  Calendar,
  CheckCircle2,
  Star,
  Activity
} from 'lucide-react';

export interface WeeklyKpiDataPoint {
  weekLabel: string; // e.g. "الأسبوع 1"
  newAyahs: number; // الآيات المحفوظة
  revisionAyahs: number; // الآيات المراجعة
  evaluationScore: number; // نقاط التقييم من 100
  tajweedRating: number; // تقييم التجويد من 5
}

const INITIAL_KPI_DATA: WeeklyKpiDataPoint[] = [
  { weekLabel: 'الأسبوع 1', newAyahs: 35, revisionAyahs: 120, evaluationScore: 88, tajweedRating: 4.2 },
  { weekLabel: 'الأسبوع 2', newAyahs: 42, revisionAyahs: 150, evaluationScore: 92, tajweedRating: 4.5 },
  { weekLabel: 'الأسبوع 3', newAyahs: 38, revisionAyahs: 140, evaluationScore: 90, tajweedRating: 4.3 },
  { weekLabel: 'الأسبوع 4', newAyahs: 50, revisionAyahs: 180, evaluationScore: 96, tajweedRating: 4.8 },
  { weekLabel: 'الأسبوع 5', newAyahs: 45, revisionAyahs: 165, evaluationScore: 94, tajweedRating: 4.7 },
  { weekLabel: 'الأسبوع 6', newAyahs: 55, revisionAyahs: 210, evaluationScore: 98, tajweedRating: 4.9 },
  { weekLabel: 'الأسبوع 7', newAyahs: 48, revisionAyahs: 190, evaluationScore: 95, tajweedRating: 4.8 },
  { weekLabel: 'الأسبوع 8', newAyahs: 60, revisionAyahs: 230, evaluationScore: 100, tajweedRating: 5.0 },
];

interface StudentKpiRechartsDashboardProps {
  studentName: string;
}

export const StudentKpiRechartsDashboard: React.FC<StudentKpiRechartsDashboardProps> = ({ studentName }) => {
  const [selectedRange, setSelectedRange] = useState<number>(8); // weeks
  const filteredData = INITIAL_KPI_DATA.slice(-selectedRange);

  // Totals & Averages
  const totalNewAyahs = filteredData.reduce((acc, curr) => acc + curr.newAyahs, 0);
  const totalRevisionAyahs = filteredData.reduce((acc, curr) => acc + curr.revisionAyahs, 0);
  const avgScore = Math.round(
    filteredData.reduce((acc, curr) => acc + curr.evaluationScore, 0) / filteredData.length
  );
  const avgTajweed = (
    filteredData.reduce((acc, curr) => acc + curr.tajweedRating, 0) / filteredData.length
  ).toFixed(1);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 text-xs font-black px-3.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            <span>لوحة مؤشرات الأداء الحصرية (Recharts KPIs) 📊</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-serif text-slate-900 dark:text-white">
            تحليلات الحفظ والمراجعة ونقاط التقييم الأسبوعية
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            رسوم بيانية تفاعلية متقدمة توضح معدلات التقدم، عدد الآيات المراجعة، ومستوى التقييم للطالبة {studentName}.
          </p>
        </div>

        {/* Range Filter Selector */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-extrabold border shrink-0">
          <span className="text-slate-400 pl-2 text-[11px]">الفترة:</span>
          <button
            onClick={() => setSelectedRange(4)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedRange === 4 ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            آخر 4 أسابيع
          </button>
          <button
            onClick={() => setSelectedRange(8)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedRange === 8 ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            آخر 8 أسابيع
          </button>
        </div>
      </div>

      {/* KPI HIGHLIGHT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-3xl shadow-lg space-y-2 border border-emerald-500">
          <div className="flex items-center justify-between text-emerald-100">
            <span className="text-xs font-extrabold">معدل الحفظ الجديد</span>
            <BookOpen className="w-5 h-5 text-amber-300" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono">{totalNewAyahs}</span>
            <span className="text-xs font-bold text-emerald-100">آية جديدة</span>
          </div>
          <span className="text-[10px] font-bold text-amber-200 bg-emerald-950/40 px-2.5 py-0.5 rounded-full inline-block">
            +22% ارتفاع أسبوعي 🚀
          </span>
        </div>

        <div className="p-5 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-3xl shadow-lg space-y-2 border border-amber-400">
          <div className="flex items-center justify-between text-slate-900">
            <span className="text-xs font-extrabold">إجمالي الآيات المراجعة</span>
            <Target className="w-5 h-5 text-slate-950" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono">{totalRevisionAyahs}</span>
            <span className="text-xs font-bold text-slate-900">آية مراجعة</span>
          </div>
          <span className="text-[10px] font-bold text-slate-950 bg-amber-200/60 px-2.5 py-0.5 rounded-full inline-block">
            تثبيت متماسك ومستمر 🛡️
          </span>
        </div>

        <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-lg space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold">متوسط نقاط التقييم الأسبوعي</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-amber-300">{avgScore}%</span>
            <span className="text-xs font-bold text-slate-300">درجة إتقان</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-slate-950 px-2.5 py-0.5 rounded-full inline-block">
            ممتاز مرتفع 🌟
          </span>
        </div>

        <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-extrabold">تقييم التجويد والأداء</span>
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">{avgTajweed}</span>
            <span className="text-xs font-bold text-slate-500">من 5.0</span>
          </div>
          <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-950 px-2.5 py-0.5 rounded-full inline-block">
            مخارج ومخارج دقيقة 👑
          </span>
        </div>
      </div>

      {/* TWO MAIN RECHARTS GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CHART 1: RECHARTS BAR/AREA CHART - MEMORIZATION VS REVISION */}
        <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white font-serif flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                مقارنة حجم الحفظ الجديد والآيات المراجعة
              </h4>
              <span className="text-[10px] text-slate-400 font-bold block">موزعة حسب الأسابيع الأخير</span>
            </div>
          </div>

          <div className="h-64 w-full dir-ltr pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="weekLabel" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="newAyahs" name="الحفظ الجديد (آيات)" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="revisionAyahs" name="المراجعة (آيات)" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: RECHARTS LINE CHART - WEEKLY EVALUATION SCORES */}
        <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white font-serif flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                مسار درجات التقييم الأسبوعية (%)
              </h4>
              <span className="text-[10px] text-slate-400 font-bold block">منحنى تطور جودة التلاوة والتسميع</span>
            </div>
          </div>

          <div className="h-64 w-full dir-ltr pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="weekLabel" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[60, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="evaluationScore"
                  name="درجة التقييم (%)"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
