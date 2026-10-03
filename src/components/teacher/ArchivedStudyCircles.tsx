import React, { useState, useEffect } from 'react';
import {
  Archive,
  Search,
  RotateCcw,
  FileText,
  Download,
  Users,
  Award,
  CheckCircle2,
  Calendar,
  BookOpen,
  Printer,
  X,
  Sparkles,
  ChevronLeft
} from 'lucide-react';

export interface ArchivedCircle {
  id: string;
  name: string;
  level: string;
  teacherName: string;
  completedDate: string;
  studentCount: number;
  totalPagesMemorized: number;
  attendanceRate: number;
  students: {
    name: string;
    surahCompleted: string;
    grade: string;
    rating: string;
    notes: string;
  }[];
}

const INITIAL_ARCHIVED_CIRCLES: ArchivedCircle[] = [
  {
    id: 'arch_1',
    name: 'حلقة ختم جزء عم - الدفعة الأولى',
    level: 'المستوى المبتدئ',
    teacherName: 'د. عائشة العتيبي',
    completedDate: '2026-09-15',
    studentCount: 12,
    totalPagesMemorized: 240,
    attendanceRate: 96,
    students: [
      { name: 'فاطمة الشمري', surahCompleted: 'جزء عم كاملاً', grade: 'ممتاز مرتفع', rating: '99%', notes: 'إتقان تلميح مخارج الحروف وأحكام النون الساكنة' },
      { name: 'مريم الدوسري', surahCompleted: 'جزء عم كاملاً', grade: 'ممتاز', rating: '95%', notes: 'التزام عالي بالحضور والتسميع اليومي' },
      { name: 'سارة القحطاني', surahCompleted: 'جزء عم كاملاً', grade: 'جيد جداً مرتفع', rating: '92%', notes: 'مواظبة جيدة وتحسن ملحوظ في أحكام المدود' },
    ],
  },
  {
    id: 'arch_2',
    name: 'حلقة تثبيت سورة البقرة وآل عمران',
    level: 'المستوى المتقدم',
    teacherName: 'د. عائشة العتيبي',
    completedDate: '2026-08-30',
    studentCount: 8,
    totalPagesMemorized: 640,
    attendanceRate: 98,
    students: [
      { name: 'نورة الغامدي', surahCompleted: 'سورة البقرة وآل عمران', grade: 'ممتاز مرتفع (100%)', rating: '100%', notes: 'ختمة متقنة جداً بدون أي أخطاء لفظية' },
      { name: 'هدى المالكي', surahCompleted: 'سورة البقرة وآل عمران', grade: 'ممتاز', rating: '97%', notes: 'أداء صوتي شجي وحفظ راسخ' },
    ],
  },
];

