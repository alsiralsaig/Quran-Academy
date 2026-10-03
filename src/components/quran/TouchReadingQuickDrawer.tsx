import React from 'react';
import {
  Play,
  Pause,
  BookOpen,
  Sparkles,
  Search,
  Copy,
  Check,
  X,
  Volume2,
  FileText,
  Bookmark,
  Share2,
  ChevronLeft
} from 'lucide-react';
import { QuranAyah } from '../../types';

export interface TouchReadingQuickDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  surahName: string;
  surahNumber: number;
  ayah: QuranAyah;
  isPlaying: boolean;
  onPlayAudio: () => void;
  onPauseAudio: () => void;
  onOpenTafsir: () => void;
  onOpenNote: () => void;
  onOpenSimilarVerses: () => void;
  onCopyText: () => void;
  isCopied: boolean;
}

export const TouchReadingQuickDrawer: React.FC<TouchReadingQuickDrawerProps> = ({
  isOpen,
  onClose,
  surahName,
  surahNumber,
  ayah,
  isPlaying,
  onPlayAudio,
  onPauseAudio,
  onOpenTafsir,
  onOpenNote,
  onOpenSimilarVerses,
  onCopyText,
  isCopied,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-full sm:w-96 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-2xl border-r border-amber-300 dark:border-slate-800 p-6 flex flex-col justify-between animate-in slide-in-from-left duration-300">
      
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-400 text-slate-950 rounded-xl font-extrabold text-xs">
              القراءة باللمس 👆
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm font-serif">
                آية ({ayah.numberInSurah}) - سورة {surahName}
              </h3>
              <span className="text-[10px] text-slate-400 font-bold block">خيارات سريعة للتحكم والتأمل</span>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Ayah Preview Card */}
        <div className="p-4 bg-amber-50 dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 block">النص القرآني المظلل:</span>
          <p className="font-serif font-black text-slate-900 dark:text-amber-100 text-base leading-relaxed text-justify">
            "{ayah.text}"
          </p>
        </div>

        {/* Quick Action Buttons List */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-500 block">الخيارات السريعة للآية:</span>

          {/* 1. Play / Pause Audio Recitation */}
          <button
            onClick={() => {
              if (isPlaying) {
                onPauseAudio();
              } else {
                onPlayAudio();
              }
            }}
            className={`w-full p-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-between border shadow-sm transition-all ${
              isPlaying
                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-400/50'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-600'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'إيقاف التلاوة المزامنة' : 'الاستماع للتلاوة العطرة 🎧'}</span>
            </div>
            <Volume2 className="w-4 h-4 text-amber-300" />
          </button>

          {/* 2. Tafsir & AI Reflection */}
          <button
            onClick={() => {
              onOpenTafsir();
              onClose();
            }}
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl font-extrabold text-xs flex items-center justify-between border border-slate-200 dark:border-slate-800 shadow-xs transition-all"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>التفسير الميسر والتدبر الذكي 📖</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>

          {/* 3. Add Annotation Note */}
          <button
            onClick={() => {
              onOpenNote();
              onClose();
            }}
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl font-extrabold text-xs flex items-center justify-between border border-slate-200 dark:border-slate-800 shadow-xs transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>إضافة ملاحظة وتدوين شخصي 📝</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>

          {/* 4. Similar Verses Finder */}
          <button
            onClick={() => {
              onOpenSimilarVerses();
              onClose();
            }}
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl font-extrabold text-xs flex items-center justify-between border border-slate-200 dark:border-slate-800 shadow-xs transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-amber-500" />
              <span>البحث عن المتشابهات اللفظية 🔍</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>

          {/* 5. Copy Ayah Text */}
          <button
            onClick={onCopyText}
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl font-extrabold text-xs flex items-center justify-between border border-slate-200 dark:border-slate-800 shadow-xs transition-all"
          >
            <div className="flex items-center gap-2.5">
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{isCopied ? 'تم نسخ النص القرآني' : 'نسخ نص الآية الكريمة 📋'}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer Close Button */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all"
        >
          إغلاق النافذة الجانبية
        </button>
      </div>

    </div>
  );
};
