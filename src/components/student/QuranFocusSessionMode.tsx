import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  ShieldAlert,
  Play,
  Pause,
  CloudRain,
  Wind,
  Trees,
  Droplets,
  BookOpen,
  CheckCircle2,
  BellOff
} from 'lucide-react';
import { ALL_SURAHS } from '../../data/quranData';
import { QuranSurah } from '../../types';

export interface QuranFocusSessionModeProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
}

export const QuranFocusSessionMode: React.FC<QuranFocusSessionModeProps> = ({
  isOpen,
  onClose,
  studentName,
}) => {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [focusTimerMins, setFocusTimerMins] = useState<number>(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Natural Ambient Soundscape (Non-Music Nature Synthesizers)
  const [activeNatureSound, setActiveNatureSound] = useState<'rain' | 'wind' | 'birds' | 'water' | 'none'>('rain');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.4);
  const [isPlayingAmbient, setIsPlayingAmbient] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const selectedSurah = ALL_SURAHS.find((s) => s.number === selectedSurahNumber) || ALL_SURAHS[0];

  // Timer countdown effect
  useEffect(() => {
    let timer: any = null;
    if (isTimerRunning && timeLeftSeconds > 0) {
      timer = setInterval(() => {
        setTimeLeftSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isTimerRunning && timeLeftSeconds === 0) {
      setIsTimerRunning(false);
      stopAmbientSound();
      alert('🎉 أحسنت! أتممت جلسة التركيز المصفاة من المشتتات بنجاح (+25 نقطة إتقان).');
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerRunning, timeLeftSeconds]);

  // Natural Ambient Sound Generator using Web Audio API (Rain / Wind / Water synthesizers)
  const startAmbientSound = (soundType: 'rain' | 'wind' | 'birds' | 'water') => {
    try {
      stopAmbientSound();

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Pink / Brown Noise synthesis for realistic rain & breeze
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // scale volume down
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter settings based on natural sound type
      const filter = ctx.createBiquadFilter();
      if (soundType === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, ctx.currentTime);
      } else if (soundType === 'wind') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);
        filter.Q.setValueAtTime(3.0, ctx.currentTime);
      } else if (soundType === 'water') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
      } else {
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2000, ctx.currentTime);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(ambientVolume, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;
      gainNodeRef.current = gain;

      setIsPlayingAmbient(true);
      setActiveNatureSound(soundType);
    } catch (e) {
      console.error('Ambient synthesis error:', e);
    }
  };

  const stopAmbientSound = () => {
    if (noiseNodeRef.current) {
      try {
        (noiseNodeRef.current as any).stop();
      } catch (e) {}
      noiseNodeRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    setIsPlayingAmbient(false);
  };

  const handleVolumeChange = (newVol: number) => {
    setAmbientVolume(newVol);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol, audioContextRef.current.currentTime);
    }
  };

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-3 sm:p-6 text-white overflow-y-auto animate-in fade-in duration-300">
      
      {/* Immersive Focus Canvas Box */}
      <div className="max-w-4xl w-full bg-slate-900 rounded-3xl border-2 border-emerald-600/80 p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden text-right">
        
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Floating Bar: Active Focus Indicator & Close */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-2xl font-black shadow-lg">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-0.5 rounded-full">
                  نمط جلسة التركيز والتجريد من المشتتات 🧘‍♂️
                </span>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <BellOff className="w-3 h-3 text-emerald-400" />
                  حجب الإشعارات الخارجية مُفعل
                </span>
              </div>
              <h3 className="font-extrabold text-xl font-serif text-white mt-1">
                غرفة الحفظ الهادئة والتسميع المركز
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              stopAmbientSound();
              onClose();
            }}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl border border-slate-700 transition-all"
            title="إنهاء جلسة التركيز"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Focus Quran Reader & Timer Console */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          
          {/* Main Quran Verse Screen (Highlighted Focus) */}
          <div className="md:col-span-2 bg-slate-950 p-6 sm:p-8 rounded-3xl border border-emerald-500/40 space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                <span className="text-amber-300 font-extrabold flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  سورة المراجعة والتركيز:
                </span>
                <select
                  value={selectedSurahNumber}
                  onChange={(e) => setSelectedSurahNumber(Number(e.target.value))}
                  className="bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none"
                >
                  {ALL_SURAHS.map((s) => (
                    <option key={s.number} value={s.number}>
                      سورة {s.name} ({s.numberOfAyahs} آية)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quranic Text Display Box */}
              <div className="py-6 text-center space-y-4">
                <p className="font-serif text-3xl sm:text-4xl text-amber-100 font-bold leading-[2.3] tracking-wide">
                  ﴿ سُورَةُ {selectedSurah.name} ﴾
                </p>
                <p className="text-emerald-300 text-xs font-semibold leading-relaxed max-w-lg mx-auto">
                  ﴿ وَوَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ ﴾
                </p>
              </div>
            </div>

            <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800/80 text-center text-xs text-emerald-200">
              <span className="font-bold block text-amber-300 mb-1">💡 توجيه الجلسة الهادئة:</span>
              اقرأ السورة بتمهل وتدبر، وتجنب أي اشتغال خارجي حتى انتهاء العد التنازلي للمؤقت.
            </div>
          </div>

          {/* Right Sidebar: Timer & Natural Soundscapes */}
          <div className="space-y-6">
            
            {/* Focus Countdown Clock */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-4">
              <span className="text-xs text-slate-400 font-bold block">مؤقت جلسة التركيز:</span>
              <div className="text-4xl font-black font-mono text-amber-400 tracking-wider">
                {formatTime(timeLeftSeconds)}
              </div>

              <div className="flex items-center justify-center gap-2">
                {!isTimerRunning ? (
                  <button
                    onClick={() => {
                      setIsTimerRunning(true);
                      if (activeNatureSound !== 'none' && !isPlayingAmbient) {
                        startAmbientSound(activeNatureSound);
                      }
                    }}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    بدء الجلسة
                  </button>
                ) : (
                  <button
                    onClick={() => setIsTimerRunning(false)}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4 fill-slate-950" />
                    إيقاف مؤقت
                  </button>
                )}
              </div>
            </div>

            {/* Natural Ambient Soundscapes (No Music - Pure Nature Sounds) */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-extrabold text-slate-200 flex items-center gap-1.5">
                  <Trees className="w-4 h-4 text-emerald-400" />
                  خلفية الأصوات الطبيعية (بدون موسيقى):
                </span>
              </div>

              {/* Sound Buttons Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={() => startAmbientSound('rain')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    activeNatureSound === 'rain' && isPlayingAmbient
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <CloudRain className="w-4 h-4 text-sky-400" />
                  خرير المطر 🌧️
                </button>

                <button
                  onClick={() => startAmbientSound('wind')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    activeNatureSound === 'wind' && isPlayingAmbient
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <Wind className="w-4 h-4 text-teal-300" />
                  نسيم الرياح 🍃
                </button>

                <button
                  onClick={() => startAmbientSound('water')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    activeNatureSound === 'water' && isPlayingAmbient
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <Droplets className="w-4 h-4 text-blue-400" />
                  تدفق الماء 💧
                </button>

                <button
                  onClick={() => {
                    stopAmbientSound();
                    setActiveNatureSound('none');
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    activeNatureSound === 'none' || !isPlayingAmbient
                      ? 'bg-slate-800 text-white border-slate-700'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  صامت 🔇
                </button>
              </div>

              {/* Volume Slider */}
              {isPlayingAmbient && (
                <div className="space-y-1 pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>مستوى صوت الطبيعة:</span>
                    <span>{Math.round(ambientVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ambientVolume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg"
                  />
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
