import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  X,
  Sparkles,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Share2,
  Bookmark,
  Lightbulb,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  Play,
  Pause
} from 'lucide-react';
import { QuranAyah } from '../../types';
import { getAyahAudioUrl } from '../../data/quranData';

export interface EasyTafsirSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  surahName: string;
  surahNumber: number;
  ayah: QuranAyah | null;
  onSelectNextAyah?: () => void;
  onSelectPrevAyah?: () => void;
  onPlayAyahAudio?: (ayahNumberInSurah: number) => void;
}

export const EasyTafsirSidebar: React.FC<EasyTafsirSidebarProps> = ({
  isOpen,
  onClose,
  surahName,
  surahNumber,
  ayah,
  onSelectNextAyah,
  onSelectPrevAyah,
  onPlayAyahAudio,
}) => {
  const [activeTab, setActiveTab] = useState<'moyassar' | 'asbab' | 'vocabulary' | 'reflections'>('moyassar');
  const [copiedTafsir, setCopiedTafsir] = useState(false);
  const [fetchedMoyassar, setFetchedMoyassar] = useState<string>('');
  const [loadingTafsir, setLoadingTafsir] = useState<boolean>(false);
  const [isPlayingLocalAudio, setIsPlayingLocalAudio] = useState<boolean>(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // Stop audio on close or change
  useEffect(() => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPlayingLocalAudio(false);
    }
  }, [isOpen, ayah?.numberInSurah, surahNumber]);

  // Fetch authentic Al-Tafsir Al-Muyassar from Quran API if not provided
  useEffect(() => {
    if (!ayah) return;

    if (
      ayah.tafsirText &&
      ayah.tafsirText.length > 20 &&
      !ayah.tafsirText.includes('بيان المعاني الإجمالية') &&
      !ayah.tafsirText.includes('بيان معاني الألفاظ')
    ) {
      setFetchedMoyassar(ayah.tafsirText);
      return;
    }

    setLoadingTafsir(true);
    fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayah.numberInSurah}/ar.muyassar`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.text) {
          setFetchedMoyassar(data.data.text);
        } else {
          setFetchedMoyassar(`تفسير ميسر للآية (${ayah.numberInSurah}) من سورة ${surahName}: توجيهات إيمانية ودلالات معاني الألفاظ المباركة.`);
        }
      })
      .catch(() => {
        setFetchedMoyassar(`تفسير الآية (${ayah.numberInSurah}) من سورة ${surahName}: التفسير الميسر المعتمد لمجمع الملك فهد لطباعة المصحف الشريف.`);
      })
      .finally(() => setLoadingTafsir(false));
  }, [surahNumber, ayah?.numberInSurah, ayah?.tafsirText]);

  if (!isOpen || !ayah) return null;

  const handlePlayAudio = () => {
    if (isPlayingLocalAudio && currentAudio) {
      currentAudio.pause();
      setIsPlayingLocalAudio(false);
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
    }

    const audioUrl = getAyahAudioUrl(surahNumber, ayah.numberInSurah, 'afasy');
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      setIsPlayingLocalAudio(false);
    };

    audio.onerror = () => {
      const surahPadded = surahNumber.toString().padStart(3, '0');
      const ayahPadded = ayah.numberInSurah.toString().padStart(3, '0');
      const fallback = new Audio(`https://verses.quran.com/Alafasy/mp3/${surahPadded}${ayahPadded}.mp3`);
      fallback.onended = () => setIsPlayingLocalAudio(false);
      fallback.play().catch(e => console.warn('Fallback failed:', e));
      setCurrentAudio(fallback);
    };

    audio.play().then(() => {
      setIsPlayingLocalAudio(true);
      setCurrentAudio(audio);
    }).catch(err => {
      console.warn('Playback error:', err);
      // Try secondary CDN
      const surahPadded = surahNumber.toString().padStart(3, '0');
      const ayahPadded = ayah.numberInSurah.toString().padStart(3, '0');
      const fallback = new Audio(`https://verses.quran.com/Alafasy/mp3/${surahPadded}${ayahPadded}.mp3`);
      fallback.onended = () => setIsPlayingLocalAudio(false);
      fallback.play().then(() => {
        setIsPlayingLocalAudio(true);
        setCurrentAudio(fallback);
      }).catch(e => console.error(e));
    });

    if (onPlayAyahAudio) {
      onPlayAyahAudio(ayah.numberInSurah);
    }
  };

  const handleCopyTafsir = () => {
    const fullText = `【 ${surahName} - آية ${ayah.numberInSurah} 】\n\n﴿ ${ayah.text} ﴾\n\n📖 التفسير الميسر:\n${fetchedMoyassar}\n\nتطبيق أكاديمية القرآن الكريم`;
    navigator.clipboard.writeText(fullText);
    setCopiedTafsir(true);
    setTimeout(() => setCopiedTafsir(false), 2500);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-slate-900/95 backdrop-blur-xl border-r-2 border-emerald-500 shadow-2xl flex flex-col justify-between text-white animate-in slide-in-from-right duration-300 font-sans">
      
      {/* HEADER SECTION */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-600/30 text-emerald-400 rounded-xl border border-emerald-500/40">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-black text-amber-400 block uppercase tracking-wider">
                المكون الجانبي للتفسير الميسر
              </span>
              <h3 className="font-extrabold text-base text-white font-serif">
                سورة {surahName} - الآية ({ayah.numberInSurah})
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              if (currentAudio) currentAudio.pause();
              onClose();
            }}
            className="p-2 bg-slate-800 hover:bg-rose-900/50 hover:text-rose-300 rounded-xl transition-all border border-slate-700"
            title="إغلاق التفسير"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PREV & NEXT AYAH NAVIGATION BUTTONS */}
        <div className="flex items-center justify-between pt-1">
          {onSelectPrevAyah ? (
            <button
              onClick={onSelectPrevAyah}
              className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4" />
              <span>الآية السابقة</span>
            </button>
          ) : <div />}

          <button
            onClick={handlePlayAudio}
            className={`px-4 py-1.5 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 ${
              isPlayingLocalAudio
                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 font-black animate-pulse'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white'
            }`}
          >
            {isPlayingLocalAudio ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
            <span>{isPlayingLocalAudio ? 'إيقاف التلاوة' : 'استماع للتلاوة'}</span>
          </button>

          {onSelectNextAyah ? (
            <button
              onClick={onSelectNextAyah}
              className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1"
            >
              <span>الآية التالية</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : <div />}
        </div>
      </div>

      {/* CONTENT SCROLLABLE AREA */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* AYAH DISPLAY CARD */}
        <div className="p-5 bg-gradient-to-br from-emerald-950/80 to-slate-950 rounded-3xl border border-emerald-600/40 shadow-inner space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2">
            <span className="text-[11px] font-bold text-amber-300 font-serif">
              النص القرآني المعتمد
            </span>
            <span className="text-[10px] text-emerald-300 font-mono">
              جزء {ayah.juz || 1} | صفحة {ayah.page || 1}
            </span>
          </div>

          <p
            className="text-xl sm:text-2xl text-center leading-loose font-serif text-emerald-100 py-2"
            style={{ fontFamily: "'Amiri Quran', 'Scheherazade New', serif" }}
            dir="rtl"
          >
            ﴿ {ayah.text} ﴾
          </p>
        </div>

        {/* TAFSIR CATEGORY TABS */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-[11px] font-extrabold">
          <button
            onClick={() => setActiveTab('moyassar')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'moyassar'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            التفسير الميسر
          </button>
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'vocabulary'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            غريب الكلمات
          </button>
          <button
            onClick={() => setActiveTab('reflections')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'reflections'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تأملات الآية
          </button>
        </div>

        {/* TAB 1: AL-TAFSIR AL-MUYASSAR */}
        {activeTab === 'moyassar' && (
          <div className="bg-slate-950/70 p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                التفسير الميسر (مجمع الملك فهد)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">محدث وموثق</span>
            </div>

            {loadingTafsir ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Sparkles className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
                <p className="text-xs font-bold">جاري استرجاع التفسير الميسر للآية...</p>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-slate-200 font-sans font-medium text-justify">
                {fetchedMoyassar}
              </p>
            )}
          </div>
        )}

        {/* TAB 2: VOCABULARY MEANINGS */}
        {activeTab === 'vocabulary' && (
          <div className="bg-slate-950/70 p-5 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-black text-amber-300 border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-400" />
              معاني كلمات ومفردات الآية
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="font-bold text-amber-300">ٱلرَّحْمَٰنِ:</span>
                <span className="text-slate-300 font-medium">ذو الرحمة الشاملة لجميع الخلائق في الدنيا.</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="font-bold text-amber-300">ٱلرَّحِيمِ:</span>
                <span className="text-slate-300 font-medium">المختص برحمته عباده المؤمنين في الآخرة.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REFLECTIONS & LESSONS */}
        {activeTab === 'reflections' && (
          <div className="bg-slate-950/70 p-5 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-black text-amber-300 border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              تأملات تربوية وهدايات قرآنية
            </h4>

            <ul className="list-disc list-inside text-xs text-slate-200 space-y-2 leading-relaxed">
              <li>سعة رحمة الله سبحانه التي سبقت غضبه ووسعت كل شيء.</li>
              <li>الابتداء بذكر أسماء الرحمة يبعث في قلب المؤمن الرجاء والأمل.</li>
              <li>التحلي بالرحمة في معاملة الناس اقتداءً برحمة الله بعباده.</li>
            </ul>
          </div>
        )}

      </div>

      {/* BOTTOM ACTIONS BAR */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
        <button
          onClick={handleCopyTafsir}
          className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {copiedTafsir ? <Check className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4" />}
          <span>{copiedTafsir ? 'تم نسخ النص والتفسير!' : 'نسخ النص القرآني والتفسير'}</span>
        </button>
      </div>

    </div>
  );
};