export const ArchivedStudyCircles: React.FC = () => {
  const STORAGE_KEY = 'etqan_archived_circles_db';
  const [archivedCircles, setArchivedCircles] = useState<ArchivedCircle[]>(INITIAL_ARCHIVED_CIRCLES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCircleForReport, setSelectedCircleForReport] = useState<ArchivedCircle | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setArchivedCircles(JSON.parse(saved));
      } catch {
        setArchivedCircles(INITIAL_ARCHIVED_CIRCLES);
      }
    }
  }, []);

  const saveToStorage = (updated: ArchivedCircle[]) => {
    setArchivedCircles(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Restore Circle back to active
  const handleRestoreCircle = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من استرجاع "${name}" من الأرشيف وإعادتها لقائمة الحلقات النشطة؟`)) {
      const updated = archivedCircles.filter((c) => c.id !== id);
      saveToStorage(updated);
      alert(`تم استرجاع "${name}" بنجاح إلى الحلقات النشطة!`);
    }
  };

  // Filter archived circles
  const filteredCircles = archivedCircles.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.level.toLowerCase().includes(q) ||
      c.students.some((s) => s.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-300 dark:border-amber-800">
            <Archive className="w-4 h-4 text-amber-700" />
            <span>Archived Study Circles Archive 📁</span>
          </div>
          <h3 className="text-xl font-extrabold font-serif text-slate-900 dark:text-white">
            أرشيف الحلقات المكتملة وتقارير التخرج النهائية
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            تصفح الحلقات القرآنية المكتملة وسجلات الخريجات، مع خيار استرجاع الحلقات وتوليد تقرير نهائي شامل للحلقة.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الحلقة أو الطالبات..."
            className="w-full pr-9 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
          />
        </div>
      </div>

      {/* ARCHIVED CIRCLES GRID */}
      {filteredCircles.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 space-y-2">
          <Archive className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="font-extrabold text-sm text-slate-700 dark:text-slate-300">لا توجد حلقات مؤرشفة تطابق البحث</h4>
          <p className="text-xs text-slate-400">يمكنك أرشفة الحلقات المكتملة من قائمة الحلقات النشطة لاحقاً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCircles.map((circle) => (
            <div
              key={circle.id}
              className="p-5 bg-gradient-to-br from-slate-50 to-amber-50/30 dark:from-slate-800/90 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm hover:border-amber-400 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                    مكتملة ومؤرشفة ✅
                  </span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base font-serif mt-1">
                    {circle.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {circle.level} • تاريخ الاكتفاء: {circle.completedDate}
                  </p>
                </div>

                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Archive className="w-5 h-5 text-amber-700" />
                </div>
              </div>

              {/* Stats Summary Badge */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <div>
                  <span className="text-xs text-slate-400 block font-bold">عدد الطالبات</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">{circle.studentCount} طالبة</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-bold">الصفحات المحفوظة</span>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{circle.totalPagesMemorized} ص</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-bold">نسبة الانضباط</span>
                  <span className="text-sm font-black text-amber-600">{circle.attendanceRate}%</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSelectedCircleForReport(circle)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>توليد التقرير النهائي الشامل 📜</span>
                </button>

                <button
                  onClick={() => handleRestoreCircle(circle.id, circle.name)}
                  className="px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                  title="استرجاع الحلقة للحالة النشطة"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>استرجاع للنشطة</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPREHENSIVE FINAL REPORT MODAL */}
      {selectedCircleForReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-emerald-300 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl">
                  <FileText className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    التقرير النهائي الشامل للحلقة المكتملة 📜
                  </span>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg font-serif mt-0.5">
                    {selectedCircleForReport.name}
                  </h3>
                </div>
              </div>

              <button onClick={() => setSelectedCircleForReport(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Report Document Card */}
            <div className="p-6 bg-amber-50/50 dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-slate-800 space-y-6 font-serif">
              
              {/* Report Header Branding */}
              <div className="text-center space-y-1 border-b pb-4 border-amber-200/80">
                <h2 className="text-xl font-extrabold text-emerald-900 dark:text-emerald-400">أكاديمية إتقان لتحفيظ القرآن الكريم</h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-sans font-bold">
                  تقرير إتمام وتقييم الدفعة الدراسية - المعلمة المشرفة: {selectedCircleForReport.teacherName}
                </p>
                <p className="text-[11px] text-slate-400 font-sans">تاريخ التوثيق والاكتمال: {selectedCircleForReport.completedDate}</p>
              </div>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans">
                <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">إجمالي الطالبات</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{selectedCircleForReport.studentCount}</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">مجموع الصفحات</span>
                  <span className="text-base font-black text-emerald-700">{selectedCircleForReport.totalPagesMemorized} ص</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">نسبة الانضباط</span>
                  <span className="text-base font-black text-amber-600">{selectedCircleForReport.attendanceRate}%</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">مستوى الحلقة</span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">{selectedCircleForReport.level}</span>
                </div>
              </div>

              {/* Graduating Students Table */}
              <div className="space-y-2 font-sans">
                <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  سجل نتائج وتقييم الطالبات الخريجات:
                </h4>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold">
                      <tr>
                        <th className="p-3">اسم الطالبة</th>
                        <th className="p-3">المقرر المكتمل</th>
                        <th className="p-3">التقدير النهائي</th>
                        <th className="p-3">ملاحظات المعلمة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {selectedCircleForReport.students.map((std, i) => (
                        <tr key={i} className="hover:bg-amber-50/50 dark:hover:bg-slate-900 font-medium">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{std.name}</td>
                          <td className="p-3 text-emerald-700 dark:text-emerald-400 font-bold">{std.surahCompleted}</td>
                          <td className="p-3 font-bold text-amber-600">{std.grade}</td>
                          <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px]">{std.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>طباعة / تصدير التقرير النهائي (PDF) 🖨️</span>
              </button>

              <button
                onClick={() => setSelectedCircleForReport(null)}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                إغلاق النافذة
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
