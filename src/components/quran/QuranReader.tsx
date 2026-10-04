import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Search,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Info,
  Bookmark,
  Sparkles,
  ChevronLeft,
  X,
  Copy,
  Check,
  Brain,
  Lightbulb,
  Award,
  HelpCircle,
  Moon,
  Sun,
  SkipForward,
  SkipBack,
  Repeat,
  Gauge,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { ALL_SURAHS, RECITERS, SAMPLE_SURAHS_AYAS, getAyahAudioUrl } from '../../data/quranData';
import { QuranSurah, QuranAyah } from '../../types';
import { fetchAiTafsirForAyah, AiTafsirInsight } from '../../services/geminiTafsirService';
import { TajweedGuideModal } from './TajweedGuideModal';
import { QuranRecitationRecorder } from './QuranRecitationRecorder';
import { SmartAyahNotesModal } from './SmartAyahNotesModal';
import { SilentReadingSaver } from './SilentReadingSaver';
import { SimilarVersesFinderModal } from './SimilarVersesFinderModal';
import { TouchReadingQuickDrawer } from './TouchReadingQuickDrawer';
import { InteractiveTajweedGuideModal } from '../tajweed/InteractiveTajweedGuideModal';
import { SurahAsbabNuzulVideoLibrary } from '../video/SurahAsbabNuzulVideoLibrary';
import { EasyTafsirSidebar } from './EasyTafsirSidebar';
import { TafsirReader } from './TafsirReader';
import { cacheAllSurahsAndTafsirOffline, isQuranCachedOffline } from '../../services/offlineQuranStorage';
import { useApp } from '../../context/AppContext';

