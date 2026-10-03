import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Receipt,
  Eye,
  X,
  Check,
  Sparkles,
  Clock,
  ChevronLeft,
  Filter,
  Megaphone,
  Send
} from 'lucide-react';
import { TeacherProfile, Subscription } from '../../types';
import { useApp } from '../../context/AppContext';

export interface AdminNotificationItem {
  id: string;
  type: 'teacher_application' | 'subscription_receipt';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  relatedId: string; // teacher id or subscription id
  amountOrSubject?: string;
  applicantName: string;
}

interface AdminNotificationCenterProps {
  pendingTeachers: TeacherProfile[];
  pendingSubscriptions: Subscription[];
  onSelectTeacherForReview: (teacher: TeacherProfile) => void;
  onSelectSubForReceipt: (sub: Subscription) => void;
  onTabChange: (tab: 'payments' | 'teachers') => void;
}

export const AdminNotificationCenter: React.FC<AdminNotificationCenterProps> = ({
  pendingTeachers,
  pendingSubscriptions,
  onSelectTeacherForReview,
  onSelectSubForReceipt,
  onTabChange,
}) => {
  const { sendBroadcast } = useApp();
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [isOpenPanel, setIsOpenPanel] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'teachers' | 'receipts'>('all');
  const [activeToast, setActiveToast] = useState<AdminNotificationItem | null>(null);

  // Broadcast Composer State
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [bcastTitle, setBcastTitle] = useState('');
  const [bcastContent, setBcastContent] = useState('');
  const [bcastPriority, setBcastPriority] = useState<'normal' | 'urgent'>('urgent');
  const [bcastTarget, setBcastTarget] = useState<'all' | 'teachers' | 'students'>('all');
  const [bcastSuccessMsg, setBcastSuccessMsg] = useState('');

  const handleSendBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcastTitle.trim() || !bcastContent.trim()) return;

    sendBroadcast({
      title: bcastTitle,
      content: bcastContent,
      priority: bcastPriority,
      targetRole: bcastTarget,
    });

    setBcastSuccessMsg('تم بث التنبيه الفوري لجميع الواجهات بنجاح! 📣');
    setTimeout(() => {
      setBcastSuccessMsg('');
      setShowBroadcastModal(false);
      setBcastTitle('');
      setBcastContent('');
    }, 1500);
  };

  // Synchronize notifications with incoming pending teachers and subscription transfer receipts
  useEffect(() => {
    const list: AdminNotificationItem[] = [];

    // Map pending teacher applications
    pendingTeachers.forEach((t) => {
      list.push({
        id: `notif_teacher_${t.id}`,
        type: 'teacher_application',
        title: 'طلب انضمام معلمة جديد 👩‍🏫',
        description: `قدّمت المعلمة (${t.name}) طلب انضمام جديد للتدريس بانتظار الاعتماد.`,
        timestamp: t.createdAt || 'اليوم، 10:30 ص',
        isRead: false,
        relatedId: t.id,
        applicantName: t.name,
        amountOrSubject: t.qualifications?.specialization || 'حفظ وتجويد',
      });
    });

    // Map pending subscription transfer receipts
    pendingSubscriptions.forEach((s) => {
      list.push({
        id: `notif_sub_${s.id}`,
        type: 'subscription_receipt',
        title: 'صورة تحويل اشتراك جديد 💳',
        description: `قامت الطالبة (${s.studentName}) برفع إيصال تحويل بانكي لباقة (${s.packageName}).`,
        timestamp: s.createdAt || 'قبل 15 دقيقة',
        isRead: false,
        relatedId: s.id,
        applicantName: s.studentName,
        amountOrSubject: `${s.amountPaid} ر.س`,
      });
    });

    setNotifications(list);

    // Pop up instant toast for the newest unread item if present
    if (list.length > 0 && !activeToast) {
      setActiveToast(list[0]);
      const timer = setTimeout(() => setActiveToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [pendingTeachers, pendingSubscriptions]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'teachers') return n.type === 'teacher_application';
    if (activeFilter === 'receipts') return n.type === 'subscription_receipt';
    return true;
  });

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notif: AdminNotificationItem) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    setIsOpenPanel(false);

    if (notif.type === 'teacher_application') {
      const teacher = pendingTeachers.find((t) => t.id === notif.relatedId);
      if (teacher) {
        onTabChange('teachers');
        onSelectTeacherForReview(teacher);
      }
    } else if (notif.type === 'subscription_receipt') {
      const sub = pendingSubscriptions.find((s) => s.id === notif.relatedId);
      if (sub) {
        onTabChange('payments');
        onSelectSubForReceipt(sub);
      }
    }
  };

  return (
    <div className="relative inline-flex items-center gap-2 text-right">
      
      {/* BROADCAST MESSAGE COMPOSER TRIGGER BUTTON */}
      <button
        onClick={() => setShowBroadcastModal(true)}
        className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 border border-amber-300 min-h-[44px]"
        title="إرسال تنبيه عاجل لجميع الواجهات"
      >
        <Megaphone className="w-4 h-4 animate-pulse" />
        <span>بث إعلان عاجل</span>
      </button>

      {/* BELL ICON BUTTON WITH BADGE */}
      <button
        onClick={() => setIsOpenPanel(!isOpenPanel)}
        className="relative p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200 rounded-2xl shadow-sm transition-all flex items-center justify-center"
        title="التنبيهات والإشعارات الفورية"
      >
        <Bell className="w-5 h-5 text-emerald-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* FLOATING INSTANT TOAST POPUP NOTIFICATION BANNER */}
      {activeToast && (
        <div className="fixed bottom-6 left-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-3xl p-4 shadow-2xl border-2 border-emerald-500 animate-in slide-in-from-bottom-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-600 rounded-xl text-white shadow-xs">
                {activeToast.type === 'teacher_application' ? (
                  <UserPlus className="w-4 h-4" />
                ) : (
                  <Receipt className="w-4 h-4" />
                )}
              </span>
              <div>
                <span className="text-[10px] font-black text-amber-300 block uppercase">تنبيه إداري عاجل 🔥</span>
                <h5 className="font-extrabold text-xs text-white font-serif">{activeToast.title}</h5>
              </div>
            </div>

            <button
              onClick={() => setActiveToast(null)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            {activeToast.description}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono">{activeToast.timestamp}</span>
            <button
              onClick={() => {
                handleNotificationClick(activeToast);
                setActiveToast(null);
              }}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[11px] rounded-xl flex items-center gap-1 shadow-sm"
            >
              <span>معاينة الطلب الآن</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* DROPDOWN NOTIFICATION PANEL */}
      {isOpenPanel && (
        <div className="absolute left-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 space-y-3 animate-in fade-in">
          
          {/* PANEL HEADER */}
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" />
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white font-serif">
                مركز الإشعارات والتنبيهات
              </h4>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
              >
                تحديد الكل كُمقروء
              </button>
            )}
          </div>

          {/* FILTER TABS */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-bold">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-1 py-1 rounded-lg transition-all ${
                activeFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              الكل ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('teachers')}
              className={`flex-1 py-1 rounded-lg transition-all ${
                activeFilter === 'teachers' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              المعلمات ({notifications.filter((n) => n.type === 'teacher_application').length})
            </button>
            <button
              onClick={() => setActiveFilter('receipts')}
              className={`flex-1 py-1 rounded-lg transition-all ${
                activeFilter === 'receipts' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              التحويلات ({notifications.filter((n) => n.type === 'subscription_receipt').length})
            </button>
          </div>

          {/* NOTIFICATION ITEMS LIST */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredNotifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-60" />
                <p className="text-xs font-bold">لا توجد إشعارات جديدة متطلبة لاتخاذ إجراء.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 relative overflow-hidden ${
                    notif.isRead
                      ? 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs font-serif flex items-center gap-1.5">
                      {notif.type === 'teacher_application' ? (
                        <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Receipt className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      {notif.title}
                    </span>

                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                    )}
                  </div>

                  <p className="text-[11px] leading-relaxed font-sans font-medium">
                    {notif.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                    <span>{notif.timestamp}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline">
                      انقر للمعاينة ↗
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* BROADCAST COMPOSER MODAL */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 text-right">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-amber-300 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
                  <Megaphone className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg font-serif">
                    إرسال إعلان / تنبيه عاجل (Broadcast)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    سيظهر هذا التنبيه فوراً أعلى واجهات الطلاب والمعلمات.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowBroadcastModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bcastSuccessMsg ? (
              <div className="p-6 bg-emerald-50 text-emerald-900 rounded-2xl text-center space-y-2 border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-sm">{bcastSuccessMsg}</h4>
              </div>
            ) : (
              <form onSubmit={handleSendBroadcastSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    عنوان الإعلان أو التنبيه:
                  </label>
                  <input
                    type="text"
                    required
                    value={bcastTitle}
                    onChange={(e) => setBcastTitle(e.target.value)}
                    placeholder="مثال: تنبيه عاجل بشأن تعديل مواعيد اختبارات الحفظ..."
                    className="w-full p-3 border rounded-xl font-bold bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    تفاصيل التنبيه والإرشادات:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={bcastContent}
                    onChange={(e) => setBcastContent(e.target.value)}
                    placeholder="اكتب التفاصيل الكاملة التي يود قسم الإدارة إبلاغها للكادر أو الطلاب..."
                    className="w-full p-3 border rounded-xl font-sans bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">الأولوية:</label>
                    <select
                      value={bcastPriority}
                      onChange={(e) => setBcastPriority(e.target.value as any)}
                      className="w-full p-2.5 border rounded-xl font-bold bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    >
                      <option value="urgent">🔴 عاجل وبارز (شريط أحمر)</option>
                      <option value="normal">🟢 إعلان عادي (شريط زردي)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">الفئة المستهدفة:</label>
                    <select
                      value={bcastTarget}
                      onChange={(e) => setBcastTarget(e.target.value as any)}
                      className="w-full p-2.5 border rounded-xl font-bold bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    >
                      <option value="all">الجميع (معلمات + طلاب)</option>
                      <option value="teachers">المعلمات فقط</option>
                      <option value="students">الطلاب فقط</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>بث التنبيه الفوري</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
