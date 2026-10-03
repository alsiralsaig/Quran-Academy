import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Sparkles,
  Volume2,
  CheckCircle2,
  Award,
  BookOpen,
  Settings,
  Bell
} from 'lucide-react';

export interface QuranPomodoroTimerProps {
  studentName?: string;
}

export const QuranPomodoroTimer: React.FC<QuranPomodoroTimerProps> = ({ studentName }) => {
  // Mode: 'focus' | 'break'
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  
  // Custom durations (in minutes)
  const [focusDuration, setFocusDuration] = useState<number>(25);
  const [breakDuration, setBreakDuration] = useState<number>(5);

  // Time remaining in seconds
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Stats
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(2);

  // Settings dropdown modal state
  const [showSettings, setShowSettings] = useState(false);

  // Motivational Quranic Quotes for Memorization Focus
  const MOTIVATIONAL_QUOTES = [
    '﴿وَوَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ﴾',
    '﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾',
    '﴿الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾',
    'خيركم من تعلم القرآن وعلّمه - النبي محمد ﷺ',
    'إن صاحب القرآن يرتقي برتب الجنة بعدد الآيات التي يحفظها ويرتلها.',
  ];
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Harmonized Web Audio Chime Generator
  const playCompletionChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chime
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 0.8);
      });
    } catch (e) {
      console.error('Audio chime error:', e);
    }
  };

  // Countdown timer logic using setInterval
  useEffect(() => {
    let timer: any = null;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Session ended -> trigger alert chime sound
      playCompletionChime();

      if (mode === 'focus') {
        // Completed a focus session -> switch to break
        setCompletedSessionsCount((c) => c + 1);
        setMode('break');
        setTimeLeft(breakDuration * 60);
        setCurrentQuoteIndex((idx) => (idx + 1) % MOTIVATIONAL_QUOTES.length);
        alert('🎉 أحسنت! أتممت جلسة التركيز والتسميع الذاتي بنجاح (+20 نقطة تركيز). خذ الآن قسطاً من الراحة.');
      } else {
        // Completed break -> switch to focus
        setMode('focus');
        setTimeLeft(focusDuration * 60);
        alert('🔔 انتهى وقت الراحة! استعد لبدء جولة الحفظ والتسميع التالية.');
      }
      setIsRunning(false);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode, focusDuration, breakDuration]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      setTimeLeft(focusDuration * 60);
    } else {
      setTimeLeft(breakDuration * 60);
    }
  };

  const handleSwitchMode = (newMode: 'focus' | 'break') => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'focus') {
      setTimeLeft(focusDuration * 60);
    } else {
      setTimeLeft(breakDuration * 60);
    }
  };

  const handleSelectPreset = (focusMins: number, breakMins: number) => {
    setIsRunning(false);
    setFocusDuration(focusMins);
    setBreakDuration(breakMins);
    setMode('focus');
    setTimeLeft(focusMins * 60);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const totalSeconds = mode === 'focus' ? focusDuration * 60 : breakDuration * 60;
  const progressPercent = Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
            <Timer className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                Quran Memorization Pomodoro
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg font-serif">
              مؤقت التركيز والحفظ المتقن (Pomodoro)
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
          <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border">
            جلسات اليوم المكتملة: <span className="font-extrabold text-emerald-700">{completedSessionsCount}</span> 🏆
          </span>

          <button
            onClick={playCompletionChime}
            className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl border border-amber-300 flex items-center gap-1"
            title="تجربة صوت تنبيه انتهاء الجلسة"
          >
            <Volume2 className="w-4 h-4 text-amber-700" />
            <span>تجربة التنبيه 🔔</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border"
            title="ضبط أوقات التركيز والراحة"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Buttons Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
        <button
          onClick={() => handleSelectPreset(25, 5)}
          className={`px-4 py-2 rounded-xl border transition-all ${
            focusDuration === 25 && breakDuration === 5
              ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          25 دقيقة حفظ / 5 دقائق راحة (حفظ آيات)
        </button>

        <button
          onClick={() => handleSelectPreset(45, 10)}
          className={`px-4 py-2 rounded-xl border transition-all ${
            focusDuration === 45 && breakDuration === 10
              ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          45 دقيقة مراجعة / 10 دقائق راحة (تثبيت جزء)
        </button>

        <button
          onClick={() => handleSelectPreset(15, 3)}
          className={`px-4 py-2 rounded-xl border transition-all ${
            focusDuration === 15 && breakDuration === 3
              ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          15 دقيقة تركيز / 3 دقائق راحة (تسميع سريع)
        </button>
      </div>

      {/* Main Timer Display Board */}
      <div className={`p-8 sm:p-10 rounded-3xl border-2 text-center space-y-6 transition-all relative overflow-hidden ${
        mode === 'focus'
          ? 'bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 text-white border-emerald-700 shadow-xl'
          : 'bg-gradient-to-b from-amber-500 via-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-xl'
      }`}>
        
        {/* Mode Indicator & Motivational Quote */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold border border-white/30">
            {mode === 'focus' ? (
              <>
                <Brain className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>وضع جلسة الحفظ والتركيز العالي</span>
              </>
            ) : (
              <>
                <Coffee className="w-4 h-4 text-slate-950" />
                <span>وضع استراحة الاسترخاء وتجديد النشاط</span>
              </>
            )}
          </div>

          <p className="font-serif font-extrabold text-base sm:text-lg max-w-lg mx-auto opacity-95">
            "{MOTIVATIONAL_QUOTES[currentQuoteIndex]}"
          </p>
        </div>

        {/* Big Digital Timer Display */}
        <div className="space-y-2">
          <span className="text-6xl sm:text-7xl font-black font-mono tracking-widest block drop-shadow-md">
            {formatTime(timeLeft)}
          </span>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto space-y-1">
            <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/20">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-bold opacity-80">إنجاز الجلسة الحالية: {progressPercent}%</span>
          </div>
        </div>

        {/* Interactive Action Controls */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <button
            onClick={handleStartPause}
            className={`px-8 py-3.5 font-extrabold text-sm rounded-2xl transition-all shadow-lg flex items-center gap-2 ${
              mode === 'focus'
                ? 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                : 'bg-slate-950 hover:bg-slate-900 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isRunning ? 'إيقاف مؤقت' : 'بدء جلسة الحفظ'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-3.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30 text-current transition-all"
            title="إعادة ضبط المؤقت"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleSwitchMode(mode === 'focus' ? 'break' : 'focus')}
            className="px-4 py-3.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm font-bold rounded-2xl border border-white/30 text-current transition-all"
          >
            {mode === 'focus' ? 'الانتقال للراحة' : 'العودة للحفظ'}
          </button>
        </div>

      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="p-5 bg-slate-50 rounded-2xl border space-y-3 text-xs">
          <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 border-b pb-2">
            <Settings className="w-4 h-4 text-emerald-700" />
            تخصيص مدة جلسات الحفظ والراحة:
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">مدة جلسة الحفظ (بالدقائق):</label>
              <input
                type="number"
                min={5}
                max={120}
                value={focusDuration}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFocusDuration(val);
                  if (mode === 'focus' && !isRunning) setTimeLeft(val * 60);
                }}
                className="w-full p-2 border rounded-xl font-bold bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">مدة الاستراحة (بالدقائق):</label>
              <input
                type="number"
                min={1}
                max={60}
                value={breakDuration}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setBreakDuration(val);
                  if (mode === 'break' && !isRunning) setTimeLeft(val * 60);
                }}
                className="w-full p-2 border rounded-xl font-bold bg-white"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