export const QuranReader: React.FC = () => {
  const [readingTheme, setReadingTheme] = useState<'night' | 'sepia' | 'light'>('light');
  const isNightMode = readingTheme === 'night';
  const isSepiaMode = readingTheme === 'sepia';
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontScale, setFontScale] = useState(1.25); // 1.25x font scale default
  const [quranFontFamily, setQuranFontFamily] = useState<string>("'Amiri Quran', serif");
  const [quranLineHeight, setQuranLineHeight] = useState<number>(2.2);

  // Relaxing Night Reading Mode Custom Controls
  const [backlightBrightness, setBacklightBrightness] = useState<number>(85); // 30% to 100%
  const [eyeComfortWarmFilter, setEyeComfortWarmFilter] = useState<boolean>(true);
  const [quranFontColor, setQuranFontColor] = useState<'gold' | 'white' | 'emerald' | 'amber'>('gold');
  const [isTajweedGuideOpen, setIsTajweedGuideOpen] = useState(false);
  const [isSilentReadingEnabled, setIsSilentReadingEnabled] = useState<boolean>(false);
  const [isTouchReadingMode, setIsTouchReadingMode] = useState<boolean>(true); // Touch Reading Mode enabled by default
  const [selectedSurah, setSelectedSurah] = useState<QuranSurah>(ALL_SURAHS[0]);
  const [activeMainTab, setActiveMainTab] = useState<'mushaf' | 'tafsir_reader'>('mushaf');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Meccan' | 'Medinan'>('all');

  const { t } = useApp();
  const quranContainerRef = useRef<HTMLDivElement>(null);
  const [isCachedOffline, setIsCachedOffline] = useState(false);
  const [isCachingProgress, setIsCachingProgress] = useState(false);
  const [cacheProgressText, setCacheProgressText] = useState('');

  useEffect(() => {
    isQuranCachedOffline().then(setIsCachedOffline);
  }, []);

  const handleCacheQuranOffline = async () => {
    setIsCachingProgress(true);
    setCacheProgressText('جاري تجهيز وتحميل السور والتفسير...');
    const ok = await cacheAllSurahsAndTafsirOffline((count, total) => {
      setCacheProgressText(`جاري حفظ السورة ${count} من ${total}...`);
    });
    setIsCachingProgress(false);
    if (ok) {
      setIsCachedOffline(true);
    }
  };

  // Sync fullscreen change event (e.g. when pressing ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!quranContainerRef.current) return;
    if (!document.fullscreenElement) {
      quranContainerRef.current.requestFullscreen().catch(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().catch(() => {
        setIsFullscreen(false);
      });
    }
  };
  
  // Reciter & Audio player state
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);
  const [playingAyahNumber, setPlayingAyahNumber] = useState<number | null>(null);
  const [isPlayingContinuous, setIsPlayingContinuous] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [repeatSingleAyah, setRepeatSingleAyah] = useState<boolean>(false);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  // Real-time Verse Highlighting Audio Progress
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [currentAudioTime, setCurrentAudioTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);

  // Active Ayahs list
  const [ayahs, setAyahs] = useState<QuranAyah[]>(SAMPLE_SURAHS_AYAS[1].ayahs);
  const [loadingAyahs, setLoadingAyahs] = useState(false);

  // Selected Ayah for Tafsir & Side Drawer
  const [activeTooltipAyahNumber, setActiveTooltipAyahNumber] = useState<number | null>(null);
  const [selectedAyahForTafsir, setSelectedAyahForTafsir] = useState<QuranAyah | null>(null);
  const [isEasyTafsirSidebarOpen, setIsEasyTafsirSidebarOpen] = useState<boolean>(false);
  const [aiInsight, setAiInsight] = useState<AiTafsirInsight | null>(null);
  const [loadingAiInsight, setLoadingAiInsight] = useState(false);
  const [copiedAyah, setCopiedAyah] = useState(false);
  const [activeTafsirTab, setActiveTafsirTab] = useState<'moyassar' | 'ai_deep' | 'memorize'>('moyassar');

  // Smart Ayah Annotation Notes state
  const [selectedAyahForNote, setSelectedAyahForNote] = useState<QuranAyah | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [notesUpdateTrigger, setNotesUpdateTrigger] = useState<number>(0);

  // Similar Verses Finder state
  const [selectedAyahForSimilar, setSelectedAyahForSimilar] = useState<QuranAyah | null>(null);
  const [isSimilarModalOpen, setIsSimilarModalOpen] = useState<boolean>(false);

  // Touch Reading Mode Drawer state
  const [touchDrawerAyah, setTouchDrawerAyah] = useState<QuranAyah | null>(null);

  // Interactive Tajweed Guide & Asbab Nuzul Video Library Modals State
  const [isInteractiveTajweedGuideOpen, setIsInteractiveTajweedGuideOpen] = useState<boolean>(false);
  const [isAsbabNuzulVideoOpen, setIsAsbabNuzulVideoOpen] = useState<boolean>(false);

  // Bookmarks
  const [bookmarkedKey, setBookmarkedKey] = useState<string>('');

  // Ayah card refs for smooth auto-scrolling during continuous recitation
  const ayahRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Fetch or load Ayahs when Surah changes
  useEffect(() => {
    // Stop playing audio when changing Surah
    if (audioObj) {
      audioObj.pause();
      setPlayingAyahNumber(null);
      setIsPlayingContinuous(false);
    }

    if (SAMPLE_SURAHS_AYAS[selectedSurah.number]) {
      setAyahs(SAMPLE_SURAHS_AYAS[selectedSurah.number].ayahs);
    } else {
      setLoadingAyahs(true);
      fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}/editions/quran-uthmani,ar.muyassar`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.data && Array.isArray(data.data) && data.data.length >= 2) {
            const textList = data.data[0]?.ayahs || [];
            const tafsirList = data.data[1]?.ayahs || [];
            const formattedAyahs: QuranAyah[] = textList.map((a: any, idx: number) => ({
              number: a.number,
              text: a.text,
              numberInSurah: a.numberInSurah,
              juz: a.juz,
              page: a.page,
              tafsirText: tafsirList[idx]?.text || a.text,
            }));
            setAyahs(formattedAyahs);
          } else if (data?.data?.ayahs) {
            const formattedAyahs: QuranAyah[] = data.data.ayahs.map((a: any) => ({
              number: a.number,
              text: a.text,
              numberInSurah: a.numberInSurah,
              juz: a.juz,
              page: a.page,
              tafsirText: a.text,
            }));
            setAyahs(formattedAyahs);
          }
        })
        .catch(() => {
          setAyahs([
            {
              number: 1,
              text: `تلاوة آيات سورة ${selectedSurah.name} الكريمة (عدد آياتها ${selectedSurah.numberOfAyahs} آية)`,
              numberInSurah: 1,
              juz: selectedSurah.juzNumber,
              page: 1,
              tafsirText: `سورة ${selectedSurah.name} من السور المباركة في القرآن الكريم.`,
            },
          ]);
        })
        .finally(() => setLoadingAyahs(false));
    }
  }, [selectedSurah]);

  // Synchronized Play specific Ayah by Index
  const playAyahAtIndex = (index: number, isContinuous: boolean = true) => {
    if (index < 0 || index >= ayahs.length) {
      setIsPlayingContinuous(false);
      setPlayingAyahNumber(null);
      return;
    }

    if (audioObj) {
      audioObj.pause();
    }

    const ayah = ayahs[index];
    const audioUrl = getAyahAudioUrl(selectedSurah.number, ayah.numberInSurah, selectedReciter.id);
    const newAudio = new Audio(audioUrl);
    newAudio.playbackRate = playbackRate;

    newAudio.ontimeupdate = () => {
      if (newAudio.duration && !isNaN(newAudio.duration)) {
        setAudioProgress((newAudio.currentTime / newAudio.duration) * 100);
        setCurrentAudioTime(newAudio.currentTime);
        setAudioDuration(newAudio.duration);
      }
    };

    newAudio.play().catch(() => {
      const surahPadded = selectedSurah.number.toString().padStart(3, '0');
      const ayahPadded = ayah.numberInSurah.toString().padStart(3, '0');
      const altAudio = new Audio(`https://verses.quran.com/Alafasy/mp3/${surahPadded}${ayahPadded}.mp3`);
      altAudio.playbackRate = playbackRate;
      altAudio.ontimeupdate = () => {
        if (altAudio.duration && !isNaN(altAudio.duration)) {
          setAudioProgress((altAudio.currentTime / altAudio.duration) * 100);
          setCurrentAudioTime(altAudio.currentTime);
          setAudioDuration(altAudio.duration);
        }
      };
      altAudio.play().catch(e => console.warn('Audio fallback error:', e));
    });

    setAudioObj(newAudio);
    setPlayingAyahNumber(ayah.numberInSurah);
    setIsPlayingContinuous(isContinuous);
    setAudioProgress(0);

    // Auto-scroll card into view
    if (ayahRefs.current[ayah.numberInSurah]) {
      ayahRefs.current[ayah.numberInSurah]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    newAudio.onended = () => {
      if (repeatSingleAyah) {
        playAyahAtIndex(index, isContinuous);
      } else if (isContinuous && index + 1 < ayahs.length) {
        playAyahAtIndex(index + 1, true);
      } else {
        setPlayingAyahNumber(null);
        setIsPlayingContinuous(false);
      }
    };
  };

  // Toggle Continuous Surah Playback
  const handleToggleContinuousPlay = () => {
    if (isPlayingContinuous) {
      if (audioObj) audioObj.pause();
      setIsPlayingContinuous(false);
      setPlayingAyahNumber(null);
    } else {
      // Start playing from currently selected or first Ayah
      const startIndex = playingAyahNumber
        ? ayahs.findIndex((a) => a.numberInSurah === playingAyahNumber)
        : 0;
      playAyahAtIndex(startIndex >= 0 ? startIndex : 0, true);
    }
  };

  // Play Next Ayah
  const handlePlayNextAyah = () => {
    const currentIndex = ayahs.findIndex((a) => a.numberInSurah === playingAyahNumber);
    if (currentIndex >= 0 && currentIndex + 1 < ayahs.length) {
      playAyahAtIndex(currentIndex + 1, true);
    }
  };

  // Play Previous Ayah
  const handlePlayPrevAyah = () => {
    const currentIndex = ayahs.findIndex((a) => a.numberInSurah === playingAyahNumber);
    if (currentIndex > 0) {
      playAyahAtIndex(currentIndex - 1, true);
    }
  };

  // Single Ayah Play trigger
  const handlePlayAyah = (e: React.MouseEvent, ayah: QuranAyah) => {
    e.stopPropagation();
    if (playingAyahNumber === ayah.numberInSurah) {
      if (audioObj) audioObj.pause();
      setPlayingAyahNumber(null);
      setIsPlayingContinuous(false);
      return;
    }

    const idx = ayahs.findIndex((a) => a.numberInSurah === ayah.numberInSurah);
    playAyahAtIndex(idx >= 0 ? idx : 0, false);
  };

  // Handle Ayah Click -> Select & Open Tafsir Drawer
  const handleSelectAyahForTafsir = (ayah: QuranAyah) => {
    setSelectedAyahForTafsir(ayah);
    setIsEasyTafsirSidebarOpen(true);
    setAiInsight(null);
    setActiveTafsirTab('moyassar');

    setLoadingAiInsight(true);
    fetchAiTafsirForAyah(selectedSurah.name, ayah.numberInSurah, ayah.text)
      .then((res) => setAiInsight(res))
      .finally(() => setLoadingAiInsight(false));
  };

  const handleCopyAyahText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAyah(true);
    setTimeout(() => setCopiedAyah(false), 2000);
  };

  const filteredSurahs = ALL_SURAHS.filter((surah) => {
    const matchesQuery = surah.name.includes(searchQuery) || surah.number.toString() === searchQuery;
    const matchesType = typeFilter === 'all' || surah.revelationType === typeFilter;
    return matchesQuery && matchesType;
  });

  return (
    <div
      ref={quranContainerRef}
      className={`space-y-8 transition-colors duration-300 ${
        isFullscreen
          ? isNightMode
            ? 'fixed inset-0 z-50 bg-slate-950 p-6 sm:p-10 overflow-y-auto text-slate-100'
            : isSepiaMode
            ? 'fixed inset-0 z-50 bg-amber-100/90 p-6 sm:p-10 overflow-y-auto text-slate-950'
            : 'fixed inset-0 z-50 bg-amber-50/90 p-6 sm:p-10 overflow-y-auto text-slate-950'
          : isNightMode
          ? 'bg-slate-950 p-4 sm:p-6 rounded-3xl text-slate-100'
          : isSepiaMode
          ? 'bg-amber-100/80 p-4 sm:p-6 rounded-3xl text-slate-900 border-2 border-amber-300'
          : ''
      }`}
    >
      
      {/* Offline Storage Caching Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-4 border border-teal-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/20 text-teal-300 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm font-serif">
              {isCachedOffline ? 'تصفح المصحف بدون إنترنت 📶 (Offline Ready)' : 'تفعيل التصفح والقراءة بدون إنترنت'}
            </h4>
            <p className="text-[11px] text-teal-200/80">
              {isCachedOffline
                ? 'تم حفظ كامل سور القرآن الشريف والتفسير الميسر في الذاكرة المحلية للتصفح عند انقطاع الاتصال.'
                : 'قم بتحميل وتخزين السور والتفسير محلياً لتصفح وقراءة القرآن دون الحاجة للاتصال بالشبكة.'}
            </p>
          </div>
        </div>

        {!isCachedOffline && (
          <button
            onClick={handleCacheQuranOffline}
            disabled={isCachingProgress}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all shrink-0 disabled:opacity-50"
          >
            {isCachingProgress ? cacheProgressText : 'تحميل المصحف للاستخدام بدون إنترنت'}
          </button>
        )}
      </div>

      {/* Quran Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-800/60">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30">
            <BookOpen className="w-4 h-4 text-amber-300" />
            المصحف الشريف والتلاوة العطرة
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">
            المصحف الإلكتروني والتلاوة المزامنة
          </h2>
          <p className="text-emerald-100/80 text-xs sm:text-sm">
            استمع للتلاوة المتسلسلة مع تظليل متزامن للآية المقروءة والتحكم في السرعة والتكرار.
          </p>
        </div>

        {/* Right side Controls: Fullscreen, Tajweed Guide, Night Mode Toggle & Qari Selector */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          
          {/* Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-lg flex items-center gap-2"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-slate-950" />
                <span>إنهاء الشاشة الكاملة</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-slate-950" />
                <span>القراءة بملء الشاشة 📖</span>
              </>
            )}
          </button>

          {/* Font Zoom Controls in Fullscreen */}
          {isFullscreen && (
            <div className="flex items-center gap-1 bg-emerald-900/90 p-1.5 rounded-2xl border border-emerald-700">
              <button
                onClick={() => setFontScale((s) => Math.min(2, s + 0.25))}
                className="p-2 bg-emerald-800 hover:bg-emerald-700 text-amber-300 rounded-xl"
                title="تكبير الخط"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-bold px-2 text-amber-300">{Math.round(fontScale * 100)}%</span>
              <button
                onClick={() => setFontScale((s) => Math.max(1, s - 0.25))}
                className="p-2 bg-emerald-800 hover:bg-emerald-700 text-amber-300 rounded-xl"
                title="تصغير الخط"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Tajweed Guide Modal Trigger */}
          <button
            onClick={() => setIsInteractiveTajweedGuideOpen(true)}
            className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-slate-950" />
            دليل التجويد والمخارج 📖
          </button>

          {/* Asbab Nuzul & Surah Virtues Video Library Button */}
          <button
            onClick={() => setIsAsbabNuzulVideoOpen(true)}
            className="px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2 border border-emerald-600"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            مكتبة أسباب النزول والفضائل 🎥
          </button>

          {/* TOUCH READING MODE TOGGLE BUTTON */}
          <button
            onClick={() => setIsTouchReadingMode(!isTouchReadingMode)}
            className={`px-4 py-3 text-xs font-extrabold rounded-2xl transition-all shadow-md flex items-center gap-2 border ${
              isTouchReadingMode
                ? 'bg-amber-400 text-slate-950 border-amber-500 ring-2 ring-amber-400/50 shadow-lg'
                : 'bg-emerald-900/90 text-amber-200 border-emerald-700 hover:bg-emerald-800'
            }`}
            title="تظليل الآية عند النقر عليها وإظهار خيارات الاستماع والتفسير السريعة"
          >
            <span>القراءة باللمس 👆</span>
          </button>

          {/* SILENT READING & SMART BATTERY SAVER MODE */}
          <SilentReadingSaver
            isEnabled={isSilentReadingEnabled}
            onToggleEnabled={setIsSilentReadingEnabled}
          />

          {/* QURANIC FONT FAMILY & LINE SPACING SELECTORS */}
          <div className="flex flex-wrap items-center gap-2 bg-emerald-900/90 p-1.5 rounded-2xl border border-emerald-700/80 shrink-0 text-xs">
            {/* Font Selector */}
            <div className="flex items-center gap-1.5 px-1.5 text-amber-300 font-bold">
              <span>نوع الخط:</span>
              <select
                value={quranFontFamily}
                onChange={(e) => setQuranFontFamily(e.target.value)}
                className="bg-emerald-800 text-white font-extrabold px-2.5 py-1.5 rounded-xl border border-emerald-600 focus:outline-none cursor-pointer"
              >
                <option value="'Amiri Quran', serif">الخط العثماني الأصيل 📜</option>
                <option value="'Scheherazade New', serif">خط النسخ القرآني ✒️</option>
                <option value="'Cairo', sans-serif">الخط الحديث الميسر 📖</option>
              </select>
            </div>

            {/* Line Spacing / Height Selector */}
            <div className="flex items-center gap-1.5 px-1.5 text-amber-300 font-bold border-r border-emerald-700/80">
              <span>تباعد الأسطر:</span>
              <select
                value={quranLineHeight}
                onChange={(e) => setQuranLineHeight(Number(e.target.value))}
                className="bg-emerald-800 text-white font-extrabold px-2.5 py-1.5 rounded-xl border border-emerald-600 focus:outline-none cursor-pointer"
              >
                <option value={2.2}>عادي (2.2x)</option>
                <option value={2.6}>مريح (2.6x)</option>
                <option value={3.0}>واسع لضعاف البصر (3.0x) 👁️</option>
              </select>
            </div>
          </div>

          {/* Reading Mode Theme Selector (Night Mode, Sepia, Light) */}
          <div className="flex items-center gap-1 bg-emerald-900/90 p-1.5 rounded-2xl border border-emerald-700/80 shrink-0">
            <button
              onClick={() => setReadingTheme('night')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                readingTheme === 'night'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-amber-200 hover:text-white'
              }`}
              title="الوضع الليلي الداكن لحماية العينين"
            >
              <Moon className="w-3.5 h-3.5 fill-current" />
              <span>الوضع الليلي 🌙</span>
            </button>

            <button
              onClick={() => setReadingTheme('sepia')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                readingTheme === 'sepia'
                  ? 'bg-amber-300 text-slate-950 shadow-md'
                  : 'text-amber-200 hover:text-white'
              }`}
              title="نمط المصحف الدافئ"
            >
              <span>دافئ 📜</span>
            </button>

            <button
              onClick={() => setReadingTheme('light')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                readingTheme === 'light'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'text-amber-200 hover:text-white'
              }`}
              title="الوضع النهاري النصي"
            >
              <Sun className="w-3.5 h-3.5 fill-current" />
              <span>نهاري ☀️</span>
            </button>
          </div>

          {/* RELAXING NIGHT READING MODE CONTROLS TOOLBAR */}
          {readingTheme === 'night' && (
            <div className="w-full bg-slate-900/90 border border-amber-500/40 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-amber-200">
              {/* Backlight Brightness Slider */}
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>إضاءة الخلفية:</span>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={backlightBrightness}
                  onChange={(e) => setBacklightBrightness(Number(e.target.value))}
                  className="w-24 accent-amber-400 cursor-pointer"
                />
                <span className="font-mono text-[11px] text-amber-300">{backlightBrightness}%</span>
              </div>

              {/* Eye Comfort Warm Filter Toggle */}
              <button
                onClick={() => setEyeComfortWarmFilter(!eyeComfortWarmFilter)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] flex items-center gap-1.5 transition-all ${
                  eyeComfortWarmFilter
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-xs'
                    : 'bg-slate-800 text-amber-300 border-slate-700'
                }`}
              >
                <span>مرشح حماية العين الدافيء 👁️</span>
              </button>

              {/* Quran Font Color Selector */}
              <div className="flex items-center gap-1.5">
                <span>تلوين الخط:</span>
                <button
                  onClick={() => setQuranFontColor('gold')}
                  className={`px-2 py-1 rounded-lg text-[10px] ${quranFontColor === 'gold' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-amber-300'}`}
                >
                  ذهبي
                </button>
                <button
                  onClick={() => setQuranFontColor('white')}
                  className={`px-2 py-1 rounded-lg text-[10px] ${quranFontColor === 'white' ? 'bg-white text-slate-950 font-black' : 'bg-slate-800 text-white'}`}
                >
                  أبيض
                </button>
                <button
                  onClick={() => setQuranFontColor('emerald')}
                  className={`px-2 py-1 rounded-lg text-[10px] ${quranFontColor === 'emerald' ? 'bg-emerald-500 text-white font-black' : 'bg-slate-800 text-emerald-400'}`}
                >
                  زمردي
                </button>
              </div>
            </div>
          )}

          {/* Qari Selector Bar */}
          <div className="bg-emerald-900/80 p-3 rounded-2xl border border-emerald-700/60 space-y-1.5 shrink-0 max-w-xs w-full">
            <label className="text-[11px] font-bold text-emerald-200 block">قارئ التلاوة الصوتية:</label>
            <select
              value={selectedReciter.id}
              onChange={(e) => {
                const r = RECITERS.find((rec) => rec.id === e.target.value);
                if (r) setSelectedReciter(r);
              }}
              className="w-full bg-emerald-950 text-white text-xs p-2 rounded-xl border border-emerald-700 font-bold focus:outline-none"
            >
              {RECITERS.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.name}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* SYNCHRONIZED RECITATION AUDIO PLAYER CONTROL BAR */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-4 sm:p-5 rounded-3xl shadow-xl border border-emerald-700/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl font-bold shadow-md shrink-0">
            <Volume2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-amber-300 font-bold block">شريط التلاوة المتسلسلة والمزامنة الحية</span>
            <h4 className="font-extrabold text-base font-serif">
              سورة {selectedSurah.name} بصوت القارئ ({selectedReciter.name})
            </h4>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              {playingAyahNumber ? `جاري تلاوة الآية رقم (${playingAyahNumber})` : 'جاهز لبدء التلاوة والمزامنة'}
            </p>
          </div>
        </div>

        {/* Central Audio Playback Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayPrevAyah}
            disabled={!playingAyahNumber}
            className="p-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl border border-emerald-600 transition-all"
            title="الآية السابقة"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleContinuousPlay}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-lg flex items-center gap-2"
          >
            {isPlayingContinuous ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-slate-950" />}
            <span>{isPlayingContinuous ? 'إيقاف مؤقت' : 'تشغيل السورة كاملاً بالمزامنة'}</span>
          </button>

          <button
            onClick={handlePlayNextAyah}
            disabled={!playingAyahNumber}
            className="p-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl border border-emerald-600 transition-all"
            title="الآية التالية"
          >
            <SkipBack className="w-4 h-4" />
          </button>
        </div>

        {/* Right-side Speed & Repeat Controls */}
        <div className="flex items-center gap-2 text-xs">
          {/* Speed Selector */}
          <button
            onClick={() => {
              const rates = [0.75, 1, 1.25, 1.5];
              const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
              setPlaybackRate(nextRate);
              if (audioObj) audioObj.playbackRate = nextRate;
            }}
            className="px-3 py-2 bg-emerald-800/90 hover:bg-emerald-800 border border-emerald-600 text-amber-300 font-bold rounded-xl flex items-center gap-1"
            title="سرعة التلاوة للتسميع والحفظ"
          >
            <Gauge className="w-3.5 h-3.5 text-amber-300" />
            <span>السرعة: {playbackRate}x</span>
          </button>

          {/* Repeat Ayah Mode Toggle */}
          <button
            onClick={() => setRepeatSingleAyah(!repeatSingleAyah)}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1 border transition-all ${
              repeatSingleAyah
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-emerald-800/90 text-white border-emerald-600 hover:bg-emerald-800'
            }`}
            title="تكرار الآية الواحدة لتثبيت الحفظ"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>تكرار الآية</span>
          </button>
        </div>
      </div>

      {/* STUDENT MICROPHONE RECITATION RECORDER */}
      <QuranRecitationRecorder surahName={selectedSurah.name} />

      {/* VIEW MODE TOGGLE TABS: MUSHAF vs TAFSIR READER */}
      <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 text-xs font-bold shadow-md">
        <button
          onClick={() => setActiveMainTab('mushaf')}
          className={`flex-1 py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeMainTab === 'mushaf'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-300" />
          <span>المصحف الإلكتروني والتلاوة المزامنة 📖</span>
        </button>

        <button
          onClick={() => setActiveMainTab('tafsir_reader')}
          className={`flex-1 py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeMainTab === 'tafsir_reader'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>مكون التفسير الميسر آية بآية مع البحث (TafsirReader) 🔍</span>
        </button>
      </div>

      {/* Main Grid: Surah Selector (4 cols) & Quran Ayahs Reader (8/12 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* SURAH LIST SELECTOR (Hidden in Fullscreen for distraction-free reading) */}
        {!isFullscreen && (
          <div className={`md:col-span-5 lg:col-span-4 p-5 rounded-3xl border shadow-sm space-y-4 max-h-[720px] flex flex-col ${
            isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث باسم السورة أو رقمها..."
                  className={`w-full pr-9 pl-3 py-2.5 text-xs border rounded-xl focus:outline-none font-bold min-h-[44px] ${
                    isNightMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className={`flex items-center gap-1.5 p-1 rounded-xl text-xs ${isNightMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`flex-1 py-2 min-h-[38px] text-[11px] font-bold rounded-lg transition-all ${
                    typeFilter === 'all'
                      ? isNightMode ? 'bg-emerald-800 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-400'
                  }`}
                >
                  الكل (114)
                </button>
                <button
                  onClick={() => setTypeFilter('Meccan')}
                  className={`flex-1 py-2 min-h-[38px] text-[11px] font-bold rounded-lg transition-all ${
                    typeFilter === 'Meccan' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  مكية
                </button>
                <button
                  onClick={() => setTypeFilter('Medinan')}
                  className={`flex-1 py-2 min-h-[38px] text-[11px] font-bold rounded-lg transition-all ${
                    typeFilter === 'Medinan' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-400'
                  }`}
                >
                  مدنية
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {filteredSurahs.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => setSelectedSurah(surah)}
                  className={`w-full p-3.5 md:p-4 min-h-[52px] rounded-2xl transition-all text-right flex items-center justify-between border active:scale-[0.99] ${
                    selectedSurah.number === surah.number
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-md font-bold'
                      : isNightMode
                      ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[12px] font-sans ${
                        selectedSurah.number === surah.number
                          ? 'bg-amber-400 text-slate-950'
                          : isNightMode
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {surah.number}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm md:text-base font-serif">سورة {surah.name}</h4>
                      <span className="text-[10px] opacity-80">الجزء {surah.juzNumber}</span>
                    </div>
                  </div>

                  <div className="text-left text-[10px] opacity-80">
                    <span className="block font-bold">{surah.numberOfAyahs} آية</span>
                    <span>{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* QURAN AYAH DISPLAY OR TAFSIR READER */}
        {activeMainTab === 'tafsir_reader' ? (
          <div className={`${isFullscreen ? 'md:col-span-12 max-w-5xl mx-auto w-full' : 'md:col-span-7 lg:col-span-8'}`}>
            <TafsirReader
              surah={selectedSurah}
              ayahs={ayahs}
              onPlayAudio={(num) => {
                const idx = ayahs.findIndex((a) => a.numberInSurah === num);
                if (idx !== -1) playAyahAtIndex(idx, false);
              }}
              playingAyahNumber={playingAyahNumber}
            />
          </div>
        ) : (
          <div
            style={{
              filter: isNightMode
                ? `brightness(${backlightBrightness}%) ${eyeComfortWarmFilter ? 'sepia(0.2) hue-rotate(-10deg)' : ''}`
                : 'none',
            }}
            className={`${isFullscreen ? 'md:col-span-12 max-w-5xl mx-auto w-full' : 'md:col-span-7 lg:col-span-8'} p-6 sm:p-8 md:p-10 rounded-3xl border shadow-sm space-y-8 flex flex-col justify-between relative transition-all ${
              isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
          
          {/* Surah Header Title Banner */}
          <div className={`p-6 rounded-2xl text-center space-y-2 relative overflow-hidden border ${
            isNightMode
              ? 'bg-slate-950 border-emerald-900/60 text-amber-200'
              : 'bg-gradient-to-r from-amber-50 via-emerald-50 to-teal-50 border-amber-200/60'
          }`}>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 inline-block">
              الجزء {selectedSurah.juzNumber} | آياتها {selectedSurah.numberOfAyahs} | {selectedSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
            </span>
            <h3 className={`text-3xl sm:text-4xl font-black font-serif ${isNightMode ? 'text-amber-300' : 'text-emerald-900'}`}>
              سورة {selectedSurah.name}
            </h3>

            {selectedSurah.number !== 9 && (
              <p className={`text-lg font-serif pt-2 font-bold ${isNightMode ? 'text-amber-200' : 'text-amber-900'}`}>
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </p>
            )}
          </div>

          {/* Ayahs Flow with Synchronized Highlighting */}
          <div className="space-y-6 min-h-[400px]">
            {loadingAyahs ? (
              <div className="py-20 text-center text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                <p className="text-xs font-bold">جاري تحميل آيات سورة {selectedSurah.name}...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {ayahs.map((ayah) => {
                  const isSelected = selectedAyahForTafsir?.numberInSurah === ayah.numberInSurah;
                  const isPlaying = playingAyahNumber === ayah.numberInSurah;
                  const isTouchActive = touchDrawerAyah?.numberInSurah === ayah.numberInSurah;

                  return (
                    <div
                      key={ayah.numberInSurah}
                      ref={(el) => {
                        ayahRefs.current[ayah.numberInSurah] = el;
                      }}
                      onClick={() => {
                        if (isTouchReadingMode) {
                          setTouchDrawerAyah(ayah);
                        } else {
                          setActiveTooltipAyahNumber(
                            activeTooltipAyahNumber === ayah.numberInSurah ? null : ayah.numberInSurah
                          );
                          handleSelectAyahForTafsir(ayah);
                        }
                      }}
                      className={`p-5 sm:p-6 rounded-2xl border cursor-pointer transition-all space-y-4 relative overflow-hidden ${
                        isPlaying
                          ? 'bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border-amber-500 ring-4 ring-amber-400/50 shadow-2xl scale-[1.01]'
                          : isTouchActive
                          ? 'bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 dark:from-amber-950/80 dark:to-slate-900 border-2 border-amber-500 ring-4 ring-amber-400/40 shadow-2xl scale-[1.01]'
                          : isSelected || activeTooltipAyahNumber === ayah.numberInSurah
                          ? isNightMode
                            ? 'bg-emerald-950/90 border-emerald-500 ring-2 ring-emerald-500/40'
                            : 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                          : isNightMode
                          ? 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-800/80 hover:border-emerald-700'
                          : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/80 hover:border-emerald-300'
                      }`}
                    >
                      {/* REAL-TIME VERSE HIGHLIGHTING PROGRESS BAR & SYNC BANNER */}
                      {isPlaying && (
                        <div className="space-y-1.5 pb-2 border-b border-amber-400/40">
                          <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-900 dark:text-amber-300">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              تظليل لحظي متزامن - آية ({ayah.numberInSurah})
                            </span>
                            <span className="font-mono text-[10px]">
                              {Math.floor(currentAudioTime)}ث / {Math.floor(audioDuration || 0)}ث ({Math.round(audioProgress)}%)
                            </span>
                          </div>
                          <div className="w-full bg-amber-200/60 h-2 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${audioProgress}%` }}
                              className="bg-gradient-to-r from-emerald-600 to-amber-500 h-full transition-all duration-200 shadow-md"
                            />
                          </div>
                        </div>
                      )}
                      {/* Verse Arabic Text */}
                      <p
                        style={{
                          fontSize: `${fontScale * 1.35}rem`,
                          fontFamily: quranFontFamily,
                          lineHeight: quranLineHeight,
                        }}
                        className={`text-justify tracking-wide transition-all ${
                        isPlaying
                          ? 'text-amber-900 dark:text-amber-300 font-extrabold'
                          : isNightMode
                          ? quranFontColor === 'gold'
                            ? 'text-amber-300 font-bold'
                            : quranFontColor === 'emerald'
                            ? 'text-emerald-300 font-bold'
                            : quranFontColor === 'amber'
                            ? 'text-amber-400 font-bold'
                            : 'text-white font-bold'
                          : 'text-slate-900'
                      }`}>
                        {ayah.text}{' '}
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold text-xs font-sans mx-1 align-middle ${
                          isPlaying
                            ? 'bg-amber-500 text-slate-950 border-amber-600 animate-pulse'
                            : isNightMode
                            ? 'border-amber-400/80 bg-slate-900 text-amber-300'
                            : 'border-emerald-700 bg-emerald-50 text-emerald-900'
                        }`}>
                          {ayah.numberInSurah}
                        </span>
                      </p>

                      {/* INLINE TOOLTIP TAFSIR POPUP CARD */}
                      {activeTooltipAyahNumber === ayah.numberInSurah && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 text-white border-2 border-amber-400 shadow-2xl space-y-3 animate-in zoom-in-95 relative z-20"
                        >
                          {/* Tooltip Triangle Pointer */}
                          <div className="absolute -top-2.5 right-8 w-4 h-4 bg-emerald-950 border-t-2 border-r-2 border-amber-400 rotate-[-45deg]" />

                          <div className="flex items-center justify-between border-b border-emerald-800 pb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-amber-400 text-slate-950 rounded-lg font-bold">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <span className="font-extrabold text-xs text-amber-300">
                                التفسير الميسر المباشر (الآية {ayah.numberInSurah} - سورة {selectedSurah.name}) 📖
                              </span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTooltipAyahNumber(null);
                              }}
                              className="p-1 text-emerald-300 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-xs font-medium leading-relaxed text-emerald-100">
                            {ayah.tafsirText ||
                              `تفسير ميسر للآية الكريمة: تستعرض هذه الآية المباركة دلالات التوحيد وعظمة الخالق سبحانه، وحث عباده على الاستقامة والطاعة والتدبر والتفكر في آيات الكتاب الحكيم.`}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-800 text-[11px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectAyahForTafsir(ayah);
                              }}
                              className="text-amber-300 font-extrabold flex items-center gap-1 hover:underline"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              توليد إشراقات وتأملات تربوية بالذكاء الاصطناعي ✨
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyAyahText(`${ayah.text} - [سورة ${selectedSurah.name}: ${ayah.numberInSurah}]`);
                              }}
                              className="text-emerald-200 font-bold flex items-center gap-1 hover:text-white"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              نسخ الآية والتفسير
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action buttons bar */}
                      <div className={`flex items-center justify-between border-t pt-3 text-xs ${
                        isNightMode ? 'border-slate-800' : 'border-slate-200/60'
                      }`}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handlePlayAyah(e, ayah)}
                            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                              isPlaying
                                ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            }`}
                          >
                            {isPlaying ? (
                              <>
                                <Pause className="w-3.5 h-3.5" />
                                <span>جاري التلاوة بالمزامنة...</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>استماع</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTooltipAyahNumber(
                                activeTooltipAyahNumber === ayah.numberInSurah ? null : ayah.numberInSurah
                              );
                              handleSelectAyahForTafsir(ayah);
                            }}
                            className={`px-3 py-1.5 font-bold rounded-xl border flex items-center gap-1.5 transition-all ${
                              activeTooltipAyahNumber === ayah.numberInSurah
                                ? 'bg-amber-400 text-slate-950 border-amber-500 font-black'
                                : isNightMode
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                                : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-200'
                            }`}
                          >
                            <Info className="w-3.5 h-3.5 text-emerald-400" />
                            التفسير الميسر المباشر 📖
                          </button>

                          {/* SMART AYAH ANNOTATION NOTE BUTTON */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAyahForNote(ayah);
                              setIsNoteModalOpen(true);
                            }}
                            className={`px-3 py-1.5 font-bold rounded-xl border flex items-center gap-1.5 transition-all ${
                              localStorage.getItem(`quran_note_${selectedSurah.number}_${ayah.numberInSurah}`)
                                ? 'bg-emerald-800 text-amber-300 border-emerald-600 font-extrabold shadow-sm'
                                : isNightMode
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                            title="إضافة ملاحظة نصية أو صوتية على هذه الآية"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>
                              {localStorage.getItem(`quran_note_${selectedSurah.number}_${ayah.numberInSurah}`)
                                ? 'تدوينة محفوظة 📝'
                                : 'تدوين ملاحظة 📝'}
                            </span>
                          </button>

                          {/* SIMILAR VERSES FINDER BUTTON */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAyahForSimilar(ayah);
                              setIsSimilarModalOpen(true);
                            }}
                            className={`px-3 py-1.5 font-bold rounded-xl border flex items-center gap-1.5 transition-all ${
                              isNightMode
                                ? 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border-slate-700'
                                : 'bg-amber-50 hover:bg-amber-400 hover:text-slate-950 text-amber-900 border-amber-300'
                            }`}
                            title="البحث عن المتشابهات اللفظية لهذه الآية في المصحف"
                          >
                            <Search className="w-3.5 h-3.5 text-amber-500" />
                            <span>مكتشف المتشابهات 🔍</span>
                          </button>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBookmarkedKey(`${selectedSurah.number}:${ayah.numberInSurah}`);
                          }}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            bookmarkedKey === `${selectedSurah.number}:${ayah.numberInSurah}`
                              ? 'bg-amber-400 text-slate-950 border-amber-500 font-bold'
                              : isNightMode
                              ? 'text-slate-500 border-slate-800 hover:bg-slate-800'
                              : 'text-slate-400 border-slate-200 hover:bg-slate-200'
                          }`}
                          title="حفظ موضع التوقف"
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      </div>

      {/* SELECTED AYAH TAFSIR SIDE DRAWER */}
      {selectedAyahForTafsir && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/75 backdrop-blur-sm p-2 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full h-full max-h-[90vh] p-6 space-y-5 shadow-2xl border border-emerald-100 flex flex-col justify-between animate-in slide-in-from-left duration-300 overflow-y-auto">
            
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base font-serif">
                      تفسير الآية المختارة ({selectedAyahForTafsir.numberInSurah})
                    </h3>
                    <p className="text-[11px] text-slate-500">سورة {selectedSurah.name} | الجزء {selectedSurah.juzNumber}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAyahForTafsir(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quran Verse Box */}
              <div className="bg-gradient-to-r from-emerald-50 via-amber-50/40 to-teal-50 p-5 rounded-2xl border border-emerald-200/80 space-y-3">
                <p className="text-xl sm:text-2xl font-serif leading-relaxed text-emerald-950 font-bold text-center">
                  "{selectedAyahForTafsir.text}"
                </p>

                <div className="flex items-center justify-center gap-2 pt-2 border-t border-emerald-200/60 text-xs">
                  <button
                    onClick={(e) => handlePlayAyah(e, selectedAyahForTafsir)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    استماع للتلاوة
                  </button>

                  <button
                    onClick={() => handleCopyAyahText(selectedAyahForTafsir.text)}
                    className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 font-bold rounded-xl flex items-center gap-1"
                  >
                    {copiedAyah ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedAyah ? 'تم النسخ' : 'نسخ الآية'}
                  </button>
                </div>
              </div>

              {/* Tabs Bar */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setActiveTafsirTab('moyassar')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    activeTafsirTab === 'moyassar' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  التفسير الميسر
                </button>
                <button
                  onClick={() => setActiveTafsirTab('ai_deep')}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    activeTafsirTab === 'ai_deep' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  المساعد الذكي والتدبر
                </button>
                <button
                  onClick={() => setActiveTafsirTab('memorize')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    activeTafsirTab === 'memorize' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  فوائد الحفظ
                </button>
              </div>

              {/* Tab 1: Moyassar Tafsir */}
              {activeTafsirTab === 'moyassar' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-800 leading-relaxed">
                  <span className="font-extrabold text-slate-900 block">المعنى الإجمالي للآية:</span>
                  <p>
                    {selectedAyahForTafsir.tafsirText ||
                      `تبين هذه الآية المباركة من سورة ${selectedSurah.name} توجيهات عظيمة تعين المسلم على فهم كتاب الله واستحضار عظمته أثناء الحفظ والتسميع.`}
                  </p>
                </div>
              )}

              {/* Tab 2: AI Deep Insights */}
              {activeTafsirTab === 'ai_deep' && (
                <div className="space-y-3 text-xs">
                  {loadingAiInsight ? (
                    <div className="py-8 text-center text-slate-400 space-y-2">
                      <Sparkles className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
                      <p className="font-bold">جاري استخلاص التفسير واللفتات التدبرية بالذكاء الاصطناعي...</p>
                    </div>
                  ) : aiInsight ? (
                    <div className="space-y-3">
                      {aiInsight.asbabAlNuzul && (
                        <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 space-y-1">
                          <span className="font-bold text-amber-900 flex items-center gap-1">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                            سبب النزول والمناسبة:
                          </span>
                          <p className="text-amber-950 leading-relaxed">{aiInsight.asbabAlNuzul}</p>
                        </div>
                      )}

                      <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 space-y-1.5">
                        <span className="font-bold text-emerald-900 flex items-center gap-1">
                          <Brain className="w-4 h-4 text-emerald-700" />
                          الفتات والفوائد التدبرية:
                        </span>
                        <ul className="list-disc list-inside text-emerald-950 space-y-1 pr-1 font-medium">
                          {aiInsight.contemplationPoints.map((pt, idx) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Tab 3: Memorization Tips */}
              {activeTafsirTab === 'memorize' && (
                <div className="bg-teal-50 p-4 rounded-2xl border border-teal-200 space-y-2 text-xs text-teal-950">
                  <span className="font-extrabold block flex items-center gap-1">
                    <Award className="w-4 h-4 text-teal-700" />
                    توجيهات الحفظ والتثبيت:
                  </span>
                  <p className="leading-relaxed">
                    {aiInsight?.memorizationTip ||
                      'نصيحة الحفظ: كرر الآية 5 مرات مع الترتيل والتركيز على أواخر الآية لضمان ثبات التسميع.'}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedAyahForTafsir(null)}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      )}

      {/* TAJWEED GUIDE MODAL */}
      <TajweedGuideModal
        isOpen={isTajweedGuideOpen}
        onClose={() => setIsTajweedGuideOpen(false)}
        isNightMode={isNightMode}
      />

      {/* SMART AYAH ANNOTATIONS & NOTES MODAL */}
      {selectedAyahForNote && (
        <SmartAyahNotesModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          surahNumber={selectedSurah.number}
          surahName={selectedSurah.name}
          ayahNumber={selectedAyahForNote.numberInSurah}
          ayahText={selectedAyahForNote.text}
          onNoteSaved={() => setNotesUpdateTrigger((prev) => prev + 1)}
        />
      )}

      {/* SIMILAR VERSES FINDER MODAL */}
      {selectedAyahForSimilar && (
        <SimilarVersesFinderModal
          isOpen={isSimilarModalOpen}
          onClose={() => setIsSimilarModalOpen(false)}
          surahName={selectedSurah.name}
          surahNumber={selectedSurah.number}
          ayah={selectedAyahForSimilar}
          onJumpToAyah={(surahNum, ayahNum) => {
            const matchSurah = ALL_SURAHS.find((s) => s.number === surahNum);
            if (matchSurah) {
              setSelectedSurah(matchSurah);
            }
          }}
        />
      )}

      {/* TOUCH READING MODE POPUP SIDE DRAWER */}
      {touchDrawerAyah && (
        <TouchReadingQuickDrawer
          isOpen={!!touchDrawerAyah}
          onClose={() => setTouchDrawerAyah(null)}
          surahName={selectedSurah.name}
          surahNumber={selectedSurah.number}
          ayah={touchDrawerAyah}
          isPlaying={playingAyahNumber === touchDrawerAyah.numberInSurah}
          onPlayAudio={() => {
            const idx = ayahs.findIndex((a) => a.numberInSurah === touchDrawerAyah.numberInSurah);
            if (idx !== -1) playAyahAtIndex(idx, false);
          }}
          onPauseAudio={() => {
            if (audioObj) audioObj.pause();
            setPlayingAyahNumber(null);
          }}
          onOpenTafsir={() => handleSelectAyahForTafsir(touchDrawerAyah)}
          onOpenNote={() => {
            setSelectedAyahForNote(touchDrawerAyah);
            setIsNoteModalOpen(true);
          }}
          onOpenSimilarVerses={() => {
            setSelectedAyahForSimilar(touchDrawerAyah);
            setIsSimilarModalOpen(true);
          }}
          onCopyText={() => handleCopyAyahText(touchDrawerAyah.text)}
          isCopied={copiedAyah}
        />
      )}

      {/* INTERACTIVE TAJWEED GUIDE MODAL */}
      <InteractiveTajweedGuideModal
        isOpen={isInteractiveTajweedGuideOpen}
        onClose={() => setIsInteractiveTajweedGuideOpen(false)}
      />

      {/* CENTRAL VIDEO LIBRARY FOR ASBAB AL-NUZUL & SURAH VIRTUES */}
      <SurahAsbabNuzulVideoLibrary
        isOpen={isAsbabNuzulVideoOpen}
        onClose={() => setIsAsbabNuzulVideoOpen(false)}
        selectedSurahNumber={selectedSurah.number}
      />

      {/* EASY TAFSIR SIDEBAR COMPONENT */}
      <EasyTafsirSidebar
        isOpen={isEasyTafsirSidebarOpen}
        onClose={() => setIsEasyTafsirSidebarOpen(false)}
        surahName={selectedSurah.name}
        surahNumber={selectedSurah.number}
        ayah={selectedAyahForTafsir}
        onSelectNextAyah={() => {
          if (!selectedAyahForTafsir) return;
          const idx = ayahs.findIndex((a) => a.numberInSurah === selectedAyahForTafsir.numberInSurah);
          if (idx !== -1 && idx + 1 < ayahs.length) {
            handleSelectAyahForTafsir(ayahs[idx + 1]);
          }
        }}
        onSelectPrevAyah={() => {
          if (!selectedAyahForTafsir) return;
          const idx = ayahs.findIndex((a) => a.numberInSurah === selectedAyahForTafsir.numberInSurah);
          if (idx > 0) {
            handleSelectAyahForTafsir(ayahs[idx - 1]);
          }
        }}
        onPlayAyahAudio={(ayahNum) => {
          const idx = ayahs.findIndex((a) => a.numberInSurah === ayahNum);
          if (idx !== -1) playAyahAtIndex(idx, false);
        }}
      />

    </div>
  );
};
