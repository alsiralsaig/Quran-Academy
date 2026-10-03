import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Calendar,
  Sparkles,
  X,
  Send,
  Sliders
} from 'lucide-react';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
  studentName,
}) => {
  // Browser Notification permission state
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );

  // Reminder Preferences
  const [dailyReminderTime, setDailyReminderTime] = useState('17:00'); // 5:00 PM
  const [enableDailyReview, setEnableDailyReview] = useState(true);
  const [enableSessionAlerts, setEnableSessionAlerts] = useState(true);
  const [enableHomeworkAlerts, setEnableHomeworkAlerts] = useState(true);
  const [reminderSoundEnabled, setReminderSoundEnabled] = useState(true);

  const [testNotificationSent, setTestNotificationSent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [isOpen]);

  // Request browser permission
  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        sendBrowserNotification('تنشيط إشعارات أكاديمية إتقان', 'تم تفعيل إشعارات المتصفح بنجاح! سنقوم بتذكيرك بمواعيد الحفظ المحددة.');
      }
    } else {
      alert('متصفحك الحالي لا يدعم إشعارات المتصفح المباشرة.');
    }
  };

  // Trigger test notification
  const sendBrowserNotification = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 3000);
    } else {
      alert(`إشعار تجريبي:\n\n📌 ${title}\n${body}`);
    }
  };

  const handleTestNotificationClick = () => {
    sendBrowserNotification(
      `تذكير الورد اليومي - أهلاً ${studentName}`,
      `حان الآن موعد وِرد حفظ القرآن الكريم والمراجعة المعتاد (${dailyReminderTime}). استعن بالله وابدأ جلسة الحفظ!`
    );
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`تم حفظ إعدادات التذكير اليومي الساعة (${dailyReminderTime}) بنجاح!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-emerald-100 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
              <Bell className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg font-serif">
                تخصيص إشعارات ومواعيد التذكير اليومي
              </h3>
              <p className="text-xs text-slate-500">
                حدد الوقت المناسب لتلقي تذكيرات وِرد الحفظ والمراجعة عبر المتصفح.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Permission Banner */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
          permission === 'granted'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-center gap-2">
            {permission === 'granted' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <span className="font-extrabold block">
                {permission === 'granted' ? 'إشعارات المتصفح مفعّلة بنجاح' : 'إشعارات المتصفح غير مفعّلة'}
              </span>
              <span className="text-[11px] opacity-80">
                {permission === 'granted'
                  ? 'ستصلك التنبيهات المباشرة في الموعد المحدد حتى لو كان المتصفح مغلقاً.'
                  : 'يرجى السماح بالإشعارات لتلقي تذكيرات الحفظ تلقائياً.'}
              </span>
            </div>
          </div>

          {permission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow-md shrink-0"
            >
              تفعيل الآن
            </button>
          )}
        </div>

        {/* Preferences Form */}
        <form onSubmit={handleSavePreferences} className="space-y-5 text-xs">
          
          {/* Daily Reminder Time Picker */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="font-extrabold text-slate-900 block flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-700" />
              تحديد الموعد اليومي لتذكير وِرد الحفظ:
            </label>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={dailyReminderTime}
                onChange={(e) => setDailyReminderTime(e.target.value)}
                className="p-3 border rounded-xl font-bold bg-white text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-slate-500 font-semibold">
                (يتم التذكير يومياً في هذا الوقت)
              </span>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 border-b pb-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              أنواع الإشعارات المرغوبة:
            </h4>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 block">تذكير وِرد الحفظ والمراجعة اليومي</span>
                <span className="text-[11px] text-slate-500 block">إرسال تنبيه في موعد المراجعة المحدد</span>
              </div>
              <input
                type="checkbox"
                checked={enableDailyReview}
                onChange={(e) => setEnableDailyReview(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 block">تنبيه قبل الحصة المباشرة بـ 15 دقيقة</span>
                <span className="text-[11px] text-slate-500 block">تذكير بموعد القاعة والمباشر مع المعلمة</span>
              </div>
              <input
                type="checkbox"
                checked={enableSessionAlerts}
                onChange={(e) => setEnableSessionAlerts(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 block">تنبيه عند إضافة واجب أو ملحوظة تجويدية</span>
                <span className="text-[11px] text-slate-500 block">إشعار فور تقييم المعلمة للتسميع اليومي</span>
              </div>
              <input
                type="checkbox"
                checked={enableHomeworkAlerts}
                onChange={(e) => setEnableHomeworkAlerts(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </label>
          </div>

          {/* Test Notification Button */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-emerald-950 block">تجربة إرسال إشعار للمتصفح</span>
              <span className="text-[11px] text-emerald-800">اختبر ظهور التنبيه على شاشتك الآن</span>
            </div>
            <button
              type="button"
              onClick={handleTestNotificationClick}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              إرسال تجريبي
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 font-bold rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md"
            >
              حفظ إعدادات الإشعارات
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
