import React, { useState, useRef } from 'react';
import {
  FileText,
  Printer,
  Download,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Star,
  Sparkles,
  TrendingUp,
  User,
  GraduationCap,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { SessionRecord, UserRole } from '../../types';

interface MonthlyPerformanceReportProps {
  studentName: string;
  userRole?: UserRole;
  sessions?: SessionRecord[];
}

export const MonthlyPerformanceReport: React.FC<MonthlyPerformanceReportProps> = ({
  studentName,
  userRole = 'student',
  sessions = [],
}) => {
  const [selectedMonth, setSelectedMonth] = useState('أكتوبر 2026');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Filtered session records or mock calculation
  const totalSessionsCount = sessions.length > 0 ? sessions.length : 12;
  const avgRating = sessions.length > 0
    ? (sessions.reduce((acc, s) => acc + s.rating, 0) / sessions.length).toFixed(1)
    : '4.8';

  // Monthly stats calculations
  const stats = {
    memorizationProgress: '85%',
    partsMemorized: '18 جزءاً',
    reviewsCompleted: `${totalSessionsCount} جلسة`,
    attendanceRate: '96%',
    totalPoints: '480 نقطة إتقان',
    tajweedMastery: 'إتقان أحكام النون الساكنة والمدود',
    nextFocusGoal: 'حفظ الجزء التاسع عشر (سورة الفرقان والشعراء) مع التثبيت',
  };

  const handlePrintOrExportPdf = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      window.print();
      setIsGeneratingPdf(false);
    }, 500);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
            <FileText className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                Official Performance Analytics
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg font-serif">
              تقرير الأداء والإتقان الشهري للطالب
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2.5 border rounded-2xl text-xs font-bold bg-slate-50 focus:bg-white"
          >
            <option value="أكتوبر 2026">شهر أكتوبر 2026</option>
            <option value="سبتمبر 2026">شهر سبتمبر 2026</option>
            <option value="أغسطس 2026">شهر أغسطس 2026</option>
          </select>

          {/* Export PDF / Print Button */}
          <button
            onClick={handlePrintOrExportPdf}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            تصدير كملف PDF / طباعة التقرير
          </button>
        </div>
      </div>

      {/* PRINTABLE / EXPORTABLE REPORT CARD */}
      <div
        ref={reportRef}
        className="print:p-8 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 p-6 sm:p-8 rounded-3xl border border-emerald-100 space-y-6 relative overflow-hidden"
      >
        {/* Printable Official Header Header (Visible in print/PDF) */}
        <div className="border-b-2 border-emerald-800 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-right">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-emerald-950 font-serif">أكاديمية إتقان لتعلّم وتحفيظ القرآن الكريم</h2>
              <p className="text-xs text-slate-600">تقرير المتابعة الشهري المعتمد لرحلة الحفظ والترتيل</p>
            </div>
          </div>

          <div className="text-left text-xs space-y-1 text-slate-700">
            <p className="font-bold">الفترة المالية والتقييمية: <span className="text-emerald-800 font-extrabold">{selectedMonth}</span></p>
            <p>اسم الطالب: <span className="font-extrabold text-slate-900">{studentName}</span></p>
            <p>الحالة: <span className="text-emerald-700 font-bold">مستمر وممتاز (مرتبة الشرف)</span></p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">نسبة إنجاز الحفظ</span>
            <span className="text-2xl font-black text-emerald-800 font-serif">{stats.memorizationProgress}</span>
            <span className="text-[10px] text-emerald-600 font-bold block">إجمالي {stats.partsMemorized}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">عدد المراجعات والتسميع</span>
            <span className="text-2xl font-black text-amber-600 font-serif">{stats.reviewsCompleted}</span>
            <span className="text-[10px] text-amber-700 font-bold block">معدل التقييم: {avgRating} / 5</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-teal-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">نسبة الالتزام بالحضور</span>
            <span className="text-2xl font-black text-teal-800 font-serif">{stats.attendanceRate}</span>
            <span className="text-[10px] text-teal-600 font-bold block">التزام تام بالمواعيد</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">نقاط التطور والتحفيز</span>
            <span className="text-2xl font-black text-purple-800 font-serif">{stats.totalPoints}</span>
            <span className="text-[10px] text-purple-600 font-bold block">+80 نقطة هذا الشهر</span>
          </div>
        </div>

        {/* Interactive Memorization Progression Chart over Time */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 font-serif">
                <TrendingUp className="w-5 h-5 text-emerald-700" />
                مخطط بياني لتطور مستوى الحفظ والتثبيت عبر الزمن (6 أشهر) 📈
              </h4>
              <p className="text-[11px] text-slate-500">
                متابعة النمو التراكمي لعدد الأجزاء المحفوظة، نسبة الإتقان، وساعات التسميع من مايو إلى أكتوبر 2026.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold shrink-0">
              <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                الأجزاء المحفوظة
              </span>
              <span className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                نسبة الإتقان %
              </span>
            </div>
          </div>

          {/* Visual SVG Chart Bar / Curve Representation */}
          <div className="relative pt-6 pb-2">
            <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-44 border-b border-slate-200 px-2 pb-2">
              {[
                { month: 'مايو', juz: 5, accuracy: 82, pages: 100 },
                { month: 'يونيو', juz: 8, accuracy: 85, pages: 160 },
                { month: 'يوليو', juz: 11, accuracy: 88, pages: 220 },
                { month: 'أغسطس', juz: 14, accuracy: 91, pages: 280 },
                { month: 'سبتمبر', juz: 16, accuracy: 93, pages: 320 },
                { month: 'أكتوبر', juz: 18, accuracy: 96, pages: 360 },
              ].map((dataPoint, idx) => {
                const barHeightPct = (dataPoint.juz / 20) * 100; // max 20 juz

                return (
                  <div key={idx} className="flex flex-col items-center gap-2 group h-full justify-end relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all absolute -top-12 z-20 bg-slate-900 text-white text-[10px] p-2 rounded-xl shadow-xl pointer-events-none whitespace-nowrap text-center">
                      <p className="font-extrabold text-amber-300">{dataPoint.month} 2026</p>
                      <p>الأجزاء: {dataPoint.juz} جزء ({dataPoint.pages} صفحة)</p>
                      <p className="text-emerald-300">نسبة الإتقان: {dataPoint.accuracy}%</p>
                    </div>

                    {/* Score badge above bar */}
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md border border-emerald-300">
                      {dataPoint.juz} ج
                    </span>

                    {/* Dual visual bar */}
                    <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-full relative border border-slate-200">
                      {/* Accuracy fill line */}
                      <div
                        style={{ height: `${dataPoint.accuracy}%` }}
                        className="w-full bg-amber-400/30 absolute bottom-0 left-0 border-t border-amber-500"
                      />
                      {/* Juz bar fill */}
                      <div
                        style={{ height: `${barHeightPct}%` }}
                        className="w-full bg-gradient-to-t from-emerald-800 to-emerald-600 rounded-t-lg transition-all group-hover:from-emerald-700 group-hover:to-teal-500 shadow-md relative z-10"
                      />
                    </div>

                    <span className="text-xs font-bold text-slate-700 font-serif">
                      {dataPoint.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-400 text-center pt-2 font-medium">
              مرر المؤشر فوق أي شهر لعرض تفاصيل عدد الصفحات المحفوظة ونسبة الضبط والتجويد المسجلة.
            </p>
          </div>
        </div>

        {/* Detailed Assessment Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Progress Chart / Breakdown Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 border-b pb-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              توزيع درجات الإتقان والتجويد:
            </h4>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>جودة الحفظ والتثبيت الخالي من الأخطاء:</span>
                  <span className="text-emerald-800">95%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[95%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>تطبيق أحكام التجويد ومخارج الحروف:</span>
                  <span className="text-amber-700">90%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[90%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>الالتزام بالواجبات والورد اليومي:</span>
                  <span className="text-teal-700">98%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full w-[98%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Summary & Direct Recommendations */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 border-b pb-2">
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              توصيات وتقييم المعلمة المشرفة:
            </h4>

            <p className="text-slate-700 leading-relaxed">
              "أداء استثنائي ومبارك للطالب <span className="font-bold text-emerald-950">{studentName}</span> خلال شهر {selectedMonth}. هناك تطور ملحوظ في ضبط مقادير المدود وقلقلة حروف قطب جد، وننصح بالاستمرار في ورد المراجعة اليومي لثبات التسميع."
            </p>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-950 space-y-1">
              <span className="font-bold block text-[10px]">الهدف والورد المقترح للشهر القادم:</span>
              <p className="font-semibold text-[11px]">{stats.nextFocusGoal}</p>
            </div>
          </div>
        </div>

        {/* Stamp & Official Signatures Footer */}
        <div className="pt-6 border-t border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span className="font-bold text-slate-700">معتمد من إدارة أكاديمية إتقان القرأنية</span>
          </div>

          <div className="flex items-center gap-8 text-center text-[11px] text-slate-600">
            <div>
              <span className="block font-bold">توقيع المعلمة المشرفة</span>
              <span className="font-serif italic font-bold text-emerald-900">أ. عائشة محمود</span>
            </div>
            <div>
              <span className="block font-bold">ختم الأكاديمية</span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                [ختم الاعتماد الرقمي]
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
