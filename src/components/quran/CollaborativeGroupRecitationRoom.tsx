import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Mic,
  MicOff,
  Hand,
  Award,
  Sparkles,
  Volume2,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Play,
  Pause,
  Star,
  CheckCircle2,
  Send,
  Shield,
  BookOpen,
  Share2,
  RotateCcw,
  PenTool,
  Highlighter,
  Eraser,
  Trash2,
  Palette
} from 'lucide-react';
import { ALL_SURAHS, SAMPLE_SURAHS_AYAS } from '../../data/quranData';
import { QuranSurah, QuranAyah, UserRole } from '../../types';

export interface RoomParticipant {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  avatar: string;
  isMicOn: boolean;
  isReciting: boolean;
  hasHandRaised: boolean;
  points: number;
}

export interface LiveChatMessage {
  id: string;
  senderName: string;
  senderRole: 'teacher' | 'student';
  text: string;
  timestamp: string;
}

export interface TajweedHighlight {
  wordIndex: number;
  color: 'amber' | 'emerald' | 'rose' | 'sky' | 'purple';
  ruleLabel?: string;
}

interface CollaborativeGroupRecitationRoomProps {
  userRole: UserRole;
  userName: string;
}

import { AVATAR_TEACHER_1, AVATAR_STUDENT_1, AVATAR_STUDENT_2 } from '../../data/initialState';

const INITIAL_PARTICIPANTS: RoomParticipant[] = [
  { id: 'p_teacher', name: 'المعلمة عائشة العلي', role: 'teacher', avatar: AVATAR_TEACHER_1, isMicOn: true, isReciting: false, hasHandRaised: false, points: 500 },
  { id: 'p_1', name: 'فاطمة الشمري (طالبة)', role: 'student', avatar: AVATAR_STUDENT_1, isMicOn: true, isReciting: true, hasHandRaised: false, points: 180 },
  { id: 'p_2', name: 'مريم الدوسري (طالبة)', role: 'student', avatar: AVATAR_STUDENT_2, isMicOn: false, isReciting: false, hasHandRaised: true, points: 150 },
  { id: 'p_3', name: 'سارة القحطاني (طالبة)', role: 'student', avatar: AVATAR_STUDENT_1, isMicOn: false, isReciting: false, hasHandRaised: false, points: 120 },
  { id: 'p_4', name: 'نورة الغامدي (طالبة)', role: 'student', avatar: AVATAR_STUDENT_2, isMicOn: false, isReciting: false, hasHandRaised: false, points: 210 },
];

