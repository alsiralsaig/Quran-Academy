import React, { useRef, useState } from 'react';
import {
  Award,
  Trophy,
  Printer,
  Download,
  Mail,
  CheckCircle2,
  Sparkles,
  BookOpen,
  X,
  ShieldCheck,
  Star,
  QrCode,
  Send
} from 'lucide-react';
import { triggerFireworksCelebration } from '../achievements/AchievementCelebrationModal';

export interface DigitalCompletionCertificateProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  juzTitle?: string;
  completionDate?: string;
}

export const DigitalCompletionCertificate: React.FC<DigitalCompletionCertificateProps> = ({
  isOpen,
  onClose,
  studentName,
  juzTitle = 'جزء عمّ (الجزء الثلاثون)',
  completionDate = new Date().toISOString().split('T')[0],
}) => {
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrintCertificate = () => {
    // Fire fireworks celebration
    triggerFireworksCelebration();
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleSendEmailNotification = () => {
    setEmailSentSuccess(true);
    triggerFireworksCelebration();
    setTimeout(() => {
      setEmailSentSuccess(false);
    }, 4000);
  };

  const certificateSerialNumber = `ETQ-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-3 sm:p-6 text-slate-900 overflow-y-auto animate-in fade-in duration-300">
      
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-amber-200 relative overflow-y-auto max-h-[92vh]">
        
        {/* Top Control Bar (Print PDF, Send Email, Close) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-amber-100 text-amber-900 rounded-2xl">
              <Award className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
                Official Digital Quran Certificate 📜
              </span>
              <h3 className="font-extrabold text-slate-900 text-base font-serif mt-0.5">
                الشهادة الرقمية المعتمدة لإتمام حفظ الجزء
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSendEmailNotification}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4 text-amber-300" />
              إرسال تهنئة بالبريد 📧
            </button>

            <button
              onClick={handlePrintCertificate}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 fill-slate-950" />
              تحميل PDF / طباعة 🖨️
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Email Toast Notification */}
        {emailSentSuccess && (
          <div className="p-4 bg-emerald-100 text-emerald-950 rounded-2xl border border-emerald-300 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>تم إرسال رسالة التهنئة والشهادة الرقمية بنجاح إلى البريد الإلكتروني المعتمد للحافظ وولي أمره! 🎉</span>
          </div>
        )}

        {/* PRINTABLE HIGH-FIDELITY CERTIFICATE FRAME */}
        <div
          ref={certificateRef}
          className="print:p-10 p-6 sm:p-10 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/60 rounded-3xl border-8 border-amber-400/90 shadow-2xl relative space-y-6 text-center text-slate-900 overflow-hidden"
        >
          {/* Decorative Corner Islamic Ornaments */}
          <div className="absolute top-3 left-3 text-amber-500 text-2xl font-serif select-none pointer-events-none">
            ❖
          </div>
          <div className="absolute top-3 right-3 text-amber-500 text-2xl font-serif select-none pointer-events-none">
            ❖
          </div>
          <div className="absolute bottom-3 left-3 text-amber-500 text-2xl font-serif select-none pointer-events-none">
            ❖
          </div>
          <div className="absolute bottom-3 right-3 text-amber-500 text-2xl font-serif select-none pointer-events-none">
            ❖
          </div>

          {/* Certificate Header Banner */}
          <div className="space-y-2 border-b-2 border-amber-300 pb-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-12 h-12 bg-emerald-800 text-amber-300 rounded-2xl flex items-center justify-center font-bold shadow-md">
                <BookOpen className="w-7 h-7" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-serif text-emerald-950">
              أَكَادِيمِيَّةُ إِتْقَانٍ لِتَعْلِيمِ وَتَحْفِيظِ القُرْآنِ الكَرِيمِ
            </h2>
            <p className="text-xs text-amber-900 font-bold tracking-widest uppercase">
              Official Certificate of Quranic Accomplishment
            </p>
          </div>

          {/* Main Title & Recipient Name */}
          <div className="space-y-4 py-2">
            <h3 className="text-2xl sm:text-3xl font-black font-serif text-amber-600">
              شَهَادَةُ تَقْدِيرٍ وَإِتْمَامِ حِفْظِ جُزْءٍ كَامِلٍ 📜
            </h3>

            <p className="text-xs text-slate-600 font-bold">
              تَشْهَدُ إِدَارَةُ الأَكَادِيمِيَّةِ وَالمَعْلِمَةُ المُشْرِفَةُ بِأَنَّ الطَّالِبَ / الحَافِظَ المُبَارَك:
            </p>

            <div className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-800 to-teal-900 text-amber-300 text-2xl sm:text-3xl font-black font-serif rounded-2xl shadow-lg border-2 border-amber-300">
              {studentName}
            </div>

            <p className="text-sm text-slate-800 font-bold leading-relaxed max-w-xl mx-auto font-serif">
              قَدْ أَتَمَّ بِمَنِّ اللَّهِ وَتَوْفِيقِهِ حِفْظَ وَتَثْبِيتَ <span className="text-emerald-800 font-extrabold underline">{juzTitle}</span> مِنَ القُرْآنِ الكَرِيمِ كَامِلاً مع الإِتْقَانِ وتَطْبِيقِ أَحْكَامِ التَّجْوِيدِ والتَّرْتِيلِ.
            </p>
          </div>

          {/* Date & Verification Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-amber-50/80 p-4 rounded-2xl border border-amber-200 text-xs font-bold text-slate-800">
            <div>
              <span className="text-slate-500 text-[10px] block">تاريخ الإتمام والاعتماد:</span>
              <span className="font-extrabold text-emerald-800 font-mono">{completionDate}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block">التقدير الممنوح:</span>
              <span className="font-extrabold text-amber-700">ممتاز جداً مع مرتبة الشرف 🏆</span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-500 text-[10px] block">الرقم التسلسلي للشهادة:</span>
              <span className="font-mono text-emerald-900 font-extrabold">{certificateSerialNumber}</span>
            </div>
          </div>

          {/* Official Signatures & Seal Footer */}
          <div className="pt-6 border-t-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
            <div className="text-center sm:text-right space-y-1">
              <span className="text-slate-500 font-bold block">توقيع المعلمة المشرفة:</span>
              <p className="font-serif italic font-black text-emerald-900 text-sm">أ. عائشة محمود العلي</p>
            </div>

            {/* Official Academy Gold Badge Stamp */}
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full p-3 shadow-xl border-4 border-amber-200 flex flex-col items-center justify-center text-slate-950 font-black text-[9px] text-center leading-tight shrink-0">
              <ShieldCheck className="w-6 h-6 text-slate-950 mb-0.5" />
              <span>معتمد</span>
              <span>أكاديمية إتقان</span>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <span className="text-slate-500 font-bold block">رئيس مجلس الأكاديمية:</span>
              <p className="font-serif italic font-black text-emerald-900 text-sm">أ.د. محمد بن سليمان العلي</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
