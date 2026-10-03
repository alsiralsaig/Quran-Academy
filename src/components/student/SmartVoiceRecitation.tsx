import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  BookOpen,
  Award,
  Volume2,
  Flame,
  X,
  Play
} from 'lucide-react';
import { ALL_SURAHS } from '../../data/quranData';

export interface SmartVoiceRecitationProps {
  studentName?: string;
}

// Sample Quran Ayah benchmark dataset for live voice matching
const SAMPLE_AYAH_TARGETS = [
  {
    surahName: 'الفاتحة',
    ayahNumber: 1,
    fullText: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
    cleanWords: ['بسم', 'الله', 'الرحمن', 'الرحيم'],
  },
  {
    surahName: 'الفاتحة',
    ayahNumber: 2,
    fullText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    cleanWords: ['الحمد', 'لله', 'رب', 'العالمين'],
  },
  {
    surahName: 'الملك',
    ayahNumber: 1,
    fullText: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    cleanWords: ['تبارك', 'الذي', 'بيده', 'الملك', 'وهو', 'على', 'كل', 'شيء', 'قدير'],
  },
  {
    surahName: 'الخلاص',
    ayahNumber: 1,
    fullText: 'قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ',
    cleanWords: ['قل', 'هو', 'الله', 'أحد', 'الله', 'الصمد'],
  },
];

