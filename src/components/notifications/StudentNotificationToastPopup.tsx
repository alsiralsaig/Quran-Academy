import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, Clock, Heart, X, CheckCircle2, Volume2, UserCheck, BookOpen, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TeacherNotification } from '../../types';
import { DigitalCompletionCertificate } from '../certificates/DigitalCompletionCertificate';

interface StudentNotificationToastPopupProps {
  studentName: string;
}

export const StudentNotificationToastPopup: React.FC<StudentNotificationToastPopupProps> = ({ studentName }) => {
  const [activeNotification, setActiveNotification] = useState<TeacherNotification | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  useEffect(() => {
    // Check localStorage for direct teacher notifications
    const storedList: TeacherNotification[] = JSON.parse(
      localStorage.getItem('teacher_direct_notifications') || '[]'
    );

    const unread = storedList.find((n) => !n.read);

    if (unread) {
      setActiveNotification(unread);
    } else {
      // Demo fallback encouragement popup on entrance if none unread in storage
      const demoNotification: TeacherNotification = {
        id: 'demo_notif_1',
        senderTeacherName: 'أ. عائشة محمود العلي',
        studentId: 'st_1',
        studentName: studentName,
        type: 'encouragement',
        title: 'رسالة تهنئة واعتماد شهادة إتمام جزء عمّ! 📜🎉',
        message: `مبارك مبارك يا ${studentName}! أتممتِ بحمد الله حفظ وتثبيت جزء عمّ كاملاً وتقرر إصدار الشهادة الرقمية التقديرية المعتمدة لكِ.`,
        sentAt: 'منذ قليل',
        read: false,
      };
      setActiveNotification(demoNotification);
    }
  }, [studentName]);

  const handleDismissNotification = () => {
    if (activeNotification) {
      // Mark as read in localStorage
      const storedList: TeacherNotification[] = JSON.parse(
        localStorage.getItem('teacher_direct_notifications') || '[]'
      );
      const updated = storedList.map((n) => (n.id === activeNotification.id ? { ...n, read: true } : n));
      localStorage.setItem('teacher_direct_notifications', JSON.stringify(updated));
    }
    setActiveNotification(null);
  };

  const handleThankTeacher = () => {
    // Trigger celebration confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#fbbf24', '#ffffff'],
    });

    handleDismissNotification();
  };

  if (!activeNotification) return null;

  return (
    <>
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92%] animate-in slide-in-from-top-6 duration-500">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-5 shadow-2xl border-2 border-amber-400 space-y-3 relative overflow-hidden">
          
          {/* Glow backdrop */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-bold animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-amber-300 font-bold block">
                  إشعار تهنئة وشهادة معتمدة 🔔
                </span>
                <h4 className="font-extrabold text-xs text-white">
                  {activeNotification.senderTeacherName}
                </h4>
              </div>
            </div>

            <button
              onClick={handleDismissNotification}
              className="p-1 text-emerald-300 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message body */}
          <div className="space-y-1">
            <h5 className="font-serif font-bold text-amber-300 text-sm">
              {activeNotification.title}
            </h5>
            <p className="text-xs text-emerald-100/95 leading-relaxed">
              {activeNotification.message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1 border-t border-emerald-800/80">
            <button
              onClick={() => setShowCertificateModal(true)}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Award className="w-4 h-4 text-slate-950" />
              عرض واستخراج الشهادة الرقمية 📜
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleThankTeacher}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                شكراً!
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* DIGITAL COMPLETION CERTIFICATE MODAL */}
      <DigitalCompletionCertificate
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        studentName={studentName}
        juzTitle="جزء عمّ (الجزء الثلاثون)"
      />
    </>
  );
};
