import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Users,
  Calendar,
  Star,
  Video,
  CheckCircle2,
  Clock,
  PlusCircle,
  Award,
  BookOpen,
  Search,
  Phone,
  Sparkles,
  Link,
  Copy,
  ExternalLink,
  Check,
  UserCheck,
  FileText,
  AlertCircle,
  Play,
  User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TeacherProfile, Subscription, SessionRecord } from '../../types';
import { ALL_SURAHS } from '../../data/quranData';
import { InteractiveSessionsCalendar } from '../calendar/InteractiveSessionsCalendar';
import { BroadcastAnnouncementBanner } from '../common/BroadcastAnnouncementBanner';
import { DigitalLibrary } from '../library/DigitalLibrary';
import { TeacherNotificationSender } from '../notifications/TeacherNotificationSender';
import { AudioAnalyticsModule } from './AudioAnalyticsModule';
import { ArchivedStudyCircles } from './ArchivedStudyCircles';
import { GroupKhatmPlanner } from '../khatm/GroupKhatmPlanner';
import { PeriodicPerformanceAnalyticsDashboard } from '../analytics/PeriodicPerformanceAnalyticsDashboard';
import { LiveSessionScheduler } from '../video/LiveSessionScheduler';
import { PerformanceInsights } from './PerformanceInsights';
import { LiveQuranClassroomModal } from '../classroom/LiveQuranClassroomModal';

