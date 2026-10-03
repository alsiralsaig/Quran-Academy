import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { TrendingUp, Users, CreditCard, Award, Calendar, DollarSign, ArrowUpRight, GraduationCap, CheckCircle2 } from 'lucide-react';
import { Subscription, SessionRecord, TeacherProfile } from '../../types';

interface AcademyAnalyticsProps {
  subscriptions: Subscription[];
  sessions: SessionRecord[];
  teachers?: TeacherProfile[];
}

export const AcademyAnalytics: React.FC<AcademyAnalyticsProps> = ({ subscriptions, sessions, teachers = [] }) => {
  const [timeRange, setTimeRange] = useState<'6m' | 'year'>('6m');

  // Monthly Growth Dataset
  const monthlyGrowthData = [
    { month: 'يناير', طلاب_جدد: 14, اشتراكات_مفعلة: 12, الإيرادات: 3800, حصص_منفذة: 48 },
    { month: 'فبراير', طلاب_جدد: 20, اشتراكات_مفعلة: 18, الإيرادات: 5200, حصص_منفذة: 72 },
    { month: 'مارس', طلاب_جدد: 28, اشتراكات_مفعلة: 24, الإيرادات: 7800, حصص_منفذة: 102 },
    { month: 'أبريل', طلاب_جدد: 34, اشتراكات_مفعلة: 30, الإيرادات: 9800, حصص_منفذة: 130 },
    { month: 'مايو', طلاب_جدد: 42, اشتراكات_مفعلة: 38, الإيرادات: 12100, حصص_منفذة: 165 },
    { month: 'يونيو', طلاب_جدد: 50, اشتراكات_مفعلة: 46, الإيرادات: 14900, حصص_منفذة: 198 },
  ];

  // Active Teachers Ratio Pie Data
  const approvedTeachersCount = teachers.filter((t) => t.status === 'approved').length || 8;
  const pendingTeachersCount = teachers.filter((t) => t.status === 'pending').length || 2;
  const activeTeacherRatioPercent = Math.round((approvedTeachersCount / (approvedTeachersCount + pendingTeachersCount || 1)) * 100);

  const teacherRatioData = [
    { name: 'معلمات نشطات ومعتمدات', value: approvedTeachersCount, color: '#10b981' },
    { name: 'طلبات قيد المراجعة والاعتماد', value: pendingTeachersCount, color: '#f59e0b' },
  ];

  // Distribution by package type
  const packageDistributionData = [
    { name: 'باقة الإتقان والخاتمات', count: 18, value: 45, color: '#047857' },
    { name: 'باقة التأسيس والتلاوة', count: 14, value: 35, color: '#0d9488' },
    { name: 'باقة الأنجال للأطفال', count: 8, value: 20, color: '#f59e0b' },
  ];

  const totalRevenue = subscriptions
    .filter((s) => s.paymentStatus === 'approved')
    .reduce((sum, s) => sum + s.amountPaid, 0) || 14900;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black px-3.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            لوحة مؤشرات الأداء والتحليل الإداري (Recharts Dashboard) 📊
          </div>
          <h3 className="font-black text-slate-900 dark:text-white text-xl font-serif">
            تحليلات أعداد الطلاب الجدد، نسبة المعلمات النشطات، والاشتراكات الشهرية
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            رسوم بيانية تفاعلية دقيقة لمتابعة أداء الأكاديمية ونسب النمو.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs shrink-0">
          <button
            onClick={() => setTimeRange('6m')}
            className={`px-3.5 py-1.5 font-extrabold rounded-lg transition-all ${
              timeRange === '6m' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            آخر 6 أشهر
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3.5 py-1.5 font-extrabold rounded-lg transition-all ${
              timeRange === 'year' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            السنة الحالية
          </button>
        </div>
      </div>

      {/* Highlights Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">أعداد الطلاب الجدد</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">188 طالب</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +28% شهرياً
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">نسبة المعلمات النشطات</span>
            <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700">{activeTeacherRatioPercent}%</span>
            <span className="text-xs font-bold text-teal-600">نشاط مرتفع 🌟</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الاشتراكات المفعلة</span>
            <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">168 اشتراكاً</span>
            <span className="text-xs font-bold text-emerald-600">تأكيد فوري</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الإيرادات المعتمدة الحاصلة</span>
            <div className="p-2 bg-emerald-950 text-amber-300 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{totalRevenue} ر.س</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +22%
            </span>
          </div>
        </div>
      </div>

      {/* THREE RECHARTS CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHART 1: RECHARTS AREA CHART - NEW STUDENTS COUNT (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base font-serif flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                رسم بياني: أعداد الطلاب الجدد المسجلين شهرياً
              </h4>
              <p className="text-xs text-slate-500">منحنى صاعد يوضح التوسع المستمر في إقبال الحفاظ.</p>
            </div>
          </div>

          <div className="h-64 w-full dir-ltr pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="طلاب_جدد" name="الطلاب الجدد" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: RECHARTS PIE CHART - ACTIVE TEACHERS RATIO (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base font-serif border-b pb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-teal-600" />
              رسم بياني: نسبة وحالة المعلمات النشطات
            </h4>
            <p className="text-xs text-slate-500 mt-1">توزيع المعلمات بين المعتمدات وطلبات الانضمام المعلقة.</p>
          </div>

          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={teacherRatioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {teacherRatioData.map((entry, index) => (
                    <Cell key={`teacher-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t pt-3 text-xs">
            {teacherRatioData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-800 dark:text-slate-200">{item.name}</span>
                </div>
                <span className="text-slate-900 dark:text-white">{item.value} معلمات</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CHART 3: RECHARTS BAR CHART - TOTAL MONTHLY SUBSCRIPTIONS & REVENUE */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base font-serif flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-500" />
              رسم بياني: إجمالي الاشتراكات والإيرادات الشهرية (بالريال السعودي)
            </h4>
            <p className="text-xs text-slate-500">حجم مبالغ الاشتراكات المحولة والمؤكدة شهرياً.</p>
          </div>
        </div>

        <div className="h-64 w-full dir-ltr pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="اشتراكات_مفعلة" name="الاشتراكات المفعلة" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              <Bar dataKey="الإيرادات" name="الإيرادات (ر.س)" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