export const CollaborativeGroupRecitationRoom: React.FC<CollaborativeGroupRecitationRoomProps> = ({
  userRole,
  userName,
}) => {
  // Session State
  const [participants, setParticipants] = useState<RoomParticipant[]>(INITIAL_PARTICIPANTS);
  const [selectedSurah, setSelectedSurah] = useState<QuranSurah>(ALL_SURAHS[0]); // Default Al-Fatiha or Al-Baqarah
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [handRaised, setHandRaised] = useState<boolean>(false);
  const [activeReciterId, setActiveReciterId] = useState<string>('p_1');

  // Interactive Whiteboard & Pen Tools
  const [isWhiteboardActive, setIsWhiteboardActive] = useState<boolean>(true);
  const [selectedPenColor, setSelectedPenColor] = useState<'amber' | 'emerald' | 'rose' | 'sky' | 'purple'>('amber');
  const [wordHighlights, setWordHighlights] = useState<Record<number, 'amber' | 'emerald' | 'rose' | 'sky' | 'purple'>>({});
  const [drawings, setDrawings] = useState<{ id: number; path: string; color: string }[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>('');
  const svgRef = useRef<SVGSVGElement>(null);

  // Live Chat & Reaction Floating Animations
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([
    { id: 'm1', senderName: 'أ. عائشة محمود العلي', senderRole: 'teacher', text: 'أهلاً وسهلاً بكُنَّ في حلقة المراجعة الجماعية المزامنة. استخدموا قلم التظليل لتحديد أحكام التجويد.', timestamp: '10:00 م' },
    { id: 'm2', senderName: 'فاطمة الشمري', senderRole: 'student', text: 'أعوذ بالله من الشيطان الرجيم، بسم الله الرحمن الرحيم...', timestamp: '10:01 م' },
  ]);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);

  // Sample Ayahs for current Surah
  const surahAyahs: QuranAyah[] = SAMPLE_SURAHS_AYAS[selectedSurah.number]?.ayahs || [
    { numberInSurah: 1, text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' },
    { numberInSurah: 2, text: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ' },
    { numberInSurah: 3, text: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' },
    { numberInSurah: 4, text: 'مَٰلِكِ يَوْمِ ٱلدِّينِ' },
    { numberInSurah: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
    { numberInSurah: 6, text: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ' },
    { numberInSurah: 7, text: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّالِّينَ' },
  ];

  const currentAyah = surahAyahs[currentAyahIndex] || surahAyahs[0];
  const activeReciter = participants.find((p) => p.id === activeReciterId) || participants[1];
  const ayahWords = currentAyah.text.split(' ');

  // Toggle Word Highlight
  const handleWordClick = (index: number) => {
    if (!isWhiteboardActive) return;
    setWordHighlights((prev) => {
      if (prev[index] === selectedPenColor) {
        const next = { ...prev };
        delete next[index];
        return next;
      }
      return { ...prev, [index]: selectedPenColor };
    });
  };

  // Freehand SVG Drawing Logic
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isWhiteboardActive || userRole !== 'teacher') return;
    setIsDrawing(true);
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCurrentPath(`M ${x} ${y}`);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !isWhiteboardActive) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCurrentPath((prev) => `${prev} L ${x} ${y}`);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentPath) {
      const hexColorMap = {
        amber: '#f59e0b',
        emerald: '#10b981',
        rose: '#f43f5e',
        sky: '#0284c7',
        purple: '#a855f7',
      };
      setDrawings((prev) => [...prev, { id: Date.now(), path: currentPath, color: hexColorMap[selectedPenColor] }]);
      setCurrentPath('');
    }
    setIsDrawing(false);
  };

  // Clear Whiteboard Annotations
  const handleClearWhiteboard = () => {
    setWordHighlights({});
    setDrawings([]);
  };

  // Send Floating Emoji Reaction
  const handleSendReaction = (emoji: string) => {
    const reactionId = Date.now();
    const randomX = Math.floor(Math.random() * 80) + 10;
    setFloatingReactions((prev) => [...prev, { id: reactionId, emoji, x: randomX }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== reactionId));
    }, 2500);
  };

  // Send Chat Message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessageText.trim()) return;

    const msg: LiveChatMessage = {
      id: Date.now().toString(),
      senderName: userName || (userRole === 'teacher' ? 'المعلمة المشرفة' : 'طالبة القاعة'),
      senderRole: userRole === 'teacher' ? 'teacher' : 'student',
      text: newMessageText.trim(),
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, msg]);
    setNewMessageText('');
  };

  // Advance to next verse (Synchronized)
  const handleNextAyah = () => {
    if (currentAyahIndex < surahAyahs.length - 1) {
      setCurrentAyahIndex((prev) => prev + 1);
    }
  };

  // Go to previous verse
  const handlePrevAyah = () => {
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex((prev) => prev - 1);
    }
  };

  // Pass Turn to next participant
  const handlePassTurnToNext = () => {
    const studentParticipants = participants.filter((p) => p.role === 'student');
    const currentIndex = studentParticipants.findIndex((p) => p.id === activeReciterId);
    const nextIndex = (currentIndex + 1) % studentParticipants.length;
    const nextReciter = studentParticipants[nextIndex];

    setActiveReciterId(nextReciter.id);
    setParticipants((prev) =>
      prev.map((p) => ({
        ...p,
        isReciting: p.id === nextReciter.id,
      }))
    );
  };

  return (
    <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-8 border border-emerald-200 dark:border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
      
      {/* FLOATING REACTION EMOJIS LAYER */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {floatingReactions.map((reaction) => (
          <div
            key={reaction.id}
            style={{ left: `${reaction.x}%` }}
            className="absolute bottom-10 text-3xl animate-bounce duration-1000 transition-all opacity-90 scale-125"
          >
            {reaction.emoji}
          </div>
        ))}
      </div>

      {/* HEADER BANNER & ROOM STATUS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 text-xs font-extrabold px-3.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>جلسة قراءة جماعية متزامنة مباشرة (Live Sync) 🎙️</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-serif text-slate-900 dark:text-white">
            غرفة التلاوة والمراجعة الجماعية
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            النص القرآني المظلل يظهر للجميع بالتزامن المباشر تحت إشراف معلمة الحلقة.
          </p>
        </div>

        {/* Room Controls Header */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Surah Selector Dropdown */}
          <select
            value={selectedSurah.number}
            onChange={(e) => {
              const surah = ALL_SURAHS.find((s) => s.number === Number(e.target.value));
              if (surah) {
                setSelectedSurah(surah);
                setCurrentAyahIndex(0);
              }
            }}
            className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-xs px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
          >
            {ALL_SURAHS.map((s) => (
              <option key={s.number} value={s.number}>
                سورة {s.name} ({s.numberOfAyahs} آية)
              </option>
            ))}
          </select>

          {/* Raise Hand Toggle */}
          <button
            onClick={() => setHandRaised(!handRaised)}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 border transition-all ${
              handRaised
                ? 'bg-amber-400 text-slate-950 border-amber-500 ring-2 ring-amber-400/50 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Hand className="w-4 h-4 text-amber-600" />
            <span>{handRaised ? 'تم رفع اليد ✋' : 'رفع اليد للاستئذان'}</span>
          </button>

          {/* Mic Mute Toggle */}
          <button
            onClick={() => setIsMicMuted(!isMicMuted)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 border transition-all ${
              isMicMuted
                ? 'bg-rose-600 text-white border-rose-700 shadow-md'
                : 'bg-emerald-700 text-white border-emerald-800 shadow-md'
            }`}
          >
            {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 animate-pulse" />}
            <span>{isMicMuted ? 'المايك مكتوم' : 'الميكروفون يعمل 🎙️'}</span>
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT: SYNCHRONIZED QURAN BOARD (2/3) & PARTICIPANTS/CHAT (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SYNCHRONIZED QURAN BOARD & LIVE RECITER BANNER (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Reciter Banner Card */}
          <div className="p-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 rounded-2xl shadow-lg border border-amber-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={activeReciter.avatar}
                  alt={activeReciter.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-950 shadow-md"
                />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-1 -right-1 animate-ping" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-slate-900 block">القارئة الحالية المباشرة 🎤:</span>
                <h4 className="font-extrabold text-base font-serif text-slate-950">{activeReciter.name}</h4>
                <p className="text-[11px] font-bold text-slate-800">
                  تتلو الآن سورة {selectedSurah.name} (الآية {currentAyah.numberInSurah})
                </p>
              </div>
            </div>

            {/* Pass Turn Button (Teacher / Moderator Controls) */}
            {(userRole === 'teacher' || activeReciter.name === userName) && (
              <button
                onClick={handlePassTurnToNext}
                className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-amber-300 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 shrink-0"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>تمرير الدور للقارئة التالية 🎤</span>
              </button>
            )}
          </div>

          {/* SYNCHRONIZED QURANIC TEXT CARD & INTERACTIVE WHITEBOARD */}
          <div className="p-6 sm:p-10 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/50 dark:from-slate-900 dark:to-slate-950 rounded-3xl border-2 border-amber-300 dark:border-slate-800 shadow-xl text-center space-y-6 relative overflow-hidden">
            
            {/* Header Title & Whiteboard Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-full border border-amber-300">
                  سورة {selectedSurah.name} • الآية ({currentAyah.numberInSurah} من {selectedSurah.numberOfAyahs})
                </span>
                <p className="text-sm font-serif font-bold text-amber-900 dark:text-amber-200 pt-1">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
              </div>

              {/* DIGITAL PEN & WHITEBOARD TOOLBAR */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 p-2 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md">
                <span className="text-[10px] font-bold text-amber-300 px-2 flex items-center gap-1">
                  <PenTool className="w-3.5 h-3.5 text-amber-400" />
                  السبورة والقلم:
                </span>

                {/* Tajweed Color Highlighters */}
                <button
                  onClick={() => setSelectedPenColor('amber')}
                  className={`p-1.5 rounded-xl transition-all ${
                    selectedPenColor === 'amber' ? 'ring-2 ring-white scale-110 bg-amber-500' : 'bg-amber-500/60 hover:bg-amber-500'
                  }`}
                  title="تظليل المدود (ذهبي)"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-300 block" />
                </button>

                <button
                  onClick={() => setSelectedPenColor('emerald')}
                  className={`p-1.5 rounded-xl transition-all ${
                    selectedPenColor === 'emerald' ? 'ring-2 ring-white scale-110 bg-emerald-600' : 'bg-emerald-600/60 hover:bg-emerald-600'
                  }`}
                  title="تظليل الإخفاء والغنة (أخضر)"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-300 block" />
                </button>

                <button
                  onClick={() => setSelectedPenColor('rose')}
                  className={`p-1.5 rounded-xl transition-all ${
                    selectedPenColor === 'rose' ? 'ring-2 ring-white scale-110 bg-rose-600' : 'bg-rose-600/60 hover:bg-rose-600'
                  }`}
                  title="تظليل القلقلة (أحمر)"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-300 block" />
                </button>

                <button
                  onClick={() => setSelectedPenColor('sky')}
                  className={`p-1.5 rounded-xl transition-all ${
                    selectedPenColor === 'sky' ? 'ring-2 ring-white scale-110 bg-sky-600' : 'bg-sky-600/60 hover:bg-sky-600'
                  }`}
                  title="تظليل الإظهار (أزرق)"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-sky-300 block" />
                </button>

                <button
                  onClick={() => setSelectedPenColor('purple')}
                  className={`p-1.5 rounded-xl transition-all ${
                    selectedPenColor === 'purple' ? 'ring-2 ring-white scale-110 bg-purple-600' : 'bg-purple-600/60 hover:bg-purple-600'
                  }`}
                  title="تظليل الإدغام والإقلاب (بنفسجي)"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-300 block" />
                </button>

                <button
                  onClick={handleClearWhiteboard}
                  className="p-1.5 bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded-xl text-[10px] font-bold flex items-center gap-1"
                  title="مسح السبورة والتظليلات"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>مسح</span>
                </button>
              </div>

            </div>

            {/* SYNCHRONIZED GLOWING AYAH BOARD WITH INTERACTIVE WORD HIGHLIGHTING */}
            <div className="py-8 px-6 bg-white/95 dark:bg-slate-950/95 rounded-2xl border-2 border-emerald-500 ring-4 ring-emerald-500/20 shadow-2xl space-y-4 relative min-h-[160px] flex items-center justify-center">
              
              {/* SVG Freehand Drawing Layer Overlay */}
              <svg
                ref={svgRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="absolute inset-0 w-full h-full z-20 cursor-crosshair pointer-events-auto"
              >
                {drawings.map((draw) => (
                  <path
                    key={draw.id}
                    d={draw.path}
                    stroke={draw.color}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                ))}
                {currentPath && (
                  <path
                    d={currentPath}
                    stroke={
                      selectedPenColor === 'amber'
                        ? '#f59e0b'
                        : selectedPenColor === 'emerald'
                        ? '#10b981'
                        : selectedPenColor === 'rose'
                        ? '#f43f5e'
                        : selectedPenColor === 'sky'
                        ? '#0284c7'
                        : '#a855f7'
                    }
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                )}
              </svg>

              {/* Clickable Word-by-Word Quranic Verse */}
              <div
                style={{ fontFamily: "'Amiri Quran', serif", lineHeight: 2.6 }}
                className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-amber-100 leading-relaxed text-center tracking-wide relative z-10 flex flex-wrap justify-center items-center gap-2"
              >
                {ayahWords.map((word, index) => {
                  const highlightColor = wordHighlights[index];
                  let highlightClasses = 'px-1.5 py-0.5 rounded-xl transition-all cursor-pointer hover:bg-amber-100 dark:hover:bg-slate-800';

                  if (highlightColor === 'amber') {
                    highlightClasses = 'px-2 py-0.5 rounded-xl bg-amber-300 text-slate-950 ring-2 ring-amber-400 font-extrabold shadow-md animate-pulse';
                  } else if (highlightColor === 'emerald') {
                    highlightClasses = 'px-2 py-0.5 rounded-xl bg-emerald-500 text-white ring-2 ring-emerald-400 font-extrabold shadow-md animate-pulse';
                  } else if (highlightColor === 'rose') {
                    highlightClasses = 'px-2 py-0.5 rounded-xl bg-rose-500 text-white ring-2 ring-rose-400 font-extrabold shadow-md animate-pulse';
                  } else if (highlightColor === 'sky') {
                    highlightClasses = 'px-2 py-0.5 rounded-xl bg-sky-500 text-white ring-2 ring-sky-400 font-extrabold shadow-md animate-pulse';
                  } else if (highlightColor === 'purple') {
                    highlightClasses = 'px-2 py-0.5 rounded-xl bg-purple-500 text-white ring-2 ring-purple-400 font-extrabold shadow-md animate-pulse';
                  }

                  return (
                    <span
                      key={index}
                      onClick={() => handleWordClick(index)}
                      className={highlightClasses}
                      title="انقر لتظليل الكلمة وتوضيح الحكم"
                    >
                      {word}
                    </span>
                  );
                })}

                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-sm mx-2 align-middle shadow-md font-sans">
                  {currentAyah.numberInSurah}
                </span>
              </div>

            </div>

            {/* Synchronized Navigation Controls */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                onClick={handlePrevAyah}
                disabled={currentAyahIndex === 0}
                className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-2xl transition-all shadow-sm flex items-center gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                <span>الآية السابقة</span>
              </button>

              <span className="text-xs font-extrabold text-slate-500 font-mono">
                {currentAyahIndex + 1} / {surahAyahs.length}
              </span>

              <button
                onClick={handleNextAyah}
                disabled={currentAyahIndex === surahAyahs.length - 1}
                className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2"
              >
                <span>الآية التالية</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Live Encouragement Stickers Toolbar */}
            <div className="pt-4 border-t border-amber-200/80 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-bold text-slate-500 pl-2">إرسال تفاعل وتشجيع للقارئة:</span>
              <button
                onClick={() => handleSendReaction('🌟')}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-transform hover:scale-110"
              >
                ما شاء الله 🌟
              </button>
              <button
                onClick={() => handleSendReaction('👏')}
                className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-transform hover:scale-110"
              >
                ترتيل شجي 👏
              </button>
              <button
                onClick={() => handleSendReaction('👑')}
                className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-bold transition-transform hover:scale-110"
              >
                تجويد متقن 👑
              </button>
              <button
                onClick={() => handleSendReaction('🤲')}
                className="px-3 py-1.5 bg-teal-100 hover:bg-teal-200 text-teal-900 rounded-xl text-xs font-bold transition-transform hover:scale-110"
              >
                فتح الله عليكِ 🤲
              </button>
            </div>

          </div>

        </div>

        {/* SIDEBAR (4 cols): ROOM PARTICIPANTS & LIVE CHAT */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* PARTICIPANTS ROSTER CARD */}
          <div className="bg-slate-50 dark:bg-slate-900/80 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm font-serif flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                الحاضرات بالقاعة ({participants.length})
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                نشط الآن
              </span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between ${
                    participant.id === activeReciterId
                      ? 'bg-amber-100/90 dark:bg-amber-950/60 border-amber-400 font-bold'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-8 h-8 rounded-xl object-cover border"
                    />
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                        {participant.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        {participant.role === 'teacher' ? 'المعلمة المشرفة 👑' : `${participant.points} نقطة`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {participant.hasHandRaised && (
                      <span className="text-amber-500 font-bold text-xs" title="استئذان بالإجابة">
                        ✋
                      </span>
                    )}

                    {participant.isReciting ? (
                      <span className="p-1 bg-emerald-500 text-white rounded-lg animate-pulse" title="تقرأ حالياً">
                        <Volume2 className="w-3.5 h-3.5" />
                      </span>
                    ) : participant.isMicOn ? (
                      <span className="p-1 text-emerald-600" title="المايك مفتوح">
                        <Mic className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 text-slate-400" title="مكتوم">
                        <MicOff className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LIVE ROOM CHAT & TAJWEED FEEDBACK */}
          <div className="bg-slate-50 dark:bg-slate-900/80 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between min-h-[300px]">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm font-serif flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  المحادثة وملاحظات التجويد المباشرة
                </h4>
              </div>

              {/* Messages Log */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`font-black ${msg.senderRole === 'teacher' ? 'text-amber-600' : 'text-emerald-700 dark:text-emerald-400'}`}>
                        {msg.senderName}
                      </span>
                      <span className="text-slate-400">{msg.timestamp}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-sans font-medium">{msg.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="اكتب ملاحظة أو تشجيعاً..."
                className="w-full p-2.5 bg-white dark:bg-slate-950 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-bold"
              />
              <button
                type="submit"
                className="p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>

        </div>

      </div>

    </div>
  );
};
