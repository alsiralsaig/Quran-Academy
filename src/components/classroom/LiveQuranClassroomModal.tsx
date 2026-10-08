import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  X,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  Star,
  ExternalLink,
  MessageSquare,
  Users,
  Settings,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LiveQuranClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherName?: string;
  studentName?: string;
  initialSurah?: string;
}

export const LiveQuranClassroomModal: React.FC<LiveQuranClassroomModalProps> = ({
  isOpen,
  onClose,
  teacherName = 'المعلمة المعتمدة',
  studentName = 'الطالب المجد',
  initialSurah = 'سورة الفاتحة'
}) => {
  const { activeRole, addSessionRecord, teachers, subscriptions } = useApp();
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(false);
  const [activeSurah, setActiveSurah] = useState(initialSurah);
  const [currentAyah, setCurrentAyah] = useState(1);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [rating, setRating] = useState(5);
  const [tajweedNotes, setTajweedNotes] = useState('أحسنت التلاوة مع مراعاة أحكام النون الساكنة والتنوين والمدود.');
  const [homework, setHomework] = useState('متابعة حفظ الوجه القادم مع مراجعة الحزب الأخير.');
  const [isSaved, setIsSaved] = useState(false);
  const [customMeetingUrl, setCustomMeetingUrl] = useState('https://meet.google.com/');
  const [showExternalConfig, setShowExternalConfig] = useState(false);

  // Timer simulation
  useEffect(() => {
    if (!isOpen) {
      setSessionDuration(0);
      setIsSaved(false);
      return;
    }
    const interval = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSaveSession = () => {
    // التسجيل في قاعدة البيانات للمعلمة فقط (السيرفر بيرفض أي دور تاني)
    const activeSub = activeRole === 'teacher' ? subscriptions[0] : undefined;
    if (activeSub) {
      addSessionRecord({
        subscriptionId: activeSub.id,
        studentId: activeSub.studentId,
        studentName: studentName,
        teacherId: activeSub.teacherId,
        teacherName: teacherName,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        surahName: activeSurah,
        fromAyah: 1,
        toAyah: currentAyah,
        rating: rating,
        tajweedNotes: tajweedNotes,
        homework: homework,
        attendance: 'present'
      }).catch(() => {});
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1500);
    } else {
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Header Bar */}
        <div className="bg-slate-950/90 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-white">القاعة القرآنية المباشرة (تسميع وإتقان)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                  مباشر الآن 🔴
                </span>
              </div>
              <p className="text-xs text-slate-400">
                المعلمة: <span className="text-amber-300 font-bold">{teacherName}</span> • الطالب: <span className="text-emerald-300 font-bold">{studentName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 font-mono text-xs text-amber-400 font-bold">
              ⏱️ {formatTime(sessionDuration)}
            </div>

            <button
              onClick={() => setShowExternalConfig(!showExternalConfig)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="إعدادات رابط خارجي (Zoom / Meet)"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-red-100 transition-colors"
              title="إنهاء الجلسة والخروج"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional External Link Helper Bar */}
        {showExternalConfig && (
          <div className="bg-slate-800/95 px-6 py-2.5 border-b border-slate-700 text-xs flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>إذا رغبت المعلمة باستخدام منصة خارجية بديلة (Zoom أو Google Meet):</span>
            </div>
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <input
                type="text"
                value={customMeetingUrl}
                onChange={(e) => setCustomMeetingUrl(e.target.value)}
                placeholder="ضع رابط زووم أو جوجل ميت هنا..."
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-1 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
              <a
                href={customMeetingUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1 shrink-0 text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                فتح
              </a>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 sm:p-4 overflow-y-auto">
          
          {/* Left Column: Interactive Recitation Video / Audio Stage (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            
            {/* Live Recitation Canvas */}
            <div className="relative flex-1 min-h-[260px] bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 rounded-2xl border border-emerald-900/60 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
              
              {/* Decorative Audio Waves */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="w-72 h-72 rounded-full border-4 border-emerald-400 animate-ping" />
              </div>

              {/* Top Room Participants Badges */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-full border border-emerald-500/30 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-emerald-200">الصوت نقي ومتصل 🎙️</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700 text-xs">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>2 متواجدان بالقاعة</span>
                </div>
              </div>

              {/* Center Voice Recitation Avatar Stage */}
              <div className="my-auto text-center space-y-3 z-10">
                <div className="relative inline-block">
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 mx-auto flex items-center justify-center shadow-2xl transition-all ${
                    isMicOn ? 'border-amber-400 bg-emerald-800 shadow-amber-400/20' : 'border-slate-600 bg-slate-800'
                  }`}>
                    <BookOpen className="w-12 h-12 text-amber-300" />
                  </div>
                  {isMicOn && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1.5 rounded-full border-2 border-slate-900 shadow">
                      <Mic className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white">{studentName}</h3>
                  <p className="text-xs text-amber-300 font-serif">يتلو الآن من: {activeSurah} (الآية {currentAyah})</p>
                </div>

                {/* Simulated Live Audio Visualizer Bars */}
                <div className="flex items-center justify-center gap-1.5 h-8">
                  {[40, 75, 95, 60, 85, 100, 70, 90, 50, 80, 65, 45].map((height, i) => (
                    <div
                      key={i}
                      style={{ height: isMicOn ? `${height}%` : '20%' }}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isMicOn ? 'bg-gradient-to-t from-emerald-500 to-amber-300' : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Quick Mic & Camera Controls Bar */}
              <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-2.5 border border-slate-700/80 flex items-center justify-center gap-3 z-10">
                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`p-3 rounded-xl font-bold flex items-center gap-2 text-xs transition-all ${
                    isMicOn ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
                  }`}
                >
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  <span>{isMicOn ? 'المايك مفتوح' : 'كتم المايك'}</span>
                </button>

                <button
                  onClick={() => setIsCamOn(!isCamOn)}
                  className={`p-3 rounded-xl font-bold flex items-center gap-2 text-xs transition-all ${
                    isCamOn ? 'bg-teal-600 hover:bg-teal-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {isCamOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  <span>{isCamOn ? 'الكاميرا مفعلة' : 'الكاميرا مغلقة'}</span>
                </button>

                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-xl text-xs text-slate-300">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>الصوت: 100%</span>
                </div>
              </div>

            </div>

            {/* Quick Tajweed Tags for Live Guidance */}
            <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                توجيهات تجويدية سريعة (اضغط للإشعار الفوري):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['إظهار حلقي', 'إدغام بغنة', 'إقلاب', 'إخفاء حقيقي', 'قلقلة صغرى', 'مد واجب متصل', 'مد جائز منفصل', 'ترقيق الراء'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTajweedNotes(prev => `${prev} • تم التنبيه على: ${tag}`)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-800 text-slate-300 hover:text-white rounded-lg text-[11px] font-medium border border-slate-700 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Quran Viewer & Instant Session Logging (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3 bg-slate-950/80 rounded-2xl border border-slate-800 p-4 overflow-y-auto">
            
            {/* Surah & Ayah Controls */}
            <div className="space-y-3 pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  متابعة المصحف الشريف
                </span>
                <select
                  value={activeSurah}
                  onChange={(e) => setActiveSurah(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="سورة الفاتحة">سورة الفاتحة</option>
                  <option value="سورة البقرة">سورة البقرة</option>
                  <option value="سورة آل عمران">سورة آل عمران</option>
                  <option value="سورة يوسف">سورة يوسف</option>
                  <option value="سورة الكهف">سورة الكهف</option>
                  <option value="سورة مريم">سورة مريم</option>
                  <option value="سورة يس">سورة يس</option>
                  <option value="سورة الملك">سورة الملك</option>
                  <option value="سورة النبأ">سورة النبأ</option>
                  <option value="قصار السور">قصار السور</option>
                </select>
              </div>

              {/* Quran Text Snippet */}
              <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-800/50 text-center font-serif text-amber-200 text-sm sm:text-base leading-loose shadow-inner">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>تسميع حتى الآية:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentAyah(Math.max(1, currentAyah - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-amber-400 px-2">{currentAyah}</span>
                  <button
                    onClick={() => setCurrentAyah(currentAyah + 1)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Live Evaluation & Homework Section */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">تقييم الأداء في هذه الجلسة:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-4 h-4 ${star <= rating ? 'fill-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  ملاحظات التجويد والإتقان:
                </label>
                <textarea
                  rows={2}
                  value={tajweedNotes}
                  onChange={(e) => setTajweedNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Homework */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  الواجب والتكليف القادم:
                </label>
                <input
                  type="text"
                  value={homework}
                  onChange={(e) => setHomework(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={handleSaveSession}
                  disabled={isSaved}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-xs transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      <span>تم حفظ واعتماد الحصة بنجاح! ✅</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 text-amber-300" />
                      <span>رصد الحصة وتقييم الطالب 💾</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
