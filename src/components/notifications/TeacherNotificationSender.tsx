import React, { useState } from 'react';
import { Send, Bell, Sparkles, Clock, BookOpen, Heart, CheckCircle2, User, Volume2 } from 'lucide-react';
import { TeacherNotification } from '../../types';
import { useApp } from '../../context/AppContext';

interface TeacherNotificationSenderProps {
  teacherName: string;
  onNotificationSent?: (notification: TeacherNotification) => void;
}

export const TeacherNotificationSender: React.FC<TeacherNotificationSenderProps> = ({
  teacherName,
  onNotificationSent,
}) => {
  // طلاب المعلم الحقيقيين (اشتراكات معتمدة)
  const { subscriptions, currentUser, sendDirectNotification } = useApp();
  const myStudents = Array.from(
    new Map(
      subscriptions
        .filter((s) => s.teacherId === currentUser.id && s.paymentStatus === 'approved')
        .map((s) => [s.studentId, { id: s.studentId, name: s.studentName, pkg: s.packageName }])
    ).values()
  );
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [notificationType, setNotificationType] = useState<'encouragement' | 'attendance' | 'homework'>('encouragement');
  const [title, setTitle] = useState('أحسنتِ وأبدعتِ اليوم في التسميع! 🌟');
  const [message, setMessage] = useState('أداء ممتاز وتجويد نقي لمخارج الحروف في حلقة اليوم. بارك الله في حفظك وزادكِ علماً وإتقاناً!');
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

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !title.trim() || sending) return;
    setSending(true);
    try {
      const sent = await sendDirectNotification({
        all: selectedStudent === 'all',
        recipientIds: selectedStudent === 'all' ? undefined : [selectedStudent],
        kind: notificationType,
        title: title.trim(),
        message: message.trim(),
      });
      setSentCount(sent);
      setIsSuccessToast(true);
      setTimeout(() => setIsSuccessToast(false), 4000);
      if (onNotificationSent) {
        const n: TeacherNotification = {
          id: `t_notif_${Date.now()}`,
          senderTeacherName: teacherName,
          studentId: selectedStudent,
          studentName: selectedStudent === 'all' ? 'جميع طلابي' : myStudents.find((x) => x.id === selectedStudent)?.name || '',
          type: notificationType,
          title,
          message,
          sentAt: new Date().toISOString(),
          read: false,
        };
        onNotificationSent(n);
      }
    } catch {
      /* الرسالة بتظهر من النظام */
    } finally {
      setSending(false);
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
              تنبيهات مباشرة
            </span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg font-serif">
            إرسال تنبيهات تشجيعية وتذكيرات حضور للطلاب
          </h3>
          <p className="text-xs text-slate-500">
            أرسلي رسالة تشجيعية أو تذكير بموعد الحلقة لطلابك المعتمدين — بتظهر ليهم كإشعار في لوحتهم.
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {isSuccessToast && (
        <div className="p-4 bg-emerald-600 text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
            <span>اتأرسل التنبيه لـ {sentCount} {sentCount === 1 ? 'طالب' : 'طلاب'} — بيظهر ليهم كإشعار أول ما يفتحوا لوحتهم من أي جهاز.</span>
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
              <option value="all">جميع طلابي ({myStudents.length}) 👥</option>
              {myStudents.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} — {st.pkg}
                </option>
              ))}
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
            disabled={sending || myStudents.length === 0}
            className="disabled:opacity-50 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {sending ? 'جاري الإرسال...' : myStudents.length === 0 ? 'ما عندك طلاب معتمدين لسه' : 'إرسال التنبيه 🚀'}
          </button>
        </div>
      </form>

    </div>
  );
};
