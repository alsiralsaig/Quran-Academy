import React, { useState } from 'react';
import {
  TrendingUp,
  Brain,
  Lightbulb,
  Award,
  Sparkles,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  Users,
  Target,
  FileText,
  ChevronLeft,
  ArrowUpRight,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export interface StudentPerformanceInsight {
  studentId: string;
  studentName: string;
  surahTopic: string;
  accuracyPercent: number; // e.g. 94%
  dailyPages: number;
  weakPoints: string[];
  recommendation: string;
  statusLevel: 'excellent' | 'needs_improvement' | 'steady';
}

const SAMPLE_PERFORMANCE_DATA: StudentPerformanceInsight[] = [
  {
    studentId: 'st_1',
    studentName: 'سارة العتيبي',
    surahTopic: 'سورة البقرة (الجزء 2)',
    accuracyPercent: 96,
    dailyPages: 2.5,
    weakPoints: ['مدود منفصلة', 'متشابهات آيات الإنفاق'],
    recommendation: 'تمتاز بدقة متناهية. يُوصى بالتركيز على ربط متشابهات أواخر سورة البقرة مع آل عمران.',
    statusLevel: 'excellent',
  },
  {
    studentId: 'st_2',
    studentName: 'عبدالرحمن الشمري',
    surahTopic: 'سورة آل عمران (الجزء 3)',
    accuracyPercent: 82,
    dailyPages: 1.5,
    weakPoints: ['أحكام الإخفاء الحقيقي', 'قلقلة صغرى'],
    recommendation: 'يُوصى بتخفيف كمية الحفظ اليومي إلى صفحة واحدة مع زيادة تكرار استماع القارئ الحصري.',
    statusLevel: 'needs_improvement',
  },
  {
    studentId: 'st_3',
    studentName: 'فاطمة الزهراء',
    surahTopic: 'سورة النساء (الجزء 4)',
    accuracyPercent: 91,
    dailyPages: 2.0,
    weakPoints: ['مخارج حروف الحلق (العين والحاء)'],
    recommendation: 'أداء ممتاز واستمرارية عالية. يوصى بإجراء تمارين مخارج الحروف الصوتية قبل التسميع.',
    statusLevel: 'steady',
  },
  {
    studentId: 'st_4',
    studentName: 'عمر الفاروق',
    surahTopic: 'سورة المائدة (الجزء 6)',
    accuracyPercent: 78,
    dailyPages: 1.0,
    weakPoints: ['الوقوف والابتداء', 'غنة النون المشددة'],
    recommendation: 'يتطلب جلسة مراجعة مركزة لمواضع الوقف الهبطي والاستعانة بالمصحف الملون.',
    statusLevel: 'needs_improvement',
  },
];

// Weekly Trend Data for Recharts
const WEEKLY_TREND_DATA = [
  { day: 'السبت', متوسط_الدقة: 85, الصفحات_المنجزة: 18 },
  { day: 'الأحد', متوسط_الدقة: 88, الصفحات_المنجزة: 22 },
  { day: 'الإثنين', متوسط_الدقة: 90, الصفحات_المنجزة: 25 },
  { day: 'الثلاثاء', متوسط_الدقة: 87, الصفحات_المنجزة: 20 },
  { day: 'الأربعاء', متوسط_الدقة: 93, الصفحات_المنجزة: 28 },
  { day: 'الخميس', متوسط_الدقة: 95, الصفحات_المنجزة: 30 },
];

interface PerformanceInsightsProps {
  teacherName: string;
}

export const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({ teacherName }) => {
  const [selectedStudent, setSelectedStudent] = useState<StudentPerformanceInsight | null>(
    SAMPLE_PERFORMANCE_DATA[0]
  );
  const [copiedRec, setCopiedRec] = useState(false);

  const avgAccuracy = Math.round(
    SAMPLE_PERFORMANCE_DATA.reduce((acc, s) => acc + s.accuracyPercent, 0) /
      SAMPLE_PERFORMANCE_DATA.length
  );

  const handleCopyRecommendation = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRec(true);
    setTimeout(() => setCopiedRec(false), 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black px-3.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
            <Brain className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>نظام تحليل الأداء والتوصيات التربوية الذكية (Performance Insights) 📊</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-serif text-slate-900 dark:text-white">
            محلل دقة الحفظ والتوصيات المخصصة لطلاب الحلقة
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            تحليل تلقائي لبيانات التقييم اليومي مع تقديم إرشادات علاجية موجهة لكل طالب.
          </p>
        </div>

        <div className="bg-emerald-950 text-white p-3 px-5 rounded-2xl border border-emerald-800 shrink-0 text-left">
          <span className="text-[10px] text-emerald-300 block font-bold">متوسط دقة الحلقة الكلي:</span>
          <span className="text-2xl font-black text-amber-300 font-mono">{avgAccuracy}% 🎯</span>
        </div>
      </div>

      {/* RECHARTS CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHART 1: WEEKLY ACCURACY & PAGES TREND (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h4 className="font-extrabold text-sm font-serif text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                مسار تطور دقة الحفظ والصفحات المنجزة أسبوعياً
              </h4>
              <p className="text-[11px] text-slate-500">متوسط دقة التلاوة مقارنة بعدد الصفحات المسمعة.</p>
            </div>
          </div>

          <div className="h-60 w-full dir-ltr pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEEKLY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                <Line type="monotone" dataKey="متوسط_الدقة" name="متوسط دقة الحفظ (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="الصفحات_المنجزة" name="إجمالي الصفحات المسمعة" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: STUDENT ACCURACY BAR COMPARISON (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-sm font-serif text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-500" />
              مقارنة نسب الإتقان بين طلاب الحلقة
            </h4>
            <p className="text-[11px] text-slate-500">معدل الإتقان لكل طالب بناءً على آخر التقييمات.</p>
          </div>

          <div className="h-48 w-full dir-ltr pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SAMPLE_PERFORMANCE_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="studentName" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="accuracyPercent" name="نسبة الإتقان (%)" fill="#047857" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-slate-400 font-bold text-center border-t pt-2">
            انقر على اسم الطالب في الجدول أدناه لاستعراض التوصية المخصصة
          </div>
        </div>

      </div>

      {/* STUDENT PERFORMANCE TABLE & AI RECOMMENDATION DETAILS */}
      <div className="space-y-4">
        <h4 className="font-extrabold text-base font-serif text-slate-900 dark:text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          توصيات التحسين المخصصة بناءً على التقييم اليومي
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* STUDENTS LIST (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b">
                    <th className="p-3">اسم الطالب/الطالبة</th>
                    <th className="p-3">المقرر الحالي</th>
                    <th className="p-3 text-center">نسبة الإتقان</th>
                    <th className="p-3 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {SAMPLE_PERFORMANCE_DATA.map((student) => (
                    <tr
                      key={student.studentId}
                      onClick={() => setSelectedStudent(student)}
                      className={`cursor-pointer transition-all ${
                        selectedStudent?.studentId === student.studentId
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 font-bold border-emerald-300'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`}
                    >
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {student.studentName}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {student.surahTopic}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-600">
                        {student.accuracyPercent}%
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          student.statusLevel === 'excellent'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : student.statusLevel === 'needs_improvement'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {student.statusLevel === 'excellent'
                            ? 'متقن ممتاز 🏆'
                            : student.statusLevel === 'needs_improvement'
                            ? 'يحتاج توجيه 💡'
                            : 'مستقر 👍'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SELECTED STUDENT RECOMMENDATION CARD (5 cols) */}
          {selectedStudent && (
            <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-2xl p-5 border-2 border-amber-400 shadow-xl space-y-4 relative flex flex-col justify-between">
              
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    توصية علاجية مخصصة 🎯
                  </span>
                  <span className="text-xs text-amber-200 font-mono font-bold">
                    إتقان: {selectedStudent.accuracyPercent}%
                  </span>
                </div>

                <h4 className="text-lg font-black font-serif text-amber-300">
                  {selectedStudent.studentName}
                </h4>

                {/* WEAK POINTS BADGES */}
                <div className="space-y-1">
                  <span className="text-[10px] text-emerald-300 font-bold block">ملاحظات التقييم اليومي:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.weakPoints.map((wp, idx) => (
                      <span
                        key={idx}
                        className="bg-emerald-900/90 text-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-lg border border-emerald-700"
                      >
                        • {wp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ACTIONABLE RECOMMENDATION TEXT */}
                <div className="p-3.5 bg-emerald-950/90 rounded-xl border border-emerald-700 text-xs text-emerald-100 leading-relaxed font-sans space-y-1">
                  <span className="font-bold text-amber-300 block text-[11px]">التوصية التربوية الموجهة:</span>
                  <p>"{selectedStudent.recommendation}"</p>
                </div>
              </div>

              {/* COPY & SHARE BUTTON */}
              <button
                onClick={() => handleCopyRecommendation(selectedStudent.recommendation)}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{copiedRec ? 'تم نسخ التوصية لإرسالها للطالب!' : 'إرسال التوصية للطالبة عبر الرسائل ✉️'}</span>
              </button>

            </div>
          )}

        </div>
      </div>

    </div>
  );
};
