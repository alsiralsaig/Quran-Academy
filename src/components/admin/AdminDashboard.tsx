import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  CreditCard,
  Package as PackageIcon,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  RefreshCw,
  Search,
  BookOpenCheck,
  Calendar,
  Building2,
  Play,
  Pause,
  Award,
  Check,
  X,
  AlertTriangle,
  Phone,
  Mail,
  DollarSign,
  FileText,
  Clock,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { UsersManager } from './UsersManager';
import { useApp } from '../../context/AppContext';
import { Package, Subscription, BankAccount, TeacherProfile } from '../../types';
import { ReceiptViewerModal } from '../common/ReceiptViewerModal';
import { AcademyAnalytics } from './AcademyAnalytics';
import { AdminNotificationCenter } from './AdminNotificationCenter';
import { CloudBackupManager } from './CloudBackupManager';
import { BroadcastAnnouncementBanner } from '../common/BroadcastAnnouncementBanner';

export const AdminDashboard: React.FC = () => {
  const {
    teachers,
    approveTeacher,
    rejectTeacher,
    packages,
    addPackage,
    updatePackage,
    deletePackage,
    bankAccounts,
    updateBankAccounts,
    subscriptions,
    approveSubscription,
    rejectSubscription,
    addSessionsToSubscription,
    sessions,
    exportData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'payments' | 'teachers' | 'analytics' | 'packages' | 'sessions' | 'settings'>('payments');
  const [selectedSubForReceipt, setSelectedSubForReceipt] = useState<Subscription | null>(null);
  const [selectedTeacherForReview, setSelectedTeacherForReview] = useState<TeacherProfile | null>(null);
  
  // Custom Toast notification state
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Audio sample player state for candidate teachers
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const toggleAudioSample = (url: string) => {
    if (playingAudioUrl === url && audioElement) {
      audioElement.pause();
      setPlayingAudioUrl(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    const newAudio = new Audio(url);
    newAudio.play().catch(() => showToast('تعذر تشغيل العينة الصوتية في الوقت الحالي', 'error'));
    setAudioElement(newAudio);
    setPlayingAudioUrl(url);

    newAudio.onended = () => {
      setPlayingAudioUrl(null);
    };
  };

  // Package form state
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);
  const [pkgName, setPkgName] = useState('');
  const [pkgSessions, setPkgSessions] = useState(8);
  const [pkgDuration, setPkgDuration] = useState(45);
  const [pkgPrice, setPkgPrice] = useState(300);
  const [pkgDesc, setPkgDesc] = useState('');
  const [pkgFeatureText, setPkgFeatureText] = useState('');

  // Bank accounts edit state
  const [editingBanks, setEditingBanks] = useState<BankAccount[]>(bankAccounts);
  const [bankMsg, setBankMsg] = useState('');

  // Teacher Filter
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherStatusFilter, setTeacherStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Subscriptions Filter
  const [subStatusFilter, setSubStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Hourly Rate input state for teacher approval
  const [customHourlyRate, setCustomHourlyRate] = useState<number>(120);
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('');
  const [showRejectBox, setShowRejectBox] = useState<boolean>(false);

  // Stats calculation
  const pendingTeachers = teachers.filter((t) => t.status === 'pending');
  const approvedTeachers = teachers.filter((t) => t.status === 'approved');
  const pendingPayments = subscriptions.filter((s) => s.paymentStatus === 'pending');
  const totalRevenue = subscriptions
    .filter((s) => s.paymentStatus === 'approved')
    .reduce((sum, s) => sum + s.amountPaid, 0);
  const totalSessionsCompleted = sessions.length;

  const handleOpenPkgModal = (pkg?: Package) => {
    if (pkg) {
      setEditingPkg(pkg);
      setPkgName(pkg.name);
      setPkgSessions(pkg.sessionCount);
      setPkgDuration(pkg.sessionDurationMinutes);
      setPkgPrice(pkg.price);
      setPkgDesc(pkg.description);
      setPkgFeatureText(pkg.features.join('\n'));
    } else {
      setEditingPkg(null);
      setPkgName('');
      setPkgSessions(8);
      setPkgDuration(45);
      setPkgPrice(300);
      setPkgDesc('');
      setPkgFeatureText('حصص فردية مباشر\nمتابعة التجويد\nتقرير أسبوعي');
    }
    setShowPkgModal(true);
  };

  const handleSavePkg = (e: React.FormEvent) => {
    e.preventDefault();
    const featuresArr = pkgFeatureText.split('\n').filter((f) => f.trim() !== '');

    if (editingPkg) {
      updatePackage({
        ...editingPkg,
        name: pkgName,
        sessionCount: Number(pkgSessions),
        sessionDurationMinutes: Number(pkgDuration),
        price: Number(pkgPrice),
        description: pkgDesc,
        features: featuresArr,
      });
      showToast('تم تعديل بيانات الباقة بنجاح!');
    } else {
      addPackage({
        name: pkgName,
        sessionCount: Number(pkgSessions),
        sessionDurationMinutes: Number(pkgDuration),
        price: Number(pkgPrice),
        currency: 'ريال سعودي',
        description: pkgDesc,
        features: featuresArr,
      });
      showToast('تمت إضافة الباقة الجديدة بنجاح!');
    }
    setShowPkgModal(false);
  };

  const handleSaveBankAccounts = () => {
    updateBankAccounts(editingBanks);
    setBankMsg('تم حفظ بيانات الحسابات البنكية بنجاح');
    showToast('تم تحديث بيانات الحسابات البنكية الرسمية');
    setTimeout(() => setBankMsg(''), 3000);
  };

  const handleApproveTeacherAction = (teacherId: string, name: string) => {
    approveTeacher(teacherId, customHourlyRate);
    showToast(`تمت الموافقة على طلب المعلمة (${name}) وتفعيل واجهتها بنجاح!`);
    setSelectedTeacherForReview(null);
  };

  const handleRejectTeacherAction = (teacherId: string, name: string) => {
    if (!rejectionReasonText.trim()) {
      showToast('يرجى كتابة سبب رفض الطلب أولاً', 'error');
      return;
    }
    rejectTeacher(teacherId, rejectionReasonText);
    showToast(`تم رفض طلب المعلمة (${name}) وإشعارها بالسبب`, 'info');
    setSelectedTeacherForReview(null);
    setShowRejectBox(false);
    setRejectionReasonText('');
  };

  const handleApproveSubscriptionAction = (subId: string, studentName: string) => {
    approveSubscription(subId);
    showToast(`تم تأكيد التحويل البنكي وتفعيل الباقة للطالب (${studentName}) بنجاح!`);
  };

  const handleRejectSubscriptionAction = (subId: string, studentName: string) => {
    const reason = prompt('يرجى إدخال سبب عدم مطابقة أو رفض التحويل البنكي:');
    if (reason) {
      rejectSubscription(subId, reason);
      showToast(`تم رفض إيصال الطالب (${studentName}) وإشعاره بالتعديل`, 'info');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Broadcast Announcement Banner */}
      <BroadcastAnnouncementBanner />

      {/* Toast Notification Banner */}
      {toastMsg && (
        <div
          className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 transition-all animate-in slide-in-from-top-4 ${
            toastMsg.type === 'success'
              ? 'bg-emerald-800 text-white border border-emerald-600'
              : toastMsg.type === 'error'
              ? 'bg-rose-800 text-white border border-rose-600'
              : 'bg-amber-700 text-white border border-amber-500'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-700/60 text-emerald-200 text-xs font-bold px-3.5 py-1.5 rounded-full border border-emerald-500/30 mb-3">
              <Building2 className="w-4 h-4 text-amber-400" />
              المجلس التعليمي والإدارة العامة
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight">
              لوحة التحكم والإشراف العام
            </h2>
            <p className="text-emerald-100/80 text-sm mt-1 max-w-xl">
              إدارة طلبات انضمام المعلمات الجدد، مراجعة واعتماد صور تحويلات اشتراك الطلاب، وتتبع الأداء الحلقي.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Notification Center Bell & Toast */}
            <AdminNotificationCenter
              pendingTeachers={teachers.filter((t) => t.status === 'pending')}
              pendingSubscriptions={subscriptions.filter((s) => s.paymentStatus === 'pending')}
              onSelectTeacherForReview={(teacher) => setSelectedTeacherForReview(teacher)}
              onSelectSubForReceipt={(sub) => setSelectedSubForReceipt(sub)}
              onTabChange={(tab) => setActiveTab(tab)}
            />

            <button
              onClick={exportData}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              تحميل نسخة احتياطية
            </button>
          </div>
        </div>

        {/* Top Metric Cards Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-emerald-700/60">
          <div
            onClick={() => setActiveTab('teachers')}
            className="bg-emerald-950/40 hover:bg-emerald-900/40 cursor-pointer p-4 rounded-2xl border border-emerald-700/40 transition-all"
          >
            <span className="text-emerald-200/80 text-xs font-medium block">طلبات المعلمات المعلقة</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-bold text-amber-300">{pendingTeachers.length}</span>
              <GraduationCap className="w-6 h-6 text-amber-400/80" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab('payments')}
            className="bg-emerald-950/40 hover:bg-emerald-900/40 cursor-pointer p-4 rounded-2xl border border-emerald-700/40 transition-all"
          >
            <span className="text-emerald-200/80 text-xs font-medium block">إيصالات بانتظار التفعيل</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-bold text-emerald-300">{pendingPayments.length}</span>
              <CreditCard className="w-6 h-6 text-emerald-400/80" />
            </div>
          </div>

          <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-700/40">
            <span className="text-emerald-200/80 text-xs font-medium block">إجمالي المعلمات النشطات</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-bold text-white">{approvedTeachers.length}</span>
              <Users className="w-6 h-6 text-teal-300/80" />
            </div>
          </div>

          <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-700/40">
            <span className="text-emerald-200/80 text-xs font-medium block">إجمالي الإيرادات المعتمدة</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-bold text-amber-400">{totalRevenue} ر.س</span>
              <DollarSign className="w-6 h-6 text-amber-400/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Alert Banners if Pending Items exist */}
      {(pendingPayments.length > 0 || pendingTeachers.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pendingPayments.length > 0 && (
            <div
              onClick={() => {
                setActiveTab('payments');
                setSubStatusFilter('pending');
              }}
              className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-amber-100/80 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-xs">يوجد {pendingPayments.length} تحويلات بنكية بانتظار المراجعة</h4>
                  <p className="text-[11px] text-amber-700">اضغط لمراجعة صور الإيصالات المرفوعة وتفعيل الاشتراكات.</p>
                </div>
              </div>
              <span className="text-xs bg-amber-200 text-amber-900 font-bold px-3 py-1 rounded-xl">مراجعة الآن</span>
            </div>
          )}

          {pendingTeachers.length > 0 && (
            <div
              onClick={() => {
                setActiveTab('teachers');
                setTeacherStatusFilter('pending');
              }}
              className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-emerald-100/80 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-xl font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-xs">يوجد {pendingTeachers.length} طلبات معلمة بانتظار الموافقة</h4>
                  <p className="text-[11px] text-emerald-700">اضغط لفحص الإجازات والمؤهلات وقبول المعلمات الجدد.</p>
                </div>
              </div>
              <span className="text-xs bg-emerald-200 text-emerald-900 font-bold px-3 py-1 rounded-xl">فحص الطلبات</span>
            </div>
          )}
        </div>
      )}

      {/* Admin Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-sm">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-5 py-3 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'payments'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          مراجعة وإعتماد التحويلات البنكية
          {pendingPayments.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
              {pendingPayments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-5 py-3 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'teachers'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          مراجعة طلبات المعلمات الجدد
          {pendingTeachers.length > 0 && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {pendingTeachers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-3 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          التحليلات ومؤشرات النمو
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`px-5 py-3 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'packages'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <PackageIcon className="w-4 h-4" />
          الباقات والحسابات البنكية
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-5 py-3 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'sessions'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          سجل الحصص المنفذة
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-3 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          النسخ الاحتياطي والبيانات
        </button>
      </div>

      {/* TAB 1: PAYMENTS & WIRE TRANSFER RECEIPTS REVIEW */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-700" />
                اعتماد وتأكيد صور تحويلات اشتراك الطلاب
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                افحص إيصالات التحويل البنكية المرفوعة، وتأكد من مطابقة قيمة الباقة لتفعيل الحصص فوراً.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setSubStatusFilter('all')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                  subStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                جميع الطلبات ({subscriptions.length})
              </button>
              <button
                onClick={() => setSubStatusFilter('pending')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                  subStatusFilter === 'pending' ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold' : 'text-slate-600'
                }`}
              >
                بانتظار الاعتماد ({pendingPayments.length})
              </button>
              <button
                onClick={() => setSubStatusFilter('approved')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                  subStatusFilter === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                المفعلة والمطابقة ({subscriptions.filter(s => s.paymentStatus === 'approved').length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions
              .filter((sub) => subStatusFilter === 'all' || sub.paymentStatus === subStatusFilter)
              .map((sub) => (
                <div
                  key={sub.id}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-sm space-y-4 flex flex-col justify-between ${
                    sub.paymentStatus === 'pending'
                      ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/10'
                      : sub.paymentStatus === 'approved'
                      ? 'border-emerald-200'
                      : 'border-rose-200 opacity-80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">{sub.studentName}</h4>
                        <p className="text-xs text-slate-500" dir="ltr">{sub.studentPhone}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          sub.paymentStatus === 'pending'
                            ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                            : sub.paymentStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {sub.paymentStatus === 'pending'
                          ? 'بانتظار فحص الإيصال'
                          : sub.paymentStatus === 'approved'
                          ? 'مفعلة ومطابقة'
                          : 'مرفوضة'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">الباقة المختارة:</span>
                        <span className="font-bold text-slate-900">{sub.packageName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">المعلمة المخصصة:</span>
                        <span className="font-semibold text-emerald-700">{sub.teacherName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">المبلغ القائم بالتحويل:</span>
                        <span className="font-extrabold text-amber-600 text-sm">{sub.amountPaid} {sub.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">الحصص المتاحة بالباقة:</span>
                        <span className="font-bold text-slate-800">{sub.totalSessions} حصص</span>
                      </div>
                      {sub.paymentStatus === 'approved' && (
                        <div className="flex justify-between pt-1 border-t border-slate-200">
                          <span className="text-slate-500">المتبقي / المستهلك:</span>
                          <span className="font-bold text-emerald-700">
                            {sub.remainingSessions} متبقية من {sub.usedSessions} مستهلكة
                          </span>
                        </div>
                      )}
                      {sub.rejectionReason && (
                        <div className="pt-1 border-t border-rose-200 text-rose-700 font-medium">
                          سبب الرفض: {sub.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Receipt Preview Thumbnail & Quick Actions */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <button
                      onClick={() => setSelectedSubForReceipt(sub)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-4 h-4 text-emerald-600" />
                      معاينة وتكبير صورة الإيصال المرفق
                    </button>

                    {sub.paymentStatus === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveSubscriptionAction(sub.id, sub.studentName)}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          تأكيد التحويل وتفعيل الباقة
                        </button>
                        <button
                          onClick={() => handleRejectSubscriptionAction(sub.id, sub.studentName)}
                          className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors"
                          title="رفض الإيصال"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {sub.paymentStatus === 'approved' && (
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-500">زيادة حصص إضافية؟</span>
                        <button
                          onClick={() => {
                            const countStr = prompt('كم عدد الحصص الإضافية المراد إضافتها؟', '2');
                            if (countStr && !isNaN(Number(countStr))) {
                              addSessionsToSubscription(sub.id, Number(countStr));
                              showToast(`تمت إضافة ${countStr} حصص إضافية لرصيد الطالب`);
                            }
                          }}
                          className="text-emerald-700 font-bold hover:underline"
                        >
                          + إضافة حصص
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 2: NEW TEACHER JOIN APPLICATIONS REVIEW */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-700" />
                مراجعة واعتماد طلبات انضمام المعلمات الجدد
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                افحص السير الذاتية والإجازات القرآنية، واستمع لعينات التلاوة قبل اعتماد حساب المعلمة.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-48">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className="w-full pr-9 pl-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setTeacherStatusFilter('all')}
                  className={`px-3 py-1 font-bold rounded-lg transition-all ${
                    teacherStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setTeacherStatusFilter('pending')}
                  className={`px-3 py-1 font-bold rounded-lg transition-all ${
                    teacherStatusFilter === 'pending' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-600'
                  }`}
                >
                  الطلبات المعلقة ({pendingTeachers.length})
                </button>
                <button
                  onClick={() => setTeacherStatusFilter('approved')}
                  className={`px-3 py-1 font-bold rounded-lg transition-all ${
                    teacherStatusFilter === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'
                  }`}
                >
                  المعتمدات ({approvedTeachers.length})
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teachers
              .filter((t) => {
                const matchesSearch = t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || t.qualifications.specialization.includes(teacherSearch);
                const matchesStatus = teacherStatusFilter === 'all' || t.status === teacherStatusFilter;
                return matchesSearch && matchesStatus;
              })
              .map((teacher) => (
                <div
                  key={teacher.id}
                  className={`bg-white rounded-2xl border p-6 shadow-sm space-y-4 ${
                    teacher.status === 'pending'
                      ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/10'
                      : teacher.status === 'approved'
                      ? 'border-emerald-200'
                      : 'border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/20 shadow-sm"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-slate-900 text-lg">{teacher.name}</h4>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            teacher.status === 'pending'
                              ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                              : teacher.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {teacher.status === 'pending'
                            ? 'طلب جديد - بانتظار الاعتماد'
                            : teacher.status === 'approved'
                            ? 'معتمدة ونشطة'
                            : 'مرفوضة'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500" dir="ltr">{teacher.phone} | {teacher.email}</p>
                      <p className="text-xs font-bold text-emerald-800 mt-1">{teacher.qualifications.specialization}</p>
                    </div>
                  </div>

                  {/* Qualifications & Ijazat details */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-3">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">الإجازات العلمية والروايات:</span>
                      <ul className="list-disc list-inside text-slate-700 space-y-0.5 pr-1 font-medium">
                        {teacher.qualifications.ijazat.map((ij, idx) => (
                          <li key={idx}>{ij}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                      <div>
                        <span className="text-slate-500 block">سنوات الخبرة التدريسية:</span>
                        <span className="font-bold text-slate-800">{teacher.qualifications.experienceYears} سنوات</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">مقدار حفظ القرآن:</span>
                        <span className="font-bold text-slate-800">{teacher.qualifications.memorizationParts} جزءاً</span>
                      </div>
                    </div>

                    {/* Audio Recitation Sample Player */}
                    {teacher.qualifications.recitationAudioUrl && (
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-slate-600 font-bold text-[11px]">عينة تلاوة تجريبية مرفقة:</span>
                        <button
                          onClick={() => toggleAudioSample(teacher.qualifications.recitationAudioUrl!)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                            playingAudioUrl === teacher.qualifications.recitationAudioUrl
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          }`}
                        >
                          {playingAudioUrl === teacher.qualifications.recitationAudioUrl ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              إيقاف العينة
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-white" />
                              استماع للتلاوة
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {teacher.qualifications.bio && (
                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-slate-500 block mb-0.5">السيرة الذاتية والأقسام:</span>
                        <p className="text-slate-700 italic">{teacher.qualifications.bio}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions for Pending Teachers */}
                  {teacher.status === 'pending' ? (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => setSelectedTeacherForReview(teacher)}
                        className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        فحص الملف وتحديد الأجر ثم الاعتماد
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <span className="text-slate-500">معدل أجر الحصة:</span>
                      <span className="font-bold text-emerald-800">{teacher.hourlyRate || 120} ريال / الحصة</span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS & GROWTH */}
      {activeTab === 'analytics' && (
        <AcademyAnalytics subscriptions={subscriptions} sessions={sessions} teachers={teachers} />
      )}

      {/* TAB 4: PACKAGES & BANK ACCOUNTS */}
      {activeTab === 'packages' && (
        <div className="space-y-8">
          
          {/* Packages Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">باقات التحفيظ والتسعيـر</h3>
                <p className="text-xs text-slate-500">قم بإنشاء وتعديل الباقات المتاحة للطلاب مع تحديد عدد الحصص والأسعار.</p>
              </div>
              <button
                onClick={() => handleOpenPkgModal()}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-700/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة باقة جديدة
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4 relative flex flex-col justify-between hover:border-emerald-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-extrabold text-slate-900 text-base">{pkg.name}</h4>
                      <span className="text-lg font-bold text-emerald-700">{pkg.price} {pkg.currency}</span>
                    </div>

                    <p className="text-xs text-slate-600">{pkg.description}</p>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/60 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">عدد الحصص:</span>
                        <span className="font-bold text-slate-800">{pkg.sessionCount} حصص</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">مدة الحصة:</span>
                        <span className="font-bold text-slate-800">{pkg.sessionDurationMinutes} دقيقة</span>
                      </div>
                    </div>

                    <ul className="space-y-1 text-xs text-slate-700 pr-1">
                      {pkg.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenPkgModal(pkg)}
                      className="flex-1 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      تعديل الباقة
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('هل أنت تأكد من حذف هذه الباقة؟')) {
                          deletePackage(pkg.id);
                          showToast('تم حذف الباقة بنجاح');
                        }
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bank Accounts Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">الحسابات البنكية لاستقبال التحويلات</h3>
                <p className="text-xs text-slate-500">تظهر هذه الحسابات للطلاب عند اختيار الباقة لتحويل رسوم الاشتراك عليها.</p>
              </div>
              <button
                onClick={handleSaveBankAccounts}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md"
              >
                حفظ بيانات الحسابات
              </button>
            </div>

            {bankMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                {bankMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {editingBanks.map((acc, index) => (
                <div key={index} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">اسم البنك / الخدمة</label>
                    <input
                      type="text"
                      value={acc.bankName}
                      onChange={(e) => {
                        const newArr = [...editingBanks];
                        newArr[index].bankName = e.target.value;
                        setEditingBanks(newArr);
                      }}
                      className="w-full p-2 border rounded-lg bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">اسم الحساب المستفيد</label>
                    <input
                      type="text"
                      value={acc.accountName}
                      onChange={(e) => {
                        const newArr = [...editingBanks];
                        newArr[index].accountName = e.target.value;
                        setEditingBanks(newArr);
                      }}
                      className="w-full p-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">رقم الآيبان (IBAN) / رقم الحساب</label>
                    <input
                      type="text"
                      value={acc.iban}
                      onChange={(e) => {
                        const newArr = [...editingBanks];
                        newArr[index].iban = e.target.value;
                        setEditingBanks(newArr);
                      }}
                      className="w-full p-2 border rounded-lg bg-white font-mono text-[11px]"
                      dir="ltr"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: SESSIONS LOG */}
      {activeTab === 'sessions' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">سجل الحصص المنفذة والتسميع</h3>
            <p className="text-xs text-slate-500">استعراض كافة الحصص المسجلة من قبل المعلمات مع التقييم وملاحظات التجويد.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">اسم الطالب</th>
                  <th className="p-3">المعلمة</th>
                  <th className="p-3">المقرر والتسميع</th>
                  <th className="p-3">التقييم</th>
                  <th className="p-3">ملاحظات التجويد</th>
                  <th className="p-3">الورد القادم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((ses) => (
                  <tr key={ses.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-semibold text-slate-600">{ses.date}</td>
                    <td className="p-3 font-bold text-slate-900">{ses.studentName}</td>
                    <td className="p-3 font-semibold text-emerald-700">{ses.teacherName}</td>
                    <td className="p-3 text-slate-800">
                      {ses.surahName} (آية {ses.fromAyah} - {ses.toAyah})
                    </td>
                    <td className="p-3 text-amber-500 font-bold">
                      {'★'.repeat(ses.rating)}
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs">{ses.tajweedNotes}</td>
                    <td className="p-3 text-slate-700 font-medium">{ses.homework}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ACCOUNTS & DATA SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <UsersManager />

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-2xl">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">النسخ الاحتياطي</h3>
              <p className="text-xs text-slate-500">
                البيانات محفوظة في قاعدة بيانات Neon السحابية، وبتحتفظ تلقائياً بسجل للاستعادة. ممكن كمان تنزّل نسخة لجهازك في أي وقت.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">تنزيل نسخة كاملة (JSON)</h4>
                <p className="text-xs text-slate-500">الطلاب والمعلمات والباقات والاشتراكات والحصص — بدون كلمات السر وصور الإيصالات.</p>
              </div>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 transition-colors flex items-center gap-2 shrink-0"
              >
                <Download className="w-4 h-4" />
                تنزيل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Edit/Add Modal */}
      {showPkgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-emerald-100">
            <h3 className="font-bold text-lg text-slate-900">
              {editingPkg ? 'تعديل الباقة' : 'إضافة باقة جديدة'}
            </h3>

            <form onSubmit={handleSavePkg} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم الباقة</label>
                <input
                  type="text"
                  required
                  value={pkgName}
                  onChange={(e) => setPkgName(e.target.value)}
                  placeholder="مثال: باقة الخاتمات المكثفة"
                  className="w-full p-2.5 border rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">عدد الحصص</label>
                  <input
                    type="number"
                    required
                    value={pkgSessions}
                    onChange={(e) => setPkgSessions(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المدة (دقيقة)</label>
                  <input
                    type="number"
                    required
                    value={pkgDuration}
                    onChange={(e) => setPkgDuration(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">السعر (ر.س)</label>
                  <input
                    type="number"
                    required
                    value={pkgPrice}
                    onChange={(e) => setPkgPrice(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl font-bold text-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">وصف مقتضب</label>
                <input
                  type="text"
                  value={pkgDesc}
                  onChange={(e) => setPkgDesc(e.target.value)}
                  placeholder="وصف مختصر لمزايا الفئة المستهدفة"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">المميزات (كل ميزة في سطر)</label>
                <textarea
                  rows={3}
                  value={pkgFeatureText}
                  onChange={(e) => setPkgFeatureText(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPkgModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
                >
                  حفظ الباقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED TEACHER APPLICATION REVIEW MODAL */}
      {selectedTeacherForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-emerald-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedTeacherForReview.avatar}
                  alt={selectedTeacherForReview.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500"
                />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">{selectedTeacherForReview.name}</h3>
                  <p className="text-xs text-emerald-800 font-bold">{selectedTeacherForReview.qualifications.specialization}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedTeacherForReview(null);
                  setShowRejectBox(false);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Qualifications Summary */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-slate-500 block">رقم الجوال والواتساب:</span>
                  <span className="font-bold text-slate-800" dir="ltr">{selectedTeacherForReview.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">البريد الإلكتروني:</span>
                  <span className="font-bold text-slate-800">{selectedTeacherForReview.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">مقدار حفظ القرآن:</span>
                  <span className="font-bold text-emerald-800">{selectedTeacherForReview.qualifications.memorizationParts} جزءاً</span>
                </div>
                <div>
                  <span className="text-slate-500 block">سنوات الخبرة التدريسية:</span>
                  <span className="font-bold text-emerald-800">{selectedTeacherForReview.qualifications.experienceYears} سنوات</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">الإجازات العلمية والروايات:</span>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                  {selectedTeacherForReview.qualifications.ijazat.map((ij, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 font-bold">
                      <Award className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{ij}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTeacherForReview.qualifications.bio && (
                <div>
                  <span className="font-bold text-slate-900 block mb-1">نبذة السيرة الذاتية:</span>
                  <p className="bg-slate-50 p-3 rounded-xl border text-slate-700 italic">
                    "{selectedTeacherForReview.qualifications.bio}"
                  </p>
                </div>
              )}

              {/* Set hourly/session compensation rate */}
              <div className="bg-amber-50/80 border border-amber-300 p-4 rounded-2xl space-y-2">
                <label className="block font-bold text-amber-950">
                  تحديد أجر/مستحقات المعلمة للحصة (بالريال السعودي):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customHourlyRate}
                    onChange={(e) => setCustomHourlyRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-amber-900"
                  />
                  <span className="text-xs font-bold text-amber-900 shrink-0">ر.س / الحصة</span>
                </div>
                <div className="flex items-center gap-2 pt-1 text-[11px]">
                  <span className="text-amber-800 font-semibold">خيارات سريعة:</span>
                  {[100, 120, 150, 180].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setCustomHourlyRate(rate)}
                      className={`px-2.5 py-1 rounded-lg font-bold border ${
                        customHourlyRate === rate
                          ? 'bg-amber-500 text-slate-950 border-amber-600'
                          : 'bg-white text-slate-700 border-amber-200'
                      }`}
                    >
                      {rate} ر.س
                    </button>
                  ))}
                </div>
              </div>

              {/* Rejection box if toggled */}
              {showRejectBox && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
                  <label className="block font-bold text-rose-900">سبب رفض طلب الانضمام:</label>
                  <textarea
                    rows={2}
                    value={rejectionReasonText}
                    onChange={(e) => setRejectionReasonText(e.target.value)}
                    placeholder="مثال: يرجى استكمال شهادات الإجازة أو تقديم مقطع تلاوة أكثر وضوحاً."
                    className="w-full p-2.5 bg-white border border-rose-300 rounded-xl"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t pt-4">
              <button
                onClick={() => {
                  setSelectedTeacherForReview(null);
                  setShowRejectBox(false);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold"
              >
                إلغاء
              </button>

              <div className="flex items-center gap-2">
                {!showRejectBox ? (
                  <button
                    onClick={() => setShowRejectBox(true)}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors"
                  >
                    رفض الطلب
                  </button>
                ) : (
                  <button
                    onClick={() => handleRejectTeacherAction(selectedTeacherForReview.id, selectedTeacherForReview.name)}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    تأكيد الرفض
                  </button>
                )}

                <button
                  onClick={() => handleApproveTeacherAction(selectedTeacherForReview.id, selectedTeacherForReview.name)}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  اعتماد المعلمة وتفعيل حسابها
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal for viewing student bank transfer receipts */}
      <ReceiptViewerModal
        subscription={selectedSubForReceipt}
        onClose={() => setSelectedSubForReceipt(null)}
        onApprove={(id) => {
          const sub = subscriptions.find((s) => s.id === id);
          handleApproveSubscriptionAction(id, sub?.studentName || '');
        }}
        onReject={(id, reason) => {
          rejectSubscription(id, reason);
          const sub = subscriptions.find((s) => s.id === id);
          showToast(`تم رفض إيصال الطالب (${sub?.studentName}) وإشعاره بالسبب`, 'info');
        }}
      />

    </div>
  );
};
