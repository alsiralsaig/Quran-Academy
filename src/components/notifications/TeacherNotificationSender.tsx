import React, { useState } from 'react';
import { Send, Bell, Sparkles, Clock, BookOpen, Heart, CheckCircle2, User, Volume2 } from 'lucide-react';
import { TeacherNotification } from '../../types';

interface TeacherNotificationSenderProps {
  teacherName: string;
  onNotificationSent?: (notification: TeacherNotification) => void;
}

export const TeacherNotificationSender: React.FC<TeacherNotificationSenderProps> = ({
  teacherName,
  onNotificationSent,
}) => {
  const [selectedStudent, setSelectedStudent] = useState('عبدالرحمن الشمري');
  const [notificationType, setNotificationType] = useState<'encouragement' | 'attendance' | 'homework'>('encouragement');
  const [title, setTitle] = useState('أحسنتِ وأبدعتِ اليوم في التسميع! 🌟');
  const [message, setMessage] = useState('أداء ممتاز وتجويد نقي لمخارج الحروف في سورة البقرة. استمري في هذا الإتقان والتميز المبارك!');
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  // Ready templates
  const applyTemplate = (type: 'encouragement' | 'attendance' | 'homework') => {
    setNotificationType(type);
    if (type === 'encouragement') {
      setTitle('أحسنتِ وأبدعتِ اليوم في التسميع! 🌟');
      setMessage('أداء ممتاز وتجويد نقي لمخارج الحروف في حلقة اليوم. بارك الله في حفظك وزادكِ علماً وإتقاناً!');
    } else if (type === 'attendance') {
      setTitle('تذكير بموعد الحلقة المباشرة الآن ⏰');
      setMessage('أهلاً بكِ! تبدأ حلقة التسميع والتجويد المباشرة الآن عبر القاعة. نحن بانتظار حضوركِ المبارك!');
    } else if (type === 'homework') {
      setTitle('تنبيه واجب ومراجعة تجويدية جديدة 📝');
      setMessage('تم إضافة ملحوظات التجويد وواجب مراجعة الجزء المخصص في سجلك. يرجى الاطلاع عليه قبل الحلقة القادمة.');
    }
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newNotification: TeacherNotification = {
      id: `t_notif_${Date.now()}`,
      senderTeacherName: teacherName,
      studentId: 'st_1',
      studentName: selectedStudent,
      type: notificationType,
      title,
      message,
      sentAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    // Save to localStorage for cross-dashboard communication
    const existing = JSON.parse(localStorage.getItem('teacher_direct_notifications') || '[]');
    localStorage.setItem('teacher_direct_notifications', JSON.stringify([newNotification, ...existing]));

    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 4000);

    if (onNotificationSent) {
      onNotificationSent(newNotification);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
          <Bell className="w-6 h-6 text-amber-700" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
              Direct Teacher Alerts & Toasts
            </span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg font-serif">
            إرسال تنبيهات تشجيعية وتذكيرات حضور للطلاب
          </h3>
          <p className="text-xs text-slate-500">
            أرسلي رسالة تشجيعية أو تذكير بموعد الحلقة تظهر فوراً كإشعار منبثق (Toast) في لوحة تحكم الطالب.
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {isSuccessToast && (
        <div className="p-4 bg-emerald-600 text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
            <span>تم إرسال التنبيه التشجيعي إلى لوحة تحكم الطالب ({selectedStudent}) بنجاح! سيظهر كإشعار منبثق عند دخوله.</span>
          </div>
        </div>
      )}

      {/* Quick Template Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block">نماذج رسائل سريعة:</label>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => applyTemplate('encouragement')}
            className={`px-3.5 py-2 rounded-xl border font-bold flex items-center gap-1.5 transition-all ${
              notificationType === 'encouragement'
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>تنبيه تشجيعي ومكافأة 🌟</span>
          </button>

          <button
            type="button"
            onClick={() => applyTemplate('attendance')}
            className={`px-3.5 py-2 rounded-xl border font-bold flex items-center gap-1.5 transition-all ${
              notificationType === 'attendance'
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>تذكير حضور بالحلقة ⏰</span>
          </button>

          <button
            type="button"
            onClick={() => applyTemplate('homework')}
            className={`px-3.5 py-2 rounded-xl border font-bold flex items-center gap-1.5 transition-all ${
              notificationType === 'homework'
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>تنبيه واجب تجويدي 📝</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSendNotification} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">اختر الطالب المستهدف:</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full p-3 border rounded-xl font-bold bg-white text-slate-900 focus:outline-none"
            >
              <option value="عبدالرحمن الشمري">عبدالرحمن الشمري (حلقة سورة البقرة)</option>
              <option value="مريم الخالدي">مريم الخالدي (حلقة جزء عمّ)</option>
              <option value="جميع طلاب الحلقة">جميع طلاب الحلقة المباركة 👥</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">عنوان التنبيه:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border rounded-xl font-bold bg-white text-slate-900 focus:outline-none"
              placeholder="مثال: أحسنتِ تم أداء التسميع بنجاح!"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">نص التنبيه أو التذكير التشجيعي:</label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border rounded-xl font-medium bg-white text-slate-900 focus:outline-none leading-relaxed"
            placeholder="اكتبي نص الرسالة التوجيهية للطفل أو الطالبة..."
          />
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            إرسال التنبيه الفوري للطالب 🚀
          </button>
        </div>
      </form>

    </div>
  );
};
