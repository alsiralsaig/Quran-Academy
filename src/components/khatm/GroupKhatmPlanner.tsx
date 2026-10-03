import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Award,
  Sparkles,
  Plus,
  Lock,
  UserCheck,
  Heart,
  Share2,
  Timer,
  ChevronLeft
} from 'lucide-react';
import { UserRole } from '../../types';

export interface GroupKhatmJuzAssignment {
  juzNumber: number;
  juzName: string; // e.g. "الجزء الأول (من الفاتحة إلى البقرة 141)"
  assignedStudentName?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface GroupKhatmCampaign {
  id: string;
  title: string;
  description: string;
  teacherName: string;
  startDate: string;
  deadlineDate: string; // YYYY-MM-DD
  targetGoalDays: number;
  assignments: GroupKhatmJuzAssignment[];
}

const INITIAL_KHATM_CAMPAIGNS: GroupKhatmCampaign[] = [
  {
    id: 'khatm_ramadan_1',
    title: 'ختمة بركة رمضان المبارك لعام 1447هـ 🌙',
    description: 'ختمة قرآنية مباركة تتوزع فيها أجزاء القرآن الثلاثون على طالبات وحافظات الأكاديمية بنية التوفيق والقبول.',
    teacherName: 'أ. عائشة محمود العلي',
    startDate: '2026-10-01',
    deadlineDate: '2026-10-10',
    targetGoalDays: 10,
    assignments: Array.from({ length: 30 }, (_, index) => {
      const juzNum = index + 1;
      const sampleNames = ['فاطمة الشمري', 'مريم الدوسري', 'سارة القحطاني', 'نورة الغامدي', 'أسماء العتيبي'];
      const isAssigned = juzNum <= 22;
      const isDone = juzNum <= 18;
      return {
        juzNumber: juzNum,
        juzName: `الجزء ${juzNum}`,
        assignedStudentName: isAssigned ? sampleNames[juzNum % sampleNames.length] : undefined,
        isCompleted: isDone,
        completedAt: isDone ? '2026-10-02' : undefined,
      };
    }),
  },
];

interface GroupKhatmPlannerProps {
  userRole: UserRole;
  userName: string;
}

export const GroupKhatmPlanner: React.FC<GroupKhatmPlannerProps> = ({ userRole, userName }) => {
  const [campaigns, setCampaigns] = useState<GroupKhatmCampaign[]>(INITIAL_KHATM_CAMPAIGNS);
  const [activeCampaignId, setActiveCampaignId] = useState<string>(campaigns[0].id);
  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];

  // Countdown State
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // New Campaign Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('ختمة سيدة نساء العالمين 📖');
  const [newDesc, setNewDesc] = useState<string>('ختمة مباركة لتثبيت الحفظ ونيل الأجر والمغفرة.');
  const [newDeadlineDays, setNewDeadlineDays] = useState<number>(7);

  // Selected Juz for Assignment Modal
  const [assigningJuzNumber, setAssigningJuzNumber] = useState<number | null>(null);
  const [assignStudentInputName, setAssignStudentInputName] = useState<string>('');

