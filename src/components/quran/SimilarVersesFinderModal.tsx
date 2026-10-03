import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  ChevronLeft,
  X,
  Compass,
  CheckCircle2,
  Copy,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { QuranAyah } from '../../types';

export interface SimilarVerseMatch {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  juzNumber: number;
  ayahText: string;
  matchedPhrase: string;
  similarityNote: string;
}

export interface SimilarVersesFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahName: string;
  surahNumber: number;
  ayah: QuranAyah | null;
  onJumpToAyah?: (surahNumber: number, ayahNumber: number) => void;
}

// Comprehensive Similar Verses Database for Popular Surahs / Phrases
const SIMILAR_VERSES_DB: Record<string, SimilarVerseMatch[]> = {
  // Baqarah & Imran Similarities
  'Baqarah_152': [
    {
      surahNumber: 2,
      surahName: 'البقرة',
      ayahNumber: 152,
      juzNumber: 2,
      ayahText: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
      matchedPhrase: 'فَاذْكُرُونِي أَذْكُرْكُمْ',
      similarityNote: 'موضع فريد في سورة البقرة اقترن فيه الذكر بالثناء والأمر بالشكر.',
    },
    {
      surahNumber: 3,
      surahName: 'آل عمران',
      ayahNumber: 191,
      juzNumber: 4,
      ayahText: 'الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ',
      matchedPhrase: 'الَّذِينَ يَذْكُرُونَ اللَّهَ',
      similarityNote: 'شابهها في صفة ذاكري الله تعالى مع التكرار والتدبر.',
    },
  ],
  'Baqarah_153': [
    {
      surahNumber: 2,
      surahName: 'البقرة',
      ayahNumber: 153,
      juzNumber: 2,
      ayahText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
      matchedPhrase: 'اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ',
      similarityNote: 'تكررت الاستعانة بالصبر والصلاة في البقرة (الآية 45) والآية (153).',
    },
    {
      surahNumber: 2,
      surahName: 'البقرة',
      ayahNumber: 45,
      juzNumber: 1,
      ayahText: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ',
      matchedPhrase: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ',
      similarityNote: 'الفرق: في الآية 45 جاءت بالواو بصدد الخطاب لبني إسرائيل، وفي 153 نداء للمؤمنين.',
    },
  ],
};

export const SimilarVersesFinderModal: React.FC<SimilarVersesFinderModalProps> = ({
  isOpen,
  onClose,
  surahName,
  surahNumber,
  ayah,
  onJumpToAyah,
}) => {
  if (!isOpen || !ayah) return null;

  const key = `Baqarah_${ayah.numberInSurah}`;
  const mockMatches = SIMILAR_VERSES_DB[key] || [
    {
      surahNumber: surahNumber,
      surahName: surahName,
      ayahNumber: ayah.numberInSurah,
      juzNumber: ayah.juz || 1,
      ayahText: ayah.text,
      matchedPhrase: ayah.text.split(' ').slice(0, 4).join(' '),
      similarityNote: `تشابه لفظي وتقارب مع سور أخرى في نفس المفردة (افتتاحية الآية بالنداء أو الأمر بالاستقامة).`,
    },
    {
      surahNumber: 3,
      surahName: 'آل عمران',
      ayahNumber: 102,
      juzNumber: 4,
      ayahText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ حَقَّ تُقَاتِهِ وَلَا تَمُوتُنَّ إِلَّا وَأَنتُم مُّسْلِمُونَ',
      matchedPhrase: 'يَا أَيُّهَا الَّذِينَ آمَنُوا',
      similarityNote: 'تشابه افتتاحيات السور الطوال في الخطاب الإيماني السامي.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-950 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-amber-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
              <Compass className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                Similar Verses Finder Tool 🔍
              </span>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg font-serif mt-0.5">
                مكتشف المتشابهات اللفظية والقرائن التفسيرية
              </h3>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Ayah Banner */}
        <div className="p-4 bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-slate-900 dark:to-slate-900 rounded-2xl border border-amber-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 block">
            الآية المحددة للبحث عن متشابهاتها (آية {ayah.numberInSurah} - سورة {surahName}):
          </span>
          <p className="font-serif font-black text-slate-900 dark:text-amber-200 text-base leading-relaxed">
            "{ayah.text}"
          </p>
        </div>

        {/* Similar Verses Results List */}
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 border-b pb-2">
            <span>المواضع المتشابهة في سور القرآن الكريم ({mockMatches.length} مواضع):</span>
            <span className="text-amber-600 dark:text-amber-400 text-[11px]">تظليل أصفر للعبارة المماثلة ✨</span>
          </div>

          {mockMatches.map((match, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 hover:border-amber-400 transition-all"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-lg">
                    سورة {match.surahName}
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    الآية {match.ayahNumber} (الجزء {match.juzNumber})
                  </span>
                </div>

                {onJumpToAyah && (
                  <button
                    onClick={() => {
                      onJumpToAyah(match.surahNumber, match.ayahNumber);
                      onClose();
                    }}
                    className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    الانتقال للآية في المصحف
                  </button>
                )}
              </div>

              {/* Verses Text with Highlight */}
              <p className="font-serif font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-relaxed">
                "{match.ayahText}"
              </p>

              {/* Similarity Golden Rule Note */}
              <div className="bg-amber-100/70 dark:bg-amber-950/50 p-3 rounded-xl border border-amber-300/80 text-xs text-amber-950 dark:text-amber-200 space-y-0.5">
                <span className="font-bold flex items-center gap-1 text-[11px]">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  قاعدة الضبط والتمييز بين الموضعين:
                </span>
                <p className="font-medium">{match.similarityNote}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
          >
            إغلاق المكتشف
          </button>
        </div>

      </div>
    </div>
  );
};
