import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Repeat,
  FastForward,
  BookOpen,
  Sparkles,
  Music,
  CheckCircle2,
  ListMusic,
  Sliders,
  Layers,
  Award
} from 'lucide-react';
import { RECITERS, Reciter, ALL_SURAHS } from '../../data/quranData';

export interface InteractiveRecitationLibraryProps {
  studentName?: string;
}

export const InteractiveRecitationLibrary: React.FC<InteractiveRecitationLibraryProps> = ({
  studentName,
}) => {
  // Qaris List
  const EXPANDED_RECITERS: Reciter[] = [
    ...RECITERS,
    {
      id: 'hudaify',
      name: 'الشيخ علي بن عبد الرحمن الحذيفي',
      subtext: 'تلاوة مأنية وبطيئة للتجويد',
      serverUrl: 'https://cdn.islamic.network/quran/audio/128/ar.hudhaify/',
    },
    {
      id: 'abdulbasit',
      name: 'الشيخ عبد الباسط عبد الصمد',
      subtext: 'المرتل والمجود',
      serverUrl: 'https://cdn.islamic.network/quran/audio/128/ar.abdulbasitmurattal/',
    },
  ];

  const [selectedReciter, setSelectedReciter] = useState<Reciter>(EXPANDED_RECITERS[0]);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1); // Al-Fatihah
  const [currentAyahNumber, setCurrentAyahNumber] = useState<number>(1);

  // Playback Controls
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [repeatCountSetting, setRepeatCountSetting] = useState<number>(3); // Repeat 3 times default
  const [currentRepeatIteration, setCurrentRepeatIteration] = useState<number>(1);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0); // 0.75x, 1x, 1.25x
  const [pauseDurationBetweenRepeats, setPauseDurationBetweenRepeats] = useState<number>(3); // 3 seconds pause for student repetition
  const [isWaitingForStudentRepeat, setIsWaitingForStudentRepeat] = useState<boolean>(false);
  const [pauseSecondsRemaining, setPauseSecondsRemaining] = useState<number>(0);

  // Audio Object Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectedSurah = ALL_SURAHS.find((s) => s.number === selectedSurahNumber) || ALL_SURAHS[0];

  // Helper to construct verse audio URL
  const getAyahAudioUrl = (surahNum: number, ayahNum: number, reciter: Reciter) => {
    // Alafasy / Minshawi uses global ayah index or serverUrl prefix
    return `${reciter.serverUrl}${surahNum}_${ayahNum}.mp3`;
  };

  const currentAudioUrl = getAyahAudioUrl(selectedSurahNumber, currentAyahNumber, selectedReciter);

  // Play/Pause handler
  const handleTogglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setIsWaitingForStudentRepeat(false);
    } else {
      playCurrentAyah();
    }
  };

  const playCurrentAyah = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(currentAudioUrl);
    audio.playbackRate = playbackSpeed;
    audioRef.current = audio;

    setIsPlaying(true);
    setIsWaitingForStudentRepeat(false);

    audio
      .play()
      .then(() => {})
      .catch(() => {
        // Fallback demo simulation if CDN sample is unreachable
        simulateTalqeenLoop();
      });

    audio.onended = () => {
      handleAyahEnded();
    };
  };

  const simulateTalqeenLoop = () => {
    setIsPlaying(true);
    // Simulate 4 seconds of audio playback
    setTimeout(() => {
      handleAyahEnded();
    }, 4000);
  };

  const handleAyahEnded = () => {
    if (currentRepeatIteration < repeatCountSetting) {
      // Pause for student repetition
      setIsWaitingForStudentRepeat(true);
      setPauseSecondsRemaining(pauseDurationBetweenRepeats);

      let countdown = pauseDurationBetweenRepeats;
      const interval = setInterval(() => {
        countdown--;
        setPauseSecondsRemaining(countdown);
        if (countdown <= 0) {
          clearInterval(interval);
          setIsWaitingForStudentRepeat(false);
          setCurrentRepeatIteration((prev) => prev + 1);
          playCurrentAyah();
        }
      }, 1000);
    } else {
      // Reset repeats and move to next verse
      setCurrentRepeatIteration(1);
      if (currentAyahNumber < selectedSurah.numberOfAyahs) {
        setCurrentAyahNumber((prev) => prev + 1);
        setTimeout(() => {
          playCurrentAyah();
        }, 1000);
      } else {
        setIsPlaying(false);
        setIsWaitingForStudentRepeat(false);
      }
    }
  };

  const handleNextAyah = () => {
    if (currentAyahNumber < selectedSurah.numberOfAyahs) {
      setCurrentAyahNumber((prev) => prev + 1);
      setCurrentRepeatIteration(1);
      if (isPlaying) {
        setTimeout(() => playCurrentAyah(), 100);
      }
    }
  };

  const handlePrevAyah = () => {
    if (currentAyahNumber > 1) {
      setCurrentAyahNumber((prev) => prev - 1);
      setCurrentRepeatIteration(1);
      if (isPlaying) {
        setTimeout(() => playCurrentAyah(), 100);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
            <Music className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                Interactive Recitation & Talqeen Studio 🎧
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg font-serif mt-0.5">
              مكتبة التلاوات الصوتية وخاصية التكرار والتلقين
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border">
            وضع المحاكاة: <span className="font-extrabold text-emerald-700">تلقين مكرر ({repeatCountSetting}x)</span>
          </span>
        </div>
      </div>

      {/* Reciter Selector Cards */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold text-slate-700 block">اختر قارئ التلاوة والمصاحف المعلمة:</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {EXPANDED_RECITERS.map((reciter) => {
            const isSelected = selectedReciter.id === reciter.id;
            return (
              <button
                key={reciter.id}
                onClick={() => {
                  setSelectedReciter(reciter);
                  if (isPlaying) playCurrentAyah();
                }}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-400'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div>
                  <span className="font-bold text-xs block font-serif leading-tight">{reciter.name}</span>
                  <span className={`text-[10px] block mt-1 ${isSelected ? 'text-amber-200' : 'text-slate-500'}`}>
                    {reciter.subtext}
                  </span>
                </div>

                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-amber-300 self-end mt-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Talqeen Control Console */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border-2 border-emerald-800 relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/10 pointer-events-none" />

        {/* Top Surah & Ayah Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-emerald-800/80 pb-4 relative z-10">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-amber-300 font-bold block">السورة والآية الحالية:</span>
              <div className="flex items-center gap-2">
                <select
                  value={selectedSurahNumber}
                  onChange={(e) => {
                    setSelectedSurahNumber(Number(e.target.value));
                    setCurrentAyahNumber(1);
                    setCurrentRepeatIteration(1);
                  }}
                  className="bg-emerald-900 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl border border-emerald-700 focus:outline-none"
                >
                  {ALL_SURAHS.map((s) => (
                    <option key={s.number} value={s.number}>
                      سورة {s.name} ({s.numberOfAyahs} آية)
                    </option>
                  ))}
                </select>

                <select
                  value={currentAyahNumber}
                  onChange={(e) => {
                    setCurrentAyahNumber(Number(e.target.value));
                    setCurrentRepeatIteration(1);
                  }}
                  className="bg-emerald-900 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl border border-emerald-700 focus:outline-none"
                >
                  {Array.from({ length: selectedSurah.numberOfAyahs }, (_, i) => i + 1).map((aNum) => (
                    <option key={aNum} value={aNum}>
                      الآية {aNum}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-amber-200 bg-emerald-900/80 px-4 py-2 rounded-2xl border border-emerald-700">
            <Sparkles className="w-4 h-4 text-amber-300" />
            الشيخ الحالي: {selectedReciter.name}
          </div>
        </div>

        {/* Current Ayah Display & Talqeen Indicator */}
        <div className="text-center space-y-4 py-4 relative z-10">
          
          {/* Waiting for Student Repeat Banner */}
          {isWaitingForStudentRepeat ? (
            <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 font-black text-xs px-5 py-2 rounded-full shadow-lg border border-amber-300 animate-bounce">
              <Volume2 className="w-4 h-4 text-slate-950" />
              <span>دورك الآن في التكرار والمحاكاة! ({pauseSecondsRemaining} ثانية متبقية) 🗣️</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-emerald-800/80 text-amber-300 text-xs font-bold px-4 py-1.5 rounded-full border border-emerald-700">
              <Repeat className="w-3.5 h-3.5 text-amber-300" />
              التكرار الحالى: {currentRepeatIteration} من {repeatCountSetting} مرات
            </div>
          )}

          {/* Ayah Verse Text Display */}
          <div className="bg-emerald-900/60 p-6 rounded-2xl border border-emerald-700/80 space-y-3">
            <p className="font-serif text-2xl sm:text-3xl text-amber-100 font-bold leading-[2.2]">
              سُورَةُ {selectedSurah.name} - الآيَةُ {currentAyahNumber}
            </p>
            <p className="text-xs text-emerald-200/80 font-medium">
              استمع للتلاوة بدقة ثم كرر خلف الشيخ لضبط مخارج الحروف وأحكام التجويد.
            </p>
          </div>

        </div>

        {/* Repetition Settings Bar (Count, Pause Interval, Speed) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-emerald-800/80 pt-4 text-xs font-bold relative z-10">
          
          {/* Repeat Count */}
          <div className="space-y-1.5">
            <label className="text-emerald-200 block">مرات تكرار الآية (Talqeen Loop):</label>
            <div className="flex items-center gap-1 bg-emerald-900 p-1 rounded-xl border border-emerald-700">
              {[1, 3, 5, 10].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setRepeatCountSetting(cnt)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    repeatCountSetting === cnt ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  {cnt}x
                </button>
              ))}
            </div>
          </div>

          {/* Pause Interval between Repeats */}
          <div className="space-y-1.5">
            <label className="text-emerald-200 block">فترة التوقّف لتكرار الطالب (ثوانٍ):</label>
            <select
              value={pauseDurationBetweenRepeats}
              onChange={(e) => setPauseDurationBetweenRepeats(Number(e.target.value))}
              className="w-full bg-emerald-900 text-white font-bold p-2 rounded-xl border border-emerald-700 focus:outline-none"
            >
              <option value={2}>2 ثوانٍ (تكرار سريع)</option>
              <option value={3}>3 ثوانٍ (تكرار معتدل)</option>
              <option value={5}>5 ثوانٍ (تكرار مريح للتسميع)</option>
            </select>
          </div>

          {/* Playback Speed */}
          <div className="space-y-1.5">
            <label className="text-emerald-200 block">سرعة التلاوة والصوت:</label>
            <div className="flex items-center gap-1 bg-emerald-900 p-1 rounded-xl border border-emerald-700">
              {[0.75, 1.0, 1.25].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    playbackSpeed === spd ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Player Controls Bar (Play/Pause, Next, Prev) */}
        <div className="flex items-center justify-center gap-4 pt-2 relative z-10">
          <button
            onClick={handlePrevAyah}
            disabled={currentAyahNumber <= 1}
            className="p-3 bg-emerald-900 hover:bg-emerald-800 text-white rounded-2xl border border-emerald-700 disabled:opacity-50"
            title="الآية السابقة"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleTogglePlay}
            className={`px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center gap-3 ${
              isPlaying
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6 fill-slate-950" />
                <span>إيقاف التكرار والتلقين</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-slate-950" />
                <span>تشغيل التلاوة والتكرار (Talqeen)</span>
              </>
            )}
          </button>

          <button
            onClick={handleNextAyah}
            disabled={currentAyahNumber >= selectedSurah.numberOfAyahs}
            className="p-3 bg-emerald-900 hover:bg-emerald-800 text-white rounded-2xl border border-emerald-700 disabled:opacity-50"
            title="الآية التالية"
          >
            <FastForward className="w-5 h-5" />
          </button>
        </div>

      </div>

    </div>
  );
};