  // Calculate Countdown
  useEffect(() => {
    const calculateTimeLeft = () => {
      const deadline = new Date(activeCampaign.deadlineDate).getTime();
      const now = new Date().getTime();
      const difference = deadline - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [activeCampaign.deadlineDate]);

  // Total metrics
  const completedJuzCount = activeCampaign.assignments.filter((a) => a.isCompleted).length;
  const assignedJuzCount = activeCampaign.assignments.filter((a) => a.assignedStudentName).length;
  const progressPercent = Math.round((completedJuzCount / 30) * 100);

  // Claim or Assign Juz
  const handleAssignJuz = (juzNum: number, name: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== activeCampaignId) return c;
        return {
          ...c,
          assignments: c.assignments.map((a) =>
            a.juzNumber === juzNum
              ? { ...a, assignedStudentName: name || userName }
              : a
          ),
        };
      })
    );
    setAssigningJuzNumber(null);
    setAssignStudentInputName('');
  };

  // Toggle Juz Completion Status
  const handleToggleJuzCompletion = (juzNum: number) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== activeCampaignId) return c;
        return {
          ...c,
          assignments: c.assignments.map((a) => {
            if (a.juzNumber !== juzNum) return a;
            const newCompleted = !a.isCompleted;
            return {
              ...a,
              isCompleted: newCompleted,
              completedAt: newCompleted ? new Date().toISOString().split('T')[0] : undefined,
            };
          }),
        };
      })
    );
  };

  // Handle Create New Campaign
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + newDeadlineDays);

    const newCampaign: GroupKhatmCampaign = {
      id: `khatm_${Date.now()}`,
      title: newTitle,
      description: newDesc,
      teacherName: userName || 'المعلمة المشرفة',
      startDate: new Date().toISOString().split('T')[0],
      deadlineDate: futureDate.toISOString().split('T')[0],
      targetGoalDays: newDeadlineDays,
      assignments: Array.from({ length: 30 }, (_, index) => ({
        juzNumber: index + 1,
        juzName: `الجزء ${index + 1}`,
        isCompleted: false,
      })),
    };

    setCampaigns([newCampaign, ...campaigns]);
    setActiveCampaignId(newCampaign.id);
    setShowCreateModal(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 text-xs font-black px-3.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>جدولة الختمات الجماعية والمباركة 🌙</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 dark:text-white">
            مخطط وتوزيع الأجزاء في الختمات الجماعية
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            توزيع أجزاء القرآن الثلاثون على الطلاب بمرونة، مع متابعة الإنجاز لحظياً وعداد تنازلي لموعد الختام.
          </p>
        </div>

        {/* Teacher Action: Create New Campaign Button */}
        {userRole === 'teacher' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء خطة ختمة جماعية جديدة 📖</span>
          </button>
        )}
      </div>

      {/* ACTIVE KHATM CAMPAIGN HIGHLIGHT & COUNTDOWN BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-emerald-800/80 space-y-6 relative overflow-hidden">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <span className="text-[11px] font-black text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30 inline-block">
              الختمة الحالية الفعالة • بقلم المعلمة: {activeCampaign.teacherName}
            </span>
            <h4 className="text-2xl sm:text-3xl font-black font-serif text-amber-100">
              {activeCampaign.title}
            </h4>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              {activeCampaign.description}
            </p>
          </div>

          {/* COUNTDOWN TIMER BOX */}
          <div className="bg-emerald-900/80 p-4 rounded-2xl border border-emerald-700 shrink-0 space-y-2 text-center min-w-[260px]">
            <span className="text-amber-300 text-xs font-extrabold flex items-center justify-center gap-1.5">
              <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
              الوقت المتبقي لانتهاء الختمة:
            </span>

            <div className="grid grid-cols-4 gap-2 text-center dir-ltr">
              <div className="bg-emerald-950 p-2 rounded-xl border border-emerald-700">
                <span className="text-xl font-black text-amber-300 block font-mono">{timeLeft.days}</span>
                <span className="text-[10px] text-emerald-200">أيام</span>
              </div>
              <div className="bg-emerald-950 p-2 rounded-xl border border-emerald-700">
                <span className="text-xl font-black text-white block font-mono">{timeLeft.hours}</span>
                <span className="text-[10px] text-emerald-200">ساعة</span>
              </div>
              <div className="bg-emerald-950 p-2 rounded-xl border border-emerald-700">
                <span className="text-xl font-black text-white block font-mono">{timeLeft.minutes}</span>
                <span className="text-[10px] text-emerald-200">دقيقة</span>
              </div>
              <div className="bg-emerald-950 p-2 rounded-xl border border-emerald-700">
                <span className="text-xl font-black text-amber-300 block font-mono">{timeLeft.seconds}</span>
                <span className="text-[10px] text-emerald-200">ثانية</span>
              </div>
            </div>
          </div>
        </div>

        {/* PROGRESS METRICS BAR */}
        <div className="space-y-2 pt-2 border-t border-emerald-800/80 relative z-10">
          <div className="flex items-center justify-between text-xs font-extrabold">
            <span className="text-emerald-200">نسبة إنجاز الختمة الجماعية:</span>
            <span className="text-amber-300 font-mono text-sm">{completedJuzCount} من 30 جزءاً تم ختمه ({progressPercent}%)</span>
          </div>

          <div className="w-full bg-emerald-950 h-3.5 rounded-full overflow-hidden border border-emerald-800 p-0.5">
            <div
              style={{ width: `${progressPercent}%` }}
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500 shadow-lg"
            />
          </div>
        </div>

        {/* COMPLETION CELEBRATION BANNER & DU'A AL-KHATM */}
        {completedJuzCount === 30 && (
          <div className="p-6 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 rounded-2xl shadow-2xl border-2 border-amber-500 text-center space-y-3 animate-in zoom-in-95">
            <Sparkles className="w-8 h-8 text-slate-950 mx-auto animate-bounce" />
            <h4 className="text-xl font-black font-serif">مبارك! تم بحمد الله وتوفيقه ختم القرآن الكريم كاملاً! 🎉</h4>
            <p className="text-xs font-bold max-w-lg mx-auto leading-relaxed">
              "اللَّهُمَّ ارْحَمْنِي بِالقُرْآنِ وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً..." هنيئاً لكل الطالبات والحافظات المشاركات في هذه الختمة الميمونة!
            </p>
          </div>
        )}

      </div>

      {/* 30 JUZ ASSIGNMENT & STATUS GRID */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <h4 className="font-black text-slate-900 dark:text-white text-base font-serif flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            جدول تخصيص الأجزاء الـ 30 (حالة القراءة والختم)
          </h4>
          <span className="text-xs font-bold text-slate-500">
            انقر على الجزء لحجزه أو لتأكيد القراءة
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {activeCampaign.assignments.map((juz) => (
            <div
              key={juz.juzNumber}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative overflow-hidden ${
                juz.isCompleted
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-950 dark:text-emerald-200'
                  : juz.assignedStudentName
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-950 dark:text-amber-200'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs font-mono ${
                  juz.isCompleted
                    ? 'bg-emerald-600 text-white'
                    : juz.assignedStudentName
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}>
                  {juz.juzNumber}
                </span>

                {juz.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : juz.assignedStudentName ? (
                  <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">متاح</span>
                )}
              </div>

              <div>
                <h5 className="font-extrabold text-xs font-serif block">{juz.juzName}</h5>
                <span className="text-[10px] font-bold opacity-80 block truncate mt-0.5">
                  {juz.assignedStudentName ? `المخصَّص: ${juz.assignedStudentName}` : 'لم يُخصص بعد'}
                </span>
              </div>

              {/* Action Buttons for Juz */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5">
                {!juz.assignedStudentName ? (
                  <button
                    onClick={() => {
                      if (userRole === 'teacher') {
                        setAssigningJuzNumber(juz.juzNumber);
                      } else {
                        handleAssignJuz(juz.juzNumber, userName);
                      }
                    }}
                    className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[11px] rounded-xl shadow-xs transition-all"
                  >
                    حجز الجزء ✋
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleJuzCompletion(juz.juzNumber)}
                    className={`w-full py-1.5 font-extrabold text-[11px] rounded-xl shadow-xs transition-all ${
                      juz.isCompleted
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    }`}
                  >
                    {juz.isCompleted ? 'إلغاء الختم' : 'تأكيد القراءة ✅'}
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* TEACHER JUZ ASSIGNMENT MODAL */}
      {assigningJuzNumber && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base font-serif">
              تخصيص الجزء ({assigningJuzNumber}) لطالبة
            </h4>
            <p className="text-xs text-slate-500">
              ادخل اسم الطالبة المخصصة لقراءة ورعاية هذا الجزء في الختمة الجماعية:
            </p>

            <input
              type="text"
              value={assignStudentInputName}
              onChange={(e) => setAssignStudentInputName(e.target.value)}
              placeholder="اسم الطالبة..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700"
            />

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAssigningJuzNumber(null)}
                className="flex-1 py-2.5 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleAssignJuz(assigningJuzNumber, assignStudentInputName)}
                className="flex-1 py-2.5 bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                حفظ التخصيص
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW KHATM CAMPAIGN MODAL FOR TEACHERS */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <form onSubmit={handleCreateCampaign} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-lg font-serif">
                إنشاء خطة ختمة جماعية جديدة 📖
              </h4>
            </div>

            <div className="space-y-3 text-xs font-bold text-slate-700 dark:text-slate-300">
              <div>
                <label className="block mb-1">عنوان الختمة الجماعية:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block mb-1">وصف ورسالة الختمة:</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block mb-1">مدة المستهدف بالأيام (العداد التنازلي):</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={newDeadlineDays}
                  onChange={(e) => setNewDeadlineDays(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 text-slate-600 font-bold text-xs rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                إطلاق خطة الختمة 🚀
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
