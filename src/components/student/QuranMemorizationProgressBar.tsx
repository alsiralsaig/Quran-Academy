import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Award, Plus, Sparkles, TrendingUp, Layers, BookmarkCheck, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ALL_SURAHS } from '../../data/quranData';
import { useApp } from '../../context/AppContext';
import { triggerFireworksCelebration } from '../achievements/AchievementCelebrationModal';

export interface MemorizedSurahEntry {
  surahNumber: number;
  surahName: string;
  numberOfAyahs: number;
  pageCount: number;
  dateCompleted: string;
}

interface QuranMemorizationProgressBarProps {
  studentName: string;
  onSurahAdded?: (surahName: string) => void;
}

export const QuranMemorizationProgressBar: React.FC<QuranMemorizationProgressBarProps> = ({
  studentName,
  onSurahAdded,
}) => {
  // سجل الحفظ الحقيقي للطالب — محفوظ في قاعدة البيانات مع حسابه
  const { userData, saveUserData } = useApp();
  const memorizedSurahs: MemorizedSurahEntry[] = Array.isArray(userData.memorized_surahs) ? userData.memorized_surahs : [];
  const setMemorizedSurahs = (list: MemorizedSurahEntry[]) => saveUserData('memorized_surahs', list);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(36); // Default Yasin

  // Total Quran Specs: 114 Surahs, 604 Pages, 30 Juz, 6236 Verses
  const TOTAL_QURAN_PAGES = 604;
  const TOTAL_SURAHS = 114;
  const TOTAL_VERSES = 6236;

  // Calculate stats
  const totalCompletedSurahsCount = memorizedSurahs.length;
  const totalCompletedPages = memorizedSurahs.reduce((acc, curr) => acc + curr.pageCount, 0);
  const totalCompletedVerses = memorizedSurahs.reduce((acc, curr) => acc + curr.numberOfAyahs, 0);

  const overallQuranPercentage = ((totalCompletedPages / TOTAL_QURAN_PAGES) * 100).toFixed(1);
  const completedJuzEquivalent = (totalCompletedPages / 20).toFixed(1); // Each Juz is approx 20 pages

  const handleAddSurahSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const foundSurah = ALL_SURAHS.find((s) => s.number === selectedSurahNumber);
    if (!foundSurah) return;

    // Check if already added
    if (memorizedSurahs.some((s) => s.surahNumber === foundSurah.number)) {
      alert(`سورة (${foundSurah.name}) مضافة مسبقاً إلى سجل حفظك!`);
      return;
    }

    const approxPages = Math.max(1, Math.round(foundSurah.numberOfAyahs / 12));

    const newEntry: MemorizedSurahEntry = {
      surahNumber: foundSurah.number,
      surahName: foundSurah.name,
      numberOfAyahs: foundSurah.numberOfAyahs,
      pageCount: approxPages,
      dateCompleted: new Date().toISOString().split('T')[0],
    };

    setMemorizedSurahs([newEntry, ...memorizedSurahs]);
    setShowAddModal(false);

    // Fire Multi-stage Fireworks Celebration
    triggerFireworksCelebration();

    if (onSurahAdded) {
      onSurahAdded(foundSurah.name);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl">
            <BookOpen className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                Quran Memorization Progress Gauge
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg font-serif">
              شريط نسبة حفظ القرآن الكريم كاملاً
            </h3>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          تسجيل سورة مكررة/مكتملة جديدة 🎉
        </button>
      </div>

      {/* Main Overall Progress Card */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-700 shadow-xl space-y-6 relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-lg">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full border border-amber-300">
              إنجاز الطالبة: {studentName}
            </span>
            <h4 className="text-2xl sm:text-3xl font-black font-serif text-amber-300">
              تم بفضل الله حفظ {overallQuranPercentage}% من القرآن الكريم
            </h4>
            <p className="text-emerald-100/90 text-xs leading-relaxed font-medium">
              التقدم مستمر بتوفيق الله ورعايته! تم إتمام <span className="font-bold text-amber-300">{completedJuzEquivalent} أجزاء</span> تعادل حوالي <span className="font-bold text-white">{totalCompletedPages} صفحة</span> من المصحف الشريف.
            </p>
          </div>

          <div className="text-center bg-emerald-900/80 p-5 rounded-2xl border border-emerald-700 shrink-0 min-w-[150px]">
            <span className="text-[11px] text-emerald-200 block font-semibold mb-1">نسبة الختم الكلية</span>
            <span className="text-4xl font-black font-serif text-amber-300 tracking-tight block">
              {overallQuranPercentage}%
            </span>
            <span className="text-[10px] text-emerald-300 block mt-1">تحديث آلي مباشر</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
            <span>البداية (سورة الفاتحة)</span>
            <span className="text-amber-300 font-extrabold">{totalCompletedPages} من {TOTAL_QURAN_PAGES} صفحة</span>
            <span>الختمة الكاملة (604 صفحة / 30 جزء)</span>
          </div>

          <div className="w-full bg-slate-950/80 h-5 rounded-full p-1 border border-emerald-600/80 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 h-full rounded-full transition-all duration-700 shadow-md relative"
              style={{ width: `${Math.max(3, Number(overallQuranPercentage))}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
            </div>
          </div>
        </div>

        {/* Breakdown Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs relative z-10">
          <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-700/80">
            <div className="flex items-center gap-1.5 text-amber-300 mb-1">
              <Layers className="w-4 h-4" />
              <span className="font-bold text-[11px]">الأجزاء المكتملة</span>
            </div>
            <span className="text-lg font-black text-white font-serif">{completedJuzEquivalent} / 30 جزء</span>
          </div>

          <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-700/80">
            <div className="flex items-center gap-1.5 text-amber-300 mb-1">
              <BookmarkCheck className="w-4 h-4" />
              <span className="font-bold text-[11px]">السور المحفوظة</span>
            </div>
            <span className="text-lg font-black text-white font-serif">{totalCompletedSurahsCount} / {TOTAL_SURAHS} سورة</span>
          </div>

          <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-700/80">
            <div className="flex items-center gap-1.5 text-amber-300 mb-1">
              <FileText className="w-4 h-4" />
              <span className="font-bold text-[11px]">الصفحات المحفوظة</span>
            </div>
            <span className="text-lg font-black text-white font-serif">{totalCompletedPages} / {TOTAL_QURAN_PAGES} صفحة</span>
          </div>

          <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-700/80">
            <div className="flex items-center gap-1.5 text-amber-300 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="font-bold text-[11px]">الآيات المحفوظة</span>
            </div>
            <span className="text-lg font-black text-white font-serif">{totalCompletedVerses} آية</span>
          </div>
        </div>

      </div>

      {/* Memorized Surahs List Pills */}
      <div className="space-y-3">
        <h4 className="font-extrabold text-slate-900 text-xs flex items-center justify-between border-b pb-2">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            سجل السور التي تم حفظها وتثبيتها بنجاح ({memorizedSurahs.length}):
          </span>
          <span className="text-[11px] text-slate-500 font-semibold">تُحدث شريط التقدم تلقائياً عند الإضافة</span>
        </h4>

        <div className="flex flex-wrap gap-2">
          {memorizedSurahs.map((surah) => (
            <div
              key={surah.surahNumber}
              className="bg-emerald-50 border border-emerald-200 text-emerald-950 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-sans text-[10px] font-black flex items-center justify-center">
                {surah.surahNumber}
              </span>
              <span>سورة {surah.surahName}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">({surah.numberOfAyahs} آية)</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add New Memorized Surah */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-emerald-100">
            <div className="border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg font-serif">
                تسجيل سورة جديدة في سجل الحفظ 📖
              </h3>
              <p className="text-xs text-slate-500">
                حدد السورة المكتملة لتحديث شريط التقدم وإضافة نقاط التقدير.
              </p>
            </div>

            <form onSubmit={handleAddSurahSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر السورة المكتملة:</label>
                <select
                  value={selectedSurahNumber}
                  onChange={(e) => setSelectedSurahNumber(Number(e.target.value))}
                  className="w-full p-3 border rounded-xl font-bold bg-white text-slate-900 focus:outline-none"
                >
                  {ALL_SURAHS.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. سورة {s.name} ({s.numberOfAyahs} آية)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-slate-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md"
                >
                  إضافة السورة وتحديث الشريط 🎉
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
