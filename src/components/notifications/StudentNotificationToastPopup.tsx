import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, X, Heart, Bell } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';

interface StudentNotificationToastPopupProps {
  studentName: string;
}

const SHOWN_KEY = 'etqan_popup_shown';

const loadShown = (): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem(SHOWN_KEY) || '[]');
  } catch {
    return [];
  }
};

/**
 * إشعار منبثق حقيقي: يعرض أحدث إشعار غير مقروء من السيرفر (رسالة المعلم، تقييم حصة، اعتماد اشتراك…).
 * يظهر مرة واحدة في الجلسة لكل إشعار، و«تمام»/«شكراً» تعلّمه كمقروء في قاعدة البيانات.
 */
export const StudentNotificationToastPopup: React.FC<StudentNotificationToastPopupProps> = () => {
  const { notifications, markAsRead } = useApp();
  const [shown, setShown] = useState<string[]>(loadShown);

  const active = useMemo(() => notifications.find((n) => !n.isRead && !shown.includes(n.id)) || null, [notifications, shown]);

  useEffect(() => {
    if (!active) return;
    const next = [...shown, active.id].slice(-50);
    try {
      sessionStorage.setItem(SHOWN_KEY, JSON.stringify(next));
    } catch {}
    // لا نحدّث shown هنا حتى يفضل الإشعار معروض لحدّ ما المستخدم يقفله
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  if (!active) return null;

  const [body, sender] = active.message.split('\n— ');

  const dismiss = () => {
    markAsRead(active.id);
    setShown((prev) => [...prev, active.id]);
  };

  const thank = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#fbbf24', '#ffffff'] });
    dismiss();
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92%] animate-in slide-in-from-top-6 duration-500">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-5 shadow-2xl border-2 border-amber-400 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-bold">
              {active.type === 'success' ? <Sparkles className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[10px] text-amber-300 font-bold block">إشعار جديد 🔔</span>
              <h4 className="font-extrabold text-xs text-white">{sender || 'أكاديمية إتقان'}</h4>
            </div>
          </div>
          <button onClick={dismiss} className="p-1 text-emerald-300 hover:text-white rounded-lg" aria-label="إغلاق">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-1">
          <h5 className="font-serif font-bold text-amber-300 text-sm">{active.title}</h5>
          <p className="text-xs text-emerald-100/95 leading-relaxed whitespace-pre-line">{body}</p>
          <p className="text-[10px] text-emerald-300/70">{active.createdAt}</p>
        </div>
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-emerald-800/80">
          <button onClick={dismiss} className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl">
            تمام
          </button>
          {sender && (
            <button
              onClick={thank}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1"
            >
              <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
              شكراً!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