export const TeacherDashboard: React.FC = () => {
  const {
    updateMyZoomLink,
    currentUser,
    teachers,
    submitTeacherApplication,
    subscriptions,
    sessions,
    recordSession,
  } = useApp();

  // Active Teacher Navigation Tab
  const [activeTeacherTab, setActiveTeacherTab] = useState<'logger' | 'students' | 'schedule' | 'library' | 'history' | 'archive'>('logger');

  // Find corresponding teacher profile in database
  // ملف المعلمة الحالية (من قاعدة البيانات) — لو لسه ما اتحمّل نبني ملف مبدئي من الحساب
  const activeTeacher: TeacherProfile =
    teachers.find((t) => t.id === currentUser.id) ||
    ({
      ...currentUser,
      role: 'teacher',
      status: 'pending',
      applicationSubmitted: false,
      qualifications: { ijazat: [], memorizationParts: 0, experienceYears: 0, specialization: '', bio: '' },
      availableDays: [],
      availableTimes: '',
      rating: 5,
      studentCount: 0,
    } as TeacherProfile);

  // Teacher Join Application form state (if applicant)
  const needsApplication = !activeTeacher.applicationSubmitted || activeTeacher.status === 'rejected';
  const [showAppForm, setShowAppForm] = useState(needsApplication);
  useEffect(() => setShowAppForm(needsApplication), [needsApplication]);
  const [applicantName, setApplicantName] = useState(currentUser.name || '');
  const [applicantPhone, setApplicantPhone] = useState(currentUser.phone || '');
  const [applicantEmail, setApplicantEmail] = useState(currentUser.email || '');
  const [appSubmitting, setAppSubmitting] = useState(false);
  const [applicantIjazat, setApplicantIjazat] = useState('');
  const [applicantParts, setApplicantParts] = useState(30);
  const [applicantExpYears, setApplicantExpYears] = useState(5);
  const [applicantSpec, setApplicantSpec] = useState('حفظ ومراجعة وتجويد للكبار والأطفال');
  const [applicantBio, setApplicantBio] = useState('');
  const [applicantTimes, setApplicantTimes] = useState('4:00 مساءً - 8:00 مساءً');
  const [submittedMsg, setSubmittedMsg] = useState('');

  // Session recording state
  const [selectedSubId, setSelectedSubId] = useState('');
  const [surahName, setSurahName] = useState('سورة البقرة');
  const [fromAyah, setFromAyah] = useState(1);
  const [toAyah, setToAyah] = useState(25);
  const [rating, setRating] = useState(5);
  const [attendance, setAttendance] = useState<'present' | 'absent_excused' | 'absent_unexcused'>('present');
  const [tajweedNotes, setTajweedNotes] = useState('');
  const [homework, setHomework] = useState('');
  const [recordSuccessMsg, setRecordSuccessMsg] = useState('');

  // Meeting Link state
  const [zoomUrl, setZoomUrl] = useState(activeTeacher?.zoomLink || '');
  const [savingZoom, setSavingZoom] = useState(false);
  const savedZoom = activeTeacher?.zoomLink || '';
  const zoomDirty = zoomUrl.trim() !== savedZoom;
  // لما بيانات المعلم توصل من السيرفر (أو تتحدث) نعرض الرابط المحفوظ
  useEffect(() => {
    setZoomUrl(savedZoom);
  }, [savedZoom]);
  const handleSaveMeetingLink = async () => {
    const link = zoomUrl.trim();
    if (link && !/^https:\/\//i.test(link)) {
      setSavedMeetingMsg('الرابط لازم يبدأ بـ https://');
      return;
    }
    setSavingZoom(true);
    try {
      await updateMyZoomLink(link);
      setSavedMeetingMsg(link ? 'اتحفظ الرابط — طلابك المعتمدين بيشوفوه في لوحتهم' : 'اتمسح الرابط');
    } catch {
      /* الرسالة بتظهر من النظام */
    } finally {
      setSavingZoom(false);
      setTimeout(() => setSavedMeetingMsg(''), 3500);
    }
  };
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedMeetingMsg, setSavedMeetingMsg] = useState('');
  const [isClassroomOpen, setIsClassroomOpen] = useState(false);

  // Search & Filter in Student Roster
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Subscription | null>(null);

  // Filter subscriptions assigned to this teacher with approved status
  const mySubscriptions = subscriptions.filter(
    (s) => (s.teacherId === activeTeacher?.id || s.teacherName === activeTeacher?.name) && s.paymentStatus === 'approved'
  );

  // Filter sessions logged by this teacher
  const mySessions = sessions.filter((ses) => ses.teacherId === activeTeacher?.id || ses.teacherName === activeTeacher?.name);

  const handleSubmitApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (appSubmitting) return;
    const ijazatArray = applicantIjazat.split('\n').filter((i) => i.trim() !== '');
    setAppSubmitting(true);
    try {
    await submitTeacherApplication({
      name: applicantName,
      email: applicantEmail,
      phone: applicantPhone,
      qualifications: {
        ijazat: ijazatArray.length > 0 ? ijazatArray : ['إجازة في حفظ وتجويد القرآن الكريم'],
        memorizationParts: Number(applicantParts),
        experienceYears: Number(applicantExpYears),
        specialization: applicantSpec,
        bio: applicantBio,
      },
      availableDays: ['الأحد', 'الثلاثاء', 'الخميس'],
      availableTimes: applicantTimes,
    });

    setSubmittedMsg('تم تقديم طلب الانضمام بنجاح! الطلب الآن قيد المراجعة والموافقة من الإدارة.');
    setShowAppForm(false);
    } catch {
      /* الرسالة بتظهر من النظام */
    } finally {
      setAppSubmitting(false);
    }
  };

  const handleRecordSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetSub = mySubscriptions.find((s) => s.id === selectedSubId);
    if (!targetSub) {
      alert('يرجى اختيار الطالب المخصص للحصة أولاً.');
      return;
    }

    if (targetSub.remainingSessions <= 0 && attendance === 'present') {
      alert('تنبيه: الطالب استهلك كافة حصص الباقة الحالية. يرجى إبلاغه بتجديد الاشتراك.');
      return;
    }

    try {
    await recordSession({
      subscriptionId: targetSub.id,
      studentId: targetSub.studentId,
      studentName: targetSub.studentName,
      teacherId: activeTeacher.id,
      teacherName: activeTeacher.name,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      surahName,
      fromAyah: Number(fromAyah),
      toAyah: Number(toAyah),
      rating,
      tajweedNotes,
      homework,
      attendance,
    });

    const newRemaining = Math.max(0, targetSub.remainingSessions - 1);
    setRecordSuccessMsg(
      `تم توثيق الحصة بنجاح للطالب (${targetSub.studentName})! وتم خصم حصة واحدة من رصيده (المتبقي: ${newRemaining} حصة).`
    );
    setTajweedNotes('');
    setHomework('');
    setTimeout(() => setRecordSuccessMsg(''), 5000);
    } catch {
      /* الرسالة بتظهر من النظام */
    }
  };

  const handleCopyMeetingLink = () => {
    navigator.clipboard.writeText(zoomUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // IF TEACHER IS PENDING / NOT APPROVED
  if (activeTeacher.status === 'pending' && activeTeacher.applicationSubmitted && !showAppForm) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-center py-12 animate-in fade-in">
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-8 space-y-4 shadow-lg">
          <div className="w-16 h-16 bg-amber-500/20 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-2xl font-extrabold text-amber-900 font-serif">
            طلب الانضمام قيد المراجعة والتدقيق
          </h2>
          <p className="text-slate-700 text-sm max-w-lg mx-auto leading-relaxed">
            أهلاً بكِ أستاذة <span className="font-bold">{activeTeacher.name}</span> في أكاديمية إتقان. تم استلام مؤهلاتكِ وإجازاتكِ القرآنية، وهي الآن قيد المراجعة المباشرة من قبل إدارة الأكاديمية.
          </p>
          <div className="bg-white p-4 rounded-xl border border-amber-200 text-right text-xs space-y-2 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-slate-500">حالة الطلب:</span>
              <span className="font-bold text-amber-700">بانتظار موافقة المشرفة العامة</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">التخصص والمؤهل:</span>
              <span className="font-semibold text-slate-800">{activeTeacher.qualifications.specialization}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // IF NO TEACHER PROFILE OR REJECTED -> SHOW JOIN APPLICATION FORM
  if (showAppForm) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-8 shadow-xl text-center space-y-3">
          <GraduationCap className="w-12 h-12 text-amber-300 mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">
            الانضمام لكادر معلمات أكاديمية إتقان
          </h2>
          <p className="text-emerald-100/90 text-sm max-w-xl mx-auto">
            قدّمي بياناتكِ وإجازاتكِ في تحفيظ وتجويد القرآن الكريم للانضمام للحلقات والبدء بتدريس الطلاب.
          </p>
        </div>

        {activeTeacher.status === 'rejected' && (
          <div className="p-4 bg-rose-50 text-rose-900 text-sm rounded-2xl border border-rose-200">
            <p className="font-bold">تمت مراجعة طلبكِ السابق ولم يُعتمد.</p>
            {activeTeacher.rejectionReason && <p className="mt-1">السبب: {activeTeacher.rejectionReason}</p>}
            <p className="mt-1 text-xs">يمكنكِ تعديل البيانات وإعادة التقديم.</p>
          </div>
        )}

        {submittedMsg && (
          <div className="p-4 bg-emerald-100 text-emerald-900 font-bold text-sm rounded-2xl border border-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            {submittedMsg}
          </div>
        )}

        {/* Application Form */}
        <form onSubmit={handleSubmitApp} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <h3 className="font-bold text-slate-900 text-lg border-b pb-3">البيانات الشخصية والمهنية</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الاسم الثلاثي مع اللقب</label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="أ. نورة صالح العتيبي"
                className="w-full p-3 border rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">رقم الجوال (الواتساب)</label>
              <input
                type="text"
                required
                value={applicantPhone}
                readOnly
                title="رقم الحساب — ما بيتغيّر"
                className="w-full p-3 border rounded-xl bg-slate-50 text-slate-500"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={applicantEmail}
                onChange={(e) => setApplicantEmail(e.target.value)}
                placeholder="noura@gmail.com"
                className="w-full p-3 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">المواعيد المتاحة للتسميع</label>
              <input
                type="text"
                value={applicantTimes}
                onChange={(e) => setApplicantTimes(e.target.value)}
                placeholder="من 4:00 م إلى 8:00 م"
                className="w-full p-3 border rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2">المؤهلات والإجازات القرآنية</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">مقدار حفظ القرآن الكريم</label>
                <select
                  value={applicantParts}
                  onChange={(e) => setApplicantParts(Number(e.target.value))}
                  className="w-full p-3 border rounded-xl font-bold"
                >
                  <option value={30}>خاتمة - 30 جزءاً كاملة</option>
                  <option value={20}>20 جزءاً</option>
                  <option value={15}>15 جزءاً</option>
                  <option value={10}>10 أجزاء</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">سنوات الخبرة في التحفيظ</label>
                <input
                  type="number"
                  min={1}
                  value={applicantExpYears}
                  onChange={(e) => setApplicantExpYears(Number(e.target.value))}
                  className="w-full p-3 border rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="text-xs space-y-1">
              <label className="block font-bold text-slate-700">الإجازات والمسانيد (كل إجازة في سطر)</label>
              <textarea
                rows={3}
                required
                value={applicantIjazat}
                onChange={(e) => setApplicantIjazat(e.target.value)}
                placeholder="مثال: إجازة برواية حفص عن عاصم من طريق الشاطبية&#10;إجازة في تحفيظ الأطفال والقاعدة النورانية"
                className="w-full p-3 border rounded-xl font-sans"
              />
            </div>

            <div className="text-xs space-y-1">
              <label className="block font-bold text-slate-700">نبذة تعريفية وسيرة ذاتية مختصرة</label>
              <textarea
                rows={3}
                value={applicantBio}
                onChange={(e) => setApplicantBio(e.target.value)}
                placeholder="اكتبي نبذة عن أسلوبك في التدريس والمراكز القرآنية التي عملتِ بها سابقا..."
                className="w-full p-3 border rounded-xl font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={appSubmitting}
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-sm rounded-2xl shadow-lg transition-all"
          >
            {appSubmitting ? 'جاري الإرسال...' : 'تقديم طلب الانضمام للأكاديمية'}
          </button>
        </form>
      </div>
    );
  }

  // ACTIVE & APPROVED TEACHER WORKSPACE
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Broadcast Announcement Banner */}
      <BroadcastAnnouncementBanner />
      
      {/* Teacher Workspace Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={activeTeacher.avatar}
              alt={activeTeacher.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-300 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-700/80 text-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  معلمة معتمدة
                </span>
                <span className="text-amber-300 text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  {activeTeacher.rating} (ممتاز)
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif mt-1">{activeTeacher.name}</h2>
              <p className="text-emerald-100/80 text-xs mt-1">{activeTeacher.qualifications.specialization}</p>
            </div>
          </div>

          {/* Meeting Link Quick Box */}
          <div className="bg-emerald-900/80 p-4 rounded-2xl border border-emerald-600/60 max-w-sm w-full space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-200 font-bold flex items-center gap-1.5">
                <Video className="w-4 h-4 text-amber-400" />
                القاعة القرآنية المباشرة:
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                مباشر مدمج 🟢
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsClassroomOpen(true)}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95"
              >
                <Video className="w-4 h-4 text-slate-950 animate-pulse" />
                <span>دخول القاعة المباشرة (تسميع وتجويد) 🎙️</span>
              </button>

              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="url"
                  value={zoomUrl}
                  onChange={(e) => setZoomUrl(e.target.value)}
                  placeholder="الصق رابط Zoom أو Google Meet هنا..."
                  data-zoom-input
                  className="w-full bg-emerald-950 text-white text-[11px] p-2 rounded-xl border border-emerald-700 focus:outline-none"
                  dir="ltr"
                />
                <button
                  onClick={handleCopyMeetingLink}
                  className="px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold text-xs rounded-xl shrink-0 flex items-center gap-1 border border-emerald-600"
                  title="نسخ الرابط"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'تم' : 'نسخ'}
                </button>
                <button
                  onClick={handleSaveMeetingLink}
                  disabled={savingZoom || !zoomDirty}
                  data-zoom-save
                  className="px-3 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl shrink-0"
                >
                  {savingZoom ? '...' : 'حفظ'}
                </button>
              </div>
              {savedMeetingMsg && <p className="text-[11px] text-amber-200 font-bold">{savedMeetingMsg}</p>}
            </div>
          </div>
        </div>

        {/* Metric counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-emerald-700/60">
          <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-700/40">
            <span className="text-emerald-200/80 text-xs block">الطلاب المخصصون لي</span>
            <span className="text-2xl font-bold text-amber-300">{mySubscriptions.length} طلاب</span>
          </div>
          <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-700/40">
            <span className="text-emerald-200/80 text-xs block">الحصص المنجزة كلياً</span>
            <span className="text-2xl font-bold text-white">{mySessions.length} حصة</span>
          </div>
          <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-700/40 col-span-2 sm:col-span-1">
            <span className="text-emerald-200/80 text-xs block">الأوقات المتاحة</span>
            <span className="text-xs font-bold text-emerald-200">{activeTeacher.availableTimes}</span>
          </div>
        </div>
      </div>

      {/* Teacher Workspace Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-sm font-bold">
        <button
          onClick={() => setActiveTeacherTab('logger')}
          className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTeacherTab === 'logger'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl font-extrabold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          تسجيل وتقييم الحفظ اليومي
        </button>

        <button
          onClick={() => setActiveTeacherTab('students')}
          className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTeacherTab === 'students'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl font-extrabold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          قائمة الطلاب وأرصدة الحصص ({mySubscriptions.length})
        </button>

        <button
          onClick={() => setActiveTeacherTab('schedule')}
          className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTeacherTab === 'schedule'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl font-extrabold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-500" />
          جدولة الحصص والقاعة المباشرة
        </button>

        <button
          onClick={() => setActiveTeacherTab('library')}
          className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTeacherTab === 'library'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl font-extrabold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-500" />
          المكتبة الرقمية والمواد الإثرائية
        </button>

        <button
          onClick={() => setActiveTeacherTab('history')}
          className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTeacherTab === 'history'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl font-extrabold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-teal-600" />
          سجل التقييمات والتقارير ({mySessions.length})
        </button>

        <button
          onClick={() => setActiveTeacherTab('archive')}
          className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTeacherTab === 'archive'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl font-extrabold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-500" />
          أرشيف الحلقات المكتملة 📁
        </button>
      </div>

      {/* DIRECT TEACHER NOTIFICATION & ENCOURAGEMENT SENDER */}
      <TeacherNotificationSender teacherName={activeTeacher.name} />

      {/* TAB 1: DAILY MEMORIZATION EVALUATION & LOG FORM */}
      {activeTeacherTab === 'logger' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Assessment Form (8 cols) */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">نموذج تسجيل وتقييم الحفظ والتسميع اليومي</h3>
                <p className="text-xs text-slate-500">
                  قم بتسجيل تفاصيل التسميع، التقييم بالنجوم، وملاحظات التجويد. يتم خصم حصة واحدة تلقائياً من رصيد الطالب.
                </p>
              </div>
            </div>

            {recordSuccessMsg && (
              <div className="p-4 bg-emerald-50 text-emerald-900 font-bold text-xs rounded-2xl border border-emerald-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                {recordSuccessMsg}
              </div>
            )}

            <form onSubmit={handleRecordSessionSubmit} className="space-y-5 text-xs">
              <div>
                <label className="block font-extrabold text-slate-800 mb-1.5">اختر الطالب / الباقة المفعّلة</label>
                <select
                  required
                  value={selectedSubId}
                  onChange={(e) => setSelectedSubId(e.target.value)}
                  className="w-full p-3.5 border rounded-2xl font-bold bg-slate-50 focus:bg-white text-sm"
                >
                  <option value="">-- اضغط لاختيار الطالب من القائمة --</option>
                  {mySubscriptions.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.studentName} | {sub.packageName} (رصيد الحصص المتبقي: {sub.remainingSessions} من {sub.totalSessions})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">السورة المسمعة</label>
                  <select
                    value={surahName}
                    onChange={(e) => setSurahName(e.target.value)}
                    className="w-full p-3 border rounded-xl font-bold bg-white"
                  >
                    {ALL_SURAHS.map((surah) => (
                      <option key={surah.number} value={`سورة ${surah.name}`}>
                        {surah.number}. سورة {surah.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">من الآية</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={fromAyah}
                    onChange={(e) => setFromAyah(Number(e.target.value))}
                    className="w-full p-3 border rounded-xl font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">إلى الآية</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={toAyah}
                    onChange={(e) => setToAyah(Number(e.target.value))}
                    className="w-full p-3 border rounded-xl font-bold bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">حالة الحضور والالتزام</label>
                  <select
                    value={attendance}
                    onChange={(e) => setAttendance(e.target.value as any)}
                    className="w-full p-3 border rounded-xl font-bold bg-white"
                  >
                    <option value="present">حاضر (تم التسميع)</option>
                    <option value="absent_excused">غائب بعذر مقبول</option>
                    <option value="absent_unexcused">غائب بدون عذر</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تقييم جودة التسميع</label>
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-amber-400 hover:scale-125 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                      {rating === 5 ? 'ممتاز مع إتقان' : rating === 4 ? 'جيد جداً' : rating === 3 ? 'جيد' : 'يحتاج مراجعة'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات التجويد ومخارج الحروف (تظهر للطالب وولي الأمر)</label>
                <textarea
                  rows={3}
                  value={tajweedNotes}
                  onChange={(e) => setTajweedNotes(e.target.value)}
                  placeholder="مثال: أداء ممتاز في الإدغام بغنة وقلقلة القاف، يرجى مراعاة مقادير المد المنفصل وتخفيف الهمز..."
                  className="w-full p-3 border rounded-xl font-sans"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الورد المطلـوب والواجب للحصة القادمة</label>
                <input
                  type="text"
                  required
                  value={homework}
                  onChange={(e) => setHomework(e.target.value)}
                  placeholder="مثال: حفظ سورة آل عمران من آية 1 إلى 20 مع تثبيت سورة البقرة"
                  className="w-full p-3 border rounded-xl font-bold bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                تأكيد وتوثيق الحصة وخصم 1 حصة من رصيد الطالب
              </button>
            </form>
          </div>

          {/* Quick Roster Side Widget (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b pb-3">
                <Users className="w-5 h-5 text-emerald-700" />
                اختيار سريع للطلاب
              </h3>

              <div className="space-y-3">
                {mySubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubId(sub.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                      selectedSubId === sub.id
                        ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs">{sub.studentName}</h4>
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                        {sub.packageName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>الرصيد المتبقي:</span>
                      <span className="font-extrabold text-emerald-700">{sub.remainingSessions} من {sub.totalSessions} حصص</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: MY ASSIGNED STUDENTS ROSTER */}
      {activeTeacherTab === 'students' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                قوائم الطلاب المخصصين لحلقتكِ
              </h3>
              <p className="text-xs text-slate-500">متابعة تفاصيل اشتراكات الطلاب، أرصدة الحصص المتبقية، وسجل التقييمات.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                placeholder="بحث باسم الطالب..."
                className="w-full pr-9 pl-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mySubscriptions
              .filter((sub) => sub.studentName.toLowerCase().includes(studentSearchQuery.toLowerCase()))
              .map((sub) => {
                const percentUsed = Math.min(100, Math.round((sub.usedSessions / sub.totalSessions) * 100));

                return (
                  <div
                    key={sub.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between hover:border-emerald-300 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between border-b pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-base">{sub.studentName}</h4>
                            <p className="text-xs text-slate-500" dir="ltr">{sub.studentPhone}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-500">الباقة المسجل بها:</span>
                          <span className="font-bold text-slate-800">{sub.packageName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">إجمالي الحصص:</span>
                          <span className="font-bold text-slate-800">{sub.totalSessions} حصة</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span className="text-slate-500">رصيد الحصص المتبقية:</span>
                          <span className={sub.remainingSessions <= 2 ? 'text-rose-600' : 'text-emerald-700'}>
                            {sub.remainingSessions} حصة متبقية
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>نسبة الاستهلاك:</span>
                            <span>{percentUsed}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full transition-all"
                              style={{ width: `${percentUsed}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedSubId(sub.id);
                          setActiveTeacherTab('logger');
                        }}
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <PlusCircle className="w-4 h-4" />
                        تسجيل حصة تسميع جديدة
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE CLASS SCHEDULER & MEETING ROOM */}
      {activeTeacherTab === 'schedule' && (
        <div className="space-y-6">
          
          {/* INTERACTIVE SESSIONS CALENDAR & 15m REMINDERS */}
          <InteractiveSessionsCalendar userRole="teacher" userName={activeTeacher.name} sessions={mySessions} />

          {/* مواعيد الحصص القادمة (حقيقية) */}
          <LiveSessionScheduler userRole="teacher" userName={activeTeacher.name} />

          {/* Live Meeting Room Management Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Video className="w-5 h-5 text-emerald-700" />
                  قاعة التدريس المباشرة (Zoom / Google Meet)
                </h3>
                <p className="text-xs text-slate-500">شاركِ رابط القاعة مع طلابك للانضمام للحصة التفاعلية المباشرة.</p>
              </div>

              <a
                href={savedZoom || undefined}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
                فتح القاعة المباشرة الآن
              </a>
            </div>

            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="font-bold text-emerald-950">رابط القاعة الحالي:</span>
              <span className="font-mono bg-white px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-800 font-bold" dir="ltr">
                {savedZoom || 'لسه ما حفظت رابط — أضفه وأضغط «حفظ» في أعلى اللوحة'}
              </span>
              <button
                onClick={handleCopyMeetingLink}
                className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 shrink-0"
              >
                {copiedLink ? 'تم النسخ' : 'نسخ الرابط'}
              </button>
            </div>
          </div>

          {/* Upcoming Sessions Calendar Roster */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b pb-3">
              <Calendar className="w-5 h-5 text-amber-500" />
              جدول الحصص واللقاءات اليومية المتاحة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {mySubscriptions.map((sub, idx) => (
                <div key={sub.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                      حصة تفاعلية
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm">{sub.studentName}</h4>
                    <p className="text-slate-500 text-[11px]">الباقة: {sub.packageName}</p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSubId(sub.id);
                      setActiveTeacherTab('logger');
                    }}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shrink-0"
                  >
                    بدء التسميع
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB: DIGITAL LIBRARY */}
      {activeTeacherTab === 'library' && (
        <DigitalLibrary userRole="teacher" userName={activeTeacher.name} />
      )}

      {/* TAB 4: COMPREHENSIVE ASSESSMENT HISTORY LOGS */}
      {activeTeacherTab === 'history' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                سجل التقييمات وتقارير أداء الطلاب
              </h3>
              <p className="text-xs text-slate-500">استعراض وتتبع كل الحصص والواجبات المسجلة للطلاب سابقاً.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                placeholder="بحث باسم الطالب..."
                className="w-full pr-9 pl-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">اسم الطالب</th>
                  <th className="p-3">السورة والمقرر</th>
                  <th className="p-3">التقييم</th>
                  <th className="p-3">ملاحظات التجويد والنطق</th>
                  <th className="p-3">الورد القادم المطلوب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mySessions
                  .filter((s) => s.studentName.toLowerCase().includes(historySearchQuery.toLowerCase()))
                  .map((ses) => (
                    <tr key={ses.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-semibold text-slate-600">{ses.date}</td>
                      <td className="p-3 font-extrabold text-slate-900">{ses.studentName}</td>
                      <td className="p-3 text-slate-800 font-bold">
                        {ses.surahName} (آية {ses.fromAyah} - {ses.toAyah})
                      </td>
                      <td className="p-3 text-amber-500 font-bold">
                        {'★'.repeat(ses.rating)}
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs">{ses.tajweedNotes}</td>
                      <td className="p-3 text-emerald-800 font-bold">{ses.homework}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: ARCHIVED STUDY CIRCLES & COMPREHENSIVE FINAL REPORTS */}
      {activeTeacherTab === 'archive' && <ArchivedStudyCircles />}

      {/* TEACHER PERFORMANCE INSIGHTS & AI RECOMMENDATIONS MODULE */}
      <PerformanceInsights teacherName={activeTeacher.name} />

      {/* TEACHER AI AUDIO RECITATION ANALYTICS MODULE */}
      <AudioAnalyticsModule teacherName={activeTeacher.name} />

      {/* GROUP KHATM PLANNER & JUZ DISTRIBUTION */}
      <GroupKhatmPlanner userRole="teacher" userName={activeTeacher.name} />

      {/* PERIODIC PERFORMANCE ANALYTICS DASHBOARD */}
      <PeriodicPerformanceAnalyticsDashboard userRole="teacher" userName={activeTeacher.name} />

      {/* LIVE IN-APP QURAN CLASSROOM MODAL */}
      <LiveQuranClassroomModal
        isOpen={isClassroomOpen}
        onClose={() => setIsClassroomOpen(false)}
        teacherName={activeTeacher.name}
        studentName={mySubscriptions[0]?.studentName || 'الطالب'}
      />

    </div>
  );
};