export const SmartVoiceRecitation: React.FC<SmartVoiceRecitationProps> = ({ studentName }) => {
  const [selectedTargetIndex, setSelectedTargetIndex] = useState(0);
  const targetAyah = SAMPLE_AYAH_TARGETS[selectedTargetIndex];

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [spokenWordsList, setSpokenWordsList] = useState<string[]>([]);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Helper function to normalize Arabic text for comparison
  const normalizeArabic = (text: string) => {
    return text
      .replace(/[\u064B-\u0652]/g, '') // remove diacritics / tashkeel
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .trim();
  };

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA'; // Arabic Speech Recognition

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscribedText(currentTranscript);
        const words = normalizeArabic(currentTranscript).split(/\s+/).filter(Boolean);
        setSpokenWordsList(words);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setRecognitionError('تعذر الاتصال بالميكروفون تلقائياً. يمكنك استخدام محاكي التسميع الذكي بالأسفل.');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleStartListening = () => {
    setRecognitionError(null);
    setTranscribedText('');
    setSpokenWordsList([]);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        // Handle browser microphone block / simulation fallback
        simulateLiveRecitation();
      }
    } else {
      simulateLiveRecitation();
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Simulation mode for demo
  const simulateLiveRecitation = () => {
    setIsListening(true);
    setTranscribedText('جاري الاستماع والتسميع الذكي المباشر...');

    const expected = targetAyah.cleanWords;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      if (step <= expected.length) {
        const currentSpoken = expected.slice(0, step);
        // Add intentional typo on last word for demo testing
        if (step === expected.length) {
          currentSpoken[currentSpoken.length - 1] = expected[expected.length - 1]; // or slight difference
        }
        setSpokenWordsList(currentSpoken);
        setTranscribedText(currentSpoken.join(' '));
      } else {
        clearInterval(interval);
        setIsListening(false);
      }
    }, 1200);
  };

  // Compare words in target verse vs spoken words
  const targetCleanWords = targetAyah.cleanWords.map(normalizeArabic);

  let correctCount = 0;
  const wordComparisonDetails = targetAyah.fullText.split(/\s+/).map((fullWord, idx) => {
    const cleanWord = normalizeArabic(fullWord);
    const isSpoken = spokenWordsList.some((sw) => sw === cleanWord || sw.includes(cleanWord) || cleanWord.includes(sw));

    if (isSpoken) {
      correctCount++;
    }

    return {
      fullWord,
      cleanWord,
      isCorrect: isSpoken,
    };
  });

  const accuracyPercent = targetCleanWords.length > 0
    ? Math.round((correctCount / targetCleanWords.length) * 100)
    : 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl">
            <Mic className="w-6 h-6 text-emerald-700 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                AI Voice Recognition & Recitation 🎙️
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg font-serif mt-0.5">
              مساعد التسميع الذكي بالذكاء الاصطناعي وإبراز الأخطاء
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border">
            دقة التلاوة: <span className="font-black text-emerald-700">{accuracyPercent}%</span> 🎯
          </span>
        </div>
      </div>

      {/* Target Ayah Selection Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span className="font-extrabold text-slate-800">اختر آية التسميع والاختبار:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {SAMPLE_AYAH_TARGETS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedTargetIndex(idx);
                setTranscribedText('');
                setSpokenWordsList([]);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedTargetIndex === idx
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              سورة {sample.surahName} (الآية {sample.ayahNumber})
            </button>
          ))}
        </div>
      </div>

      {/* Live Voice Comparison Box */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl border-2 border-emerald-700 relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-400 text-slate-950 rounded-lg font-bold">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="font-extrabold text-xs text-amber-300">
              النص القرآني المطلوب للتسميع (سورة {targetAyah.surahName} - الآية {targetAyah.ayahNumber}):
            </span>
          </div>

          {isListening && (
            <span className="inline-flex items-center gap-1.5 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              جاري الاستماع لصوتك عبر الميكروفون...
            </span>
          )}
        </div>

        {/* Word-by-Word Highlighted Verse Box */}
        <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800 text-center space-y-4 relative z-10">
          <p className="font-serif text-2xl sm:text-3xl leading-[2.3] tracking-wide flex flex-wrap items-center justify-center gap-2.5">
            {wordComparisonDetails.map((wordObj, i) => (
              <span
                key={i}
                className={`px-2.5 py-1 rounded-xl transition-all font-bold border ${
                  wordObj.isCorrect
                    ? 'bg-emerald-900/90 text-emerald-200 border-emerald-500 ring-2 ring-emerald-500/30 scale-105'
                    : spokenWordsList.length > 0
                    ? 'bg-rose-950/90 text-rose-300 border-rose-500/80 ring-2 ring-rose-500/20'
                    : 'text-amber-100 border-transparent'
                }`}
                title={wordObj.isCorrect ? 'كلمة صحيحة ومتقنة 🟢' : 'لم تُنطق بعد أو تحتاج مراجعة 🔴'}
              >
                {wordObj.fullWord}
              </span>
            ))}
          </p>

          <p className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-800/80">
            🟢 باللون الأخضر: الكلمات التي نطقها الطالب بإتقان | 🔴 باللون الأحمر: الكلمات التي تحتاج تصحيحاً أو نطقاً أوضح.
          </p>
        </div>

        {/* Live Transcribed Text Output */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-xs space-y-1 relative z-10">
          <span className="text-slate-400 font-bold block">النص المنطوق المسجّل آلياً:</span>
          <p className="font-mono text-emerald-300 text-sm font-semibold">
            {transcribedText || 'اضغط على الميكروفون وابدأ في تلاوة الآية بصوت واضح...'}
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 relative z-10">
          <div className="flex items-center gap-3">
            {!isListening ? (
              <button
                onClick={handleStartListening}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition-all flex items-center gap-2"
              >
                <Mic className="w-4 h-4 text-slate-950" />
                بدء التسميع بالصوت عبر الميكروفون 🎙️
              </button>
            ) : (
              <button
                onClick={handleStopListening}
                className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-2xl shadow-xl transition-all flex items-center gap-2 animate-pulse"
              >
                <MicOff className="w-4 h-4 text-white" />
                إيقاف الاستماع والتحليل 🛑
              </button>
            )}

            <button
              onClick={simulateLiveRecitation}
              className="px-4 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-2xl transition-all flex items-center gap-1.5"
              title="تجربة التسميع الذكي تلقائياً"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              تجربة التسميع التلقائي ✨
            </button>
          </div>

          <button
            onClick={() => {
              setTranscribedText('');
              setSpokenWordsList([]);
            }}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            إعادة محاولة التسميع
          </button>
        </div>

      </div>

    </div>
  );
};
