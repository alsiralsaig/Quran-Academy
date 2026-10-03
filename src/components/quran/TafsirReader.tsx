import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  Volume2,
  Copy,
  Check,
  Bookmark,
  Share2,
  X,
  Filter,
  Lightbulb,
  FileText
} from 'lucide-react';
import { QuranSurah, QuranAyah } from '../../types';

export interface TafsirReaderProps {
  surah: QuranSurah;
  ayahs: QuranAyah[];
  onPlayAudio?: (numberInSurah: number) => void;
  playingAyahNumber?: number | null;
}

export const TafsirReader: React.FC<TafsirReaderProps> = ({
  surah,
  ayahs,
  onPlayAudio,
  playingAyahNumber,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedAyahNumber, setCopiedAyahNumber] = useState<number | null>(null);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<number[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'bookmarked'>('all');

  // Filter Ayahs based on search query and bookmarks
  const filteredAyahs = ayahs.filter((ayah) => {
    const textMatches = ayah.text.toLowerCase().includes(searchQuery.toLowerCase());
    const numberMatches = ayah.numberInSurah.toString().includes(searchQuery);
    const tafsirMatches =
      ayah.tafsirText?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesSearch = textMatches || numberMatches || tafsirMatches;

    if (filterMode === 'bookmarked') {
      return matchesSearch && bookmarkedAyahs.includes(ayah.numberInSurah);
    }
    return matchesSearch;
  });

  const handleCopyAyahTafsir = (ayah: QuranAyah) => {
    const textToCopy = `﴿ ${ayah.text} ﴾ [سورة ${surah.name}: ${ayah.numberInSurah}]\n\n📖 التفسير الميسر:\n${ayah.tafsirText || 'التفسير الميسر المعتمد للآية الكريمة.'}\n\nتطبيق أكاديمية إتقان للقرآن الكريم`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAyahNumber(ayah.numberInSurah);
    setTimeout(() => setCopiedAyahNumber(null), 2000);
  };

  const toggleBookmark = (numberInSurah: number) => {
    if (bookmarkedAyahs.includes(numberInSurah)) {
      setBookmarkedAyahs(bookmarkedAyahs.filter((num) => num !== numberInSurah));
    } else {
      setBookmarkedAyahs([...bookmarkedAyahs, numberInSurah]);
    }
  };

  return (
    <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-6 border-2 border-emerald-600/40 shadow-2xl space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-emerald-950 text-emerald-300 text-xs font-black px-3.5 py-1 rounded-full border border-emerald-700">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>مكون قارئ التفسير الميسر آية بآية (TafsirReader) 📖</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-serif text-white">
            تفسير سورة {surah.name} آية بآية مع المحرك الذكي للبحث
          </h3>
          <p className="text-xs text-slate-400">
            عرض متسلسل لكافة آيات السورة الكريمة مقرونة بالتفسير الميسر المعتمد.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-emerald-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            جميع الآيات ({ayahs.length})
          </button>
          <button
            onClick={() => setFilterMode('bookmarked')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              filterMode === 'bookmarked'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            المحفوظة ({bookmarkedAyahs.length})
          </button>
        </div>
      </div>

      {/* SEARCH BAR SECTION */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-emerald-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في نص الآيات أو الشرح والتفسير الميسر (مثال: الله، النور، الرحمة)..."
          className="w-full pl-10 pr-12 py-3.5 bg-slate-950 text-white placeholder-slate-500 font-extrabold text-xs sm:text-sm rounded-2xl border border-emerald-600/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 focus:outline-none transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* SEARCH STATS BADGE */}
      {searchQuery && (
        <div className="flex items-center justify-between bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-800 text-xs text-emerald-300">
          <span>
            نتائج البحث عن كلمة "<strong className="text-amber-300">{searchQuery}</strong>":
          </span>
          <span className="font-mono font-black text-amber-400">
            {filteredAyahs.length} آيات مطابقة
          </span>
        </div>
      )}

      {/* AYAHS & TAFSIR LIST */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
        {filteredAyahs.length === 0 ? (
          <div className="text-center py-12 bg-slate-950 rounded-3xl border border-slate-800 space-y-3">
            <Search className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-400">لم يتم العثور على نتائج مطابقة للبحث.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-emerald-400 font-black underline hover:text-amber-300"
            >
              إلغاء البحث واستعراض كافة الآيات
            </button>
          </div>
        ) : (
          filteredAyahs.map((ayah) => {
            const isPlaying = playingAyahNumber === ayah.numberInSurah;
            const isBookmarked = bookmarkedAyahs.includes(ayah.numberInSurah);

            return (
              <div
                key={ayah.numberInSurah}
                className={`p-5 rounded-3xl border transition-all space-y-4 ${
                  isPlaying
                    ? 'bg-emerald-950 border-amber-400 ring-2 ring-amber-400/40 shadow-xl'
                    : 'bg-slate-950/90 border-slate-800 hover:border-emerald-700'
                }`}
              >
                {/* CARD HEADER */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 bg-emerald-900 text-amber-300 rounded-full font-black font-mono text-xs flex items-center justify-center border border-emerald-700">
                      {ayah.numberInSurah}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      سورة {surah.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onPlayAudio && (
                      <button
                        onClick={() => onPlayAudio(ayah.numberInSurah)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                          isPlaying
                            ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                            : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isPlaying ? 'جاري التلاوة...' : 'استماع'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => toggleBookmark(ayah.numberInSurah)}
                      className={`p-1.5 rounded-xl transition-all border ${
                        isBookmarked
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                      }`}
                      title={isBookmarked ? 'إزالة من المحفوظات' : 'حفظ الآية'}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      onClick={() => handleCopyAyahTafsir(ayah)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-all"
                      title="نسخ الآية والتفسير الميسر"
                    >
                      {copiedAyahNumber === ayah.numberInSurah ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* ARABIC AYAH TEXT */}
                <p
                  className="text-xl sm:text-2xl text-center leading-loose font-serif text-amber-200 py-1"
                  style={{ fontFamily: "'Amiri Quran', 'Scheherazade New', serif" }}
                  dir="rtl"
                >
                  ﴿ {ayah.text} ﴾
                </p>

                {/* EASY TAFSIR BOX */}
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-emerald-800/60 space-y-1.5 text-xs">
                  <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    التفسير الميسر:
                  </span>
                  <p className="text-slate-200 leading-relaxed font-sans font-medium text-justify">
                    {ayah.tafsirText ||
                      `تفسير ميسر للآية الكريمة (${ayah.numberInSurah}): بيان معاني الألفاظ ودلالاتها المباركة والتوجيهات الإيمانية من سورة ${surah.name}.`}
                  </p>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
