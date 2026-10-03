import React, { useState } from 'react';
import {
  BookOpen,
  UserCheck,
  CreditCard,
  CheckCircle2,
  Clock,
  Video,
  Award,
  Upload,
  Star,
  Copy,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Calendar,
  AlertCircle,
  Mic,
  Brain,
  Bell
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Package, TeacherProfile, Subscription } from '../../types';
import { SAMPLE_RECEIPT } from '../../data/initialState';
import { QuickReviewMode } from './QuickReviewMode';
import { GamificationBadges } from './GamificationBadges';
import { InteractiveSessionsCalendar } from '../calendar/InteractiveSessionsCalendar';
import { GroupStudyRoom } from '../teacher/GroupStudyRoom';
import { DigitalLibrary } from '../library/DigitalLibrary';
import { MonthlyPerformanceReport } from '../reports/MonthlyPerformanceReport';
import { QuranPomodoroTimer } from '../pomodoro/QuranPomodoroTimer';
import { BroadcastAnnouncementBanner } from '../common/BroadcastAnnouncementBanner';
import { AchievementCelebrationModal, MilestoneAchievement } from '../achievements/AchievementCelebrationModal';
import { NotificationPreferencesModal } from '../notifications/NotificationPreferencesModal';
import { SurahQuizModule } from '../quiz/SurahQuizModule';
import { QuranMemorizationProgressBar } from './QuranMemorizationProgressBar';
import { KhatmJourneyPath } from './KhatmJourneyPath';
import { InteractiveMemorizationCalendar } from './InteractiveMemorizationCalendar';
import { DigitalBadgesShowcase } from './DigitalBadgesShowcase';
import { StudentNotificationToastPopup } from '../notifications/StudentNotificationToastPopup';
import { InteractiveRecitationLibrary } from '../audio/InteractiveRecitationLibrary';
import { SmartVoiceRecitation } from './SmartVoiceRecitation';
import { QuranFocusSessionMode } from './QuranFocusSessionMode';
import { PrayerTimesIslamicEventsSidebar } from '../common/PrayerTimesIslamicEventsSidebar';
import { WeeklyGoalsPlanner } from '../dashboard/WeeklyGoalsPlanner';
import { ArabicCalligraphyStudio } from '../calligraphy/ArabicCalligraphyStudio';
import { GroupKhatmPlanner } from '../khatm/GroupKhatmPlanner';
import { PeriodicPerformanceAnalyticsDashboard } from '../analytics/PeriodicPerformanceAnalyticsDashboard';
import { StudentKpiRechartsDashboard } from '../analytics/StudentKpiRechartsDashboard';
import { LiveSessionScheduler } from '../video/LiveSessionScheduler';
import { LiveQuranClassroomModal } from '../classroom/LiveQuranClassroomModal';
import { GripVertical, ArrowUp, ArrowDown, Move } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    registerStudent,
    teachers,
    packages,
    bankAccounts,
    subscriptions,
    subscribeToPackage,
    sessions
  } = useApp();

  // Active student account or fallback
  const [studentName, setStudentName] = useState(currentUser.name || 'عبدالرحمن الشمري');
  const [studentPhone, setStudentPhone] = useState(currentUser.phone || '+966 54 000 0001');
  const [studentEmail, setStudentEmail] = useState(currentUser.email || 'student.abdulrahman@quran-academy.com');

  // Subscription wizard state
  const [showSubscribeWizard, setShowSubscribeWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(packages[0] || null);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherProfile | null>(
    teachers.find((t) => t.status === 'approved') || null
  );
  const [receiptImage, setReceiptImage] = useState<string>(SAMPLE_RECEIPT);
  const [copiedIban, setCopiedIban] = useState('');
  const [submitSuccessSub, setSubmitSuccessSub] = useState<Subscription | null>(null);
  const [isQuickReviewOpen, setIsQuickReviewOpen] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [activeCelebration, setActiveCelebration] = useState<MilestoneAchievement | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isClassroomOpen, setIsClassroomOpen] = useState(false);

  // Get active student's subscriptions
  const mySubscriptions = subscriptions.filter(
    (s) => s.studentId === currentUser.id || s.studentName === currentUser.name || s.studentPhone === currentUser.phone
  );

  const activeApprovedSub = mySubscriptions.find((s) => s.paymentStatus === 'approved');
  const pendingSub = mySubscriptions.find((s) => s.paymentStatus === 'pending');

  // Drag and Drop Widget Customization Order State
  const [widgetOrder, setWidgetOrder] = useState<string[]>([
    'live_scheduler',
    'recharts_kpis',
    'khatm_planner',
    'calligraphy',
    'analytics',
    'quiz',
    'group_room',
    'library',
    'recitation',
    'pomodoro',
  ]);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    const idx = widgetOrder.indexOf(id);
    if (idx === -1) return;
    const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= widgetOrder.length) return;
    const newOrder = [...widgetOrder];
    const temp = newOrder[idx];
    newOrder[idx] = newOrder[nextIdx];
    newOrder[nextIdx] = temp;
    setWidgetOrder(newOrder);
  };

  // Filter student's sessions logs
  const mySessions = sessions.filter(
    (ses) => ses.studentId === currentUser.id || ses.studentName === currentUser.name
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIban(text);
    setTimeout(() => setCopiedIban(''), 2500);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReceiptImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSubmitSubscription = () => {
    if (!selectedPkg || !selectedTeacher) return;

    // Register student in state
    const std = registerStudent(studentName, studentEmail, studentPhone);

    const newSub = subscribeToPackage({
      studentId: std.id,
      studentName: std.name,
      studentPhone: std.phone,
      teacherId: selectedTeacher.id,
      packageId: selectedPkg.id,
      receiptUrl: receiptImage,
    });

    setSubmitSuccessSub(newSub);
    setShowSubscribeWizard(false);
    setWizardStep(1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Broadcast Announcement Banner */}
      <BroadcastAnnouncementBanner />
      
      {/* Student Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-600/60 text-emerald-100 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30 mb-2">
              <UserCheck className="w-3.5 h-3.5 text-amber-300" />
              حساب الطالب وولي الأمر
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">
              مرحباً بك، <span className="text-amber-300">{studentName}</span>
            </h2>
            <p className="text-emerald-100/80 text-xs sm:text-sm mt-1">
              متابعة الحصص المتبقية، الورد اليومي، وتقارير التلاوة والتجويد مع المعلمة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsQuickReviewOpen(true)}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/40 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4 text-amber-300" />
              وضع المراجعة والتحضير الذاتي (Quick Review)
            </button>

            <button
              onClick={() => setShowSubscribeWizard(true)}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              الاشتراك في باقة جديدة / تحويل إيصال
            </button>
          </div>
        </div>
      </div>

      {/* Pending Subscription Banner */}
      {pendingSub && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-amber-900 text-sm">طلب الاشتراك قيد مراجعة التحويل البنكي</h4>
              <p className="text-amber-800 text-xs mt-0.5">
                تم رفع صورة الإيصال لباقة ({pendingSub.packageName}) مع المعلمة ({pendingSub.teacherName}). جاري مراجعة الإدارة وتفعيل الحصص.
              </p>
            </div>
          </div>
          <span className="bg-amber-200 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-300 shrink-0">
            بانتظار موافقة الإدارة
          </span>
        </div>
      )}

      {/* ACTIVE SUBSCRIPTION CARD: REMAINING VS USED SESSIONS GAUGE */}
      {activeApprovedSub ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-300">
                الباقة المفعّلة حالياً
              </span>
              <h3 className="font-extrabold text-slate-900 text-xl font-serif mt-2">
                {activeApprovedSub.packageName}
              </h3>
              <p className="text-xs text-slate-500">
                المعلمة المباشرة: <span className="font-bold text-emerald-700">{activeApprovedSub.teacherName}</span>
              </p>
            </div>

            {/* Direct Join Class Link & Celebrate Milestone & Notification Preferences Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowFocusMode(true)}
                className="px-4 py-3 bg-emerald-950 hover:bg-emerald-900 text-amber-300 font-extrabold text-xs rounded-2xl transition-all border border-emerald-600 shadow-md flex items-center justify-center gap-1.5"
                title="تفعيل وضع التركيز والتجريد من المشتتات"
              >
                <Brain className="w-4 h-4 text-amber-400 animate-pulse" />
                وضع 'جلسة التركيز' 🧘‍♂️
              </button>

              <button
                onClick={() => setShowNotificationModal(true)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-all border shadow-sm flex items-center justify-center gap-1.5"
                title="تحديد موعد التذكير اليومي"
              >
                <Bell className="w-4 h-4 text-emerald-700" />
                تنسيق الإشعارات 🔔
              </button>

              <button
                onClick={() =>
                  setActiveCelebration({
                    id: 'milestone_1',
                    title: 'حفظ وتثبيت سورة البقرة المباركة كاملاً',
                    surahOrBadge: 'سورة البقرة',
                    pointsAwarded: 100,
                    description: 'تهانينا الحارة من إدارة أكاديمية إتقان ومعلمتكِ المشرفة بمناسبة إتمام حفظ وتسميع آيات سورة البقرة المباركة مع إتقان أحكام التجويد والترتيل.',
                    iconType: 'trophy',
                    dateEarned: new Date().toISOString().split('T')[0],
                  })
                }
                className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                احتفل بإنجاز حفظ سورة 🎉
              </button>

              <button
                onClick={() => setIsClassroomOpen(true)}
                className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 border border-emerald-400/30"
              >
                <Video className="w-4 h-4 text-amber-300 animate-pulse" />
                دخول القاعة والحصة المباشرة 🎙️
              </button>
            </div>
          </div>

          {/* ISLAMIC PRAYER TIMES & RELIGIOUS EVENTS SIDEBAR */}
          <PrayerTimesIslamicEventsSidebar />

          {/* Progress Visualizer: Used vs Remaining Sessions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
            
            {/* Visual Ring Gauge */}
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-emerald-600 shadow-inner">
                <span className="font-black text-2xl text-emerald-800">{activeApprovedSub.remainingSessions}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-semibold">الحصص المتبقية</span>
                <span className="text-sm font-extrabold text-emerald-700">
                  {activeApprovedSub.remainingSessions} من {activeApprovedSub.totalSessions} حصة
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">صلاحية الباقة سارية</span>
              </div>
            </div>

            {/* Used Sessions */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block font-semibold">الحصص المستهلكة</span>
                <span className="text-xl font-bold text-slate-800">{activeApprovedSub.usedSessions} حصص</span>
              </div>
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            {/* Expire / Renewal status */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block font-semibold">تاريخ الانتهاء المتوقع</span>
                <span className="text-sm font-bold text-slate-800">{activeApprovedSub.expiryDate || 'سارية'}</span>
              </div>
              <button
                onClick={() => setShowSubscribeWizard(true)}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                تجديد الباقة
              </button>
            </div>

          </div>
        </div>
      ) : !pendingSub && (
        <div className="bg-slate-900 text-white rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <BookOpen className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-xl font-bold font-serif">لا يوجد باقة مفعّلة حالياً</h3>
          <p className="text-slate-300 text-xs max-w-md mx-auto">
            اختر الباقة المناسبة والمعلمة المختارة للاشتراك وتحويل الرسوم لبدء رحلة الحفظ والتدبر.
          </p>
          <button
            onClick={() => setShowSubscribeWizard(true)}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-lg"
          >
            عرض الباقات المتاحة والتسجيل
          </button>
        </div>
      )}

      {/* VISUAL KHATM MILESTONE JOURNEY PATH */}
      <KhatmJourneyPath />

      {/* OVERALL QURAN MEMORIZATION VISUAL PROGRESS BAR */}
      <QuranMemorizationProgressBar studentName={studentName} />

      {/* WEEKLY QURAN GOALS PLANNER & PROGRESS TRACKER */}
      <WeeklyGoalsPlanner />

      {/* INTERACTIVE DAILY MEMORIZATION PLAN & HABIT CALENDAR */}
      <InteractiveMemorizationCalendar studentName={studentName} />

      {/* DIGITAL BADGES SHOWCASE SYSTEM */}
      <DigitalBadgesShowcase studentName={studentName} />

      {/* GAMIFICATION POINTS & BADGES SHOWCASE */}
      <GamificationBadges sessions={mySessions} studentName={studentName} />

      {/* INTERACTIVE CALENDAR & REMINDERS */}
      <InteractiveSessionsCalendar userRole="student" userName={studentName} sessions={mySessions} />

      {/* DYNAMIC REORDERABLE DASHBOARD WIDGETS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-emerald-600" />
            تخصيص ترتيب المكونات (Drag and Drop / إعادة الترتيب) 🎛️
          </span>
          <span className="text-[10px] text-slate-500 font-bold">
            يمكنك استخدام أسهم الترتيب أو السحب لتخصيص واجهتك
          </span>
        </div>

        {widgetOrder.map((widgetId, index) => {
          let ComponentToRender = null;
          let widgetTitle = '';

          if (widgetId === 'live_scheduler') {
            ComponentToRender = <LiveSessionScheduler userRole="student" userName={studentName} />;
            widgetTitle = 'جدولة الحصص المباشرة واللقاء الافتراضي';
          } else if (widgetId === 'recharts_kpis') {
            ComponentToRender = <StudentKpiRechartsDashboard studentName={studentName} />;
            widgetTitle = 'لوحة مؤشرات الأداء (Recharts KPIs)';
          } else if (widgetId === 'khatm_planner') {
            ComponentToRender = <GroupKhatmPlanner userRole="student" userName={studentName} />;
            widgetTitle = 'مخطط الختمات الجماعية';
          } else if (widgetId === 'calligraphy') {
            ComponentToRender = <ArabicCalligraphyStudio />;
            widgetTitle = 'مختبر الخط العربي والتصميم';
          } else if (widgetId === 'analytics') {
            ComponentToRender = <PeriodicPerformanceAnalyticsDashboard userRole="student" userName={studentName} />;
            widgetTitle = 'التحليلات والتقارير الدورية';
          } else if (widgetId === 'quiz') {
            ComponentToRender = <SurahQuizModule studentName={studentName} />;
            widgetTitle = 'اختبارات السور والتجويد الذكية';
          } else if (widgetId === 'group_room') {
            ComponentToRender = <GroupStudyRoom userRole="student" userName={studentName} />;
            widgetTitle = 'غرفة القراءة الجماعية';
          } else if (widgetId === 'library') {
            ComponentToRender = <DigitalLibrary userRole="student" userName={studentName} />;
            widgetTitle = 'المكتبة الرقمية والموارد';
          } else if (widgetId === 'recitation') {
            ComponentToRender = <SmartVoiceRecitation studentName={studentName} />;
            widgetTitle = 'التسميع الصوتي والتعرف المباشر';
          } else if (widgetId === 'pomodoro') {
            ComponentToRender = <QuranPomodoroTimer studentName={studentName} />;
            widgetTitle = 'مؤقت الحفظ والتركيز';
          }

          return (
            <div
              key={widgetId}
              draggable
              onDragStart={() => setDraggedWidgetId(widgetId)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedWidgetId && draggedWidgetId !== widgetId) {
                  const fromIdx = widgetOrder.indexOf(draggedWidgetId);
                  const toIdx = widgetOrder.indexOf(widgetId);
                  const newOrder = [...widgetOrder];
                  newOrder.splice(fromIdx, 1);
                  newOrder.splice(toIdx, 0, draggedWidgetId);
                  setWidgetOrder(newOrder);
                  setDraggedWidgetId(null);
                }
              }}
              className="space-y-2 group transition-all"
            >
              {/* Widget Drag & Order Toolbar */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-2 px-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="cursor-grab text-slate-400 hover:text-emerald-600">
                    <GripVertical className="w-4 h-4" />
                  </span>
                  <span className="font-extrabold text-slate-700 dark:text-slate-300 font-serif text-[11px]">
                    #{index + 1} {widgetTitle}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveWidget(widgetId, 'up')}
                    disabled={index === 0}
                    className="p-1 bg-white dark:bg-slate-800 hover:bg-slate-100 disabled:opacity-30 rounded-lg border text-slate-700 dark:text-slate-300"
                    title="تحريك لأعلى"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveWidget(widgetId, 'down')}
                    disabled={index === widgetOrder.length - 1}
                    className="p-1 bg-white dark:bg-slate-800 hover:bg-slate-100 disabled:opacity-30 rounded-lg border text-slate-700 dark:text-slate-300"
                    title="تحريك لأسفل"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Rendered Widget */}
              <div>{ComponentToRender}</div>
            </div>
          );
        })}
      </div>

      {/* MONTHLY PERFORMANCE REPORT & PDF EXPORT */}
      <MonthlyPerformanceReport studentName={studentName} userRole="student" sessions={mySessions} />

      {/* Recent Evaluations & Homework Logs */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              سجل التقييمات والورد القادم من المعلمة
            </h3>
            <p className="text-xs text-slate-500">متابعة نتائج التسميع، التقييم بالنجوم، وملاحظات أحكام التجويد.</p>
          </div>
        </div>

        {mySessions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-2">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <p>لم يتم تسجيل حصص بعد. ستظهر تقارير المعلمة فور إتمام الحصة الأولى.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mySessions.map((ses) => (
              <div key={ses.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{ses.surahName}</span>
                    <span className="text-xs text-slate-500">(من آية {ses.fromAyah} إلى {ses.toAyah})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{ses.date}</span>
                    <span className="text-amber-500 font-bold text-sm">{'★'.repeat(ses.rating)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-500 block font-bold mb-1">ملاحظات التجويد والنطق:</span>
                    <p className="text-slate-800">{ses.tajweedNotes}</p>
                  </div>
                  <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/60">
                    <span className="text-emerald-900 block font-bold mb-1">الورد والواجب المطلوب:</span>
                    <p className="text-emerald-800 font-semibold">{ses.homework}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WIZARD MODAL FOR PACKAGE SUBSCRIPTION & WIRE TRANSFER RECEIPT */}
      {showSubscribeWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-emerald-100 animate-in zoom-in-95 duration-200">
            
            {/* Wizard Header Steps Bar */}
            <div className="flex items-center justify-between border-b pb-4 text-xs font-bold">
              <span className={wizardStep === 1 ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}>1. اختيار الباقة</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className={wizardStep === 2 ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}>2. اختيار المعلمة</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className={wizardStep === 3 ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}>3. التحويل البنكي</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className={wizardStep === 4 ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}>4. رفع الإيصال</span>
            </div>

            {/* STEP 1: PICK PACKAGE */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-lg">الخطوة 1: اختر باقة التحفيظ المناسبة</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 text-xs ${
                        selectedPkg?.id === pkg.id
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <h4 className="font-bold text-slate-900 text-sm">{pkg.name}</h4>
                      <p className="text-emerald-700 font-extrabold text-base">{pkg.price} {pkg.currency}</p>
                      <p className="text-slate-600">{pkg.sessionCount} حصص ({pkg.sessionDurationMinutes} دقيقة)</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl"
                  >
                    التالي: اختيار المعلمة
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CHOOSE TEACHER */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-lg">الخطوة 2: اختر المعلمة المفضلة لحلقتك</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-1">
                  {teachers
                    .filter((t) => t.status === 'approved')
                    .map((teacher) => (
                      <div
                        key={teacher.id}
                        onClick={() => setSelectedTeacher(teacher)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                          selectedTeacher?.id === teacher.id
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-md'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <img src={teacher.avatar} alt={teacher.name} className="w-12 h-12 rounded-xl object-cover" />
                        <div className="text-xs space-y-1">
                          <h4 className="font-bold text-slate-900">{teacher.name}</h4>
                          <p className="text-emerald-700 font-semibold">{teacher.qualifications.specialization}</p>
                          <p className="text-slate-500 text-[11px]">{teacher.availableTimes}</p>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs"
                  >
                    السابق
                  </button>
                  <button
                    onClick={() => setWizardStep(3)}
                    disabled={!selectedTeacher}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl disabled:opacity-50"
                  >
                    التالي: الحسابات البنكية
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: BANK DETAILS */}
            {wizardStep === 3 && (
              <div className="space-y-4 text-xs">
                <h3 className="font-bold text-slate-900 text-lg">الخطوة 3: حوّل رسوم الاشتراك للحساب الرسمي</h3>
                <p className="text-slate-600">
                  يرجى تحويل مبلغ <span className="font-bold text-emerald-700">{selectedPkg?.price} {selectedPkg?.currency}</span> لأحد الحسابات الرسمية التالية:
                </p>

                <div className="space-y-3">
                  {bankAccounts.map((acc, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{acc.bankName}</span>
                        <span className="text-slate-500 text-[11px]">{acc.accountName}</span>
                      </div>
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border font-mono">
                        <span className="text-slate-800 font-bold" dir="ltr">{acc.iban}</span>
                        <button
                          onClick={() => handleCopy(acc.iban)}
                          className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold rounded-lg flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedIban === acc.iban ? 'تم النسخ' : 'نسخ IBAN'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs"
                  >
                    السابق
                  </button>
                  <button
                    onClick={() => setWizardStep(4)}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl"
                  >
                    التالي: رفع صورة الإيصال
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: UPLOAD RECEIPT IMAGE */}
            {wizardStep === 4 && (
              <div className="space-y-4 text-xs">
                <h3 className="font-bold text-slate-900 text-lg">الخطوة 4: ارفع صورة إيصال التحويل البنكي</h3>

                <div className="space-y-3">
                  <label className="block font-bold text-slate-700">اختر صورة الإيصال أو حوّل لقطة الشاشة</label>
                  
                  <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 text-center bg-slate-50 space-y-3">
                    {receiptImage ? (
                      <div className="space-y-2">
                        <img src={receiptImage} alt="إيصال التحويل" className="max-h-40 mx-auto rounded-xl object-contain border" />
                        <span className="text-[11px] text-emerald-700 font-bold block">تم اختيار صورة الإيصال جاهزة للرفع</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
                        <p className="text-slate-500">انقر هنا لاختيار الصورة من جهازك</p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                      id="receiptInput"
                    />
                    <label
                      htmlFor="receiptInput"
                      className="inline-block px-4 py-2 bg-emerald-100 text-emerald-800 font-bold rounded-xl cursor-pointer hover:bg-emerald-200"
                    >
                      تغيير الصورة
                    </label>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <button
                    onClick={() => setWizardStep(3)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs"
                  >
                    السابق
                  </button>
                  <button
                    onClick={handleFinalSubmitSubscription}
                    className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-lg"
                  >
                    تأكيد وإرسال الإيصال للإدارة
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-center border-t pt-2">
              <button
                onClick={() => setShowSubscribeWizard(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                إلغاء الأمر
              </button>
            </div>

          </div>
        </div>
      )}

      {/* QUICK REVIEW MODE MODAL */}
      <QuickReviewMode
        isOpen={isQuickReviewOpen}
        onClose={() => setIsQuickReviewOpen(false)}
      />

      {/* LIVE TEACHER DIRECT TOAST POPUP NOTIFICATION */}
      <StudentNotificationToastPopup studentName={studentName} />

      {/* ACHIEVEMENT CELEBRATION MODAL WITH CONFETTI */}
      <AchievementCelebrationModal
        isOpen={!!activeCelebration}
        onClose={() => setActiveCelebration(null)}
        achievement={activeCelebration}
        studentName={studentName}
      />

      {/* QURAN FOCUS SESSION MODE MODAL */}
      <QuranFocusSessionMode
        isOpen={showFocusMode}
        onClose={() => setShowFocusMode(false)}
        studentName={studentName}
      />

      {/* NOTIFICATION PREFERENCES MODAL */}
      <NotificationPreferencesModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        studentName={studentName}
      />

      {/* LIVE IN-APP QURAN CLASSROOM MODAL */}
      <LiveQuranClassroomModal
        isOpen={isClassroomOpen}
        onClose={() => setIsClassroomOpen(false)}
        teacherName={activeApprovedSub?.teacherName || 'المعلمة المعتمدة'}
        studentName={studentName}
      />

    </div>
  );
};
