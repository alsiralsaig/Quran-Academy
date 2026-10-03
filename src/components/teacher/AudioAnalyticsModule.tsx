import React, { useState } from 'react';
import {
  Mic,
  Activity,
  BarChart2,
  Sparkles,
  Volume2,
  Play,
  Pause,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Award,
  FileText,
  Sliders,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export interface AudioAnalyticsModuleProps {
  teacherName?: string;
}

export interface StudentAudioRecordingSample {
  id: string;
  studentName: string;
  surahName: string;
  ayahRange: string;
  dateUploaded: string;
  durationSeconds: number;
  recitationSpeedWpm: number; // Words Per Minute
  makharijScore: number; // 0 - 100
  tajweedAccuracyScore: number; // 0 - 100
  makharijBreakdown: {
    halq: number; // الحلق
    lisan: number; // اللسان
    shafatain: number; // الشفتان
    maddAndGhunnah: number; // المدود والغنة
  };
  detectedSpeedGraphData: { verseLabel: string; wpm: number; status: 'optimal' | 'fast' | 'slow' }[];
  aiAnalysisSummary: string;
  teacherRecommendation: string;
}

export const AudioAnalyticsModule: React.FC<AudioAnalyticsModuleProps> = ({ teacherName }) => {
  const [samplesList, setSamplesList] = useState<StudentAudioRecordingSample[]>([
    {
      id: 'rec_1',
      studentName: 'عبدالرحمن الشمري',
      surahName: 'سورة البقرة',
      ayahRange: 'آية 1 - 15',
      dateUploaded: '2026-10-01',
      durationSeconds: 145,
      recitationSpeedWpm: 48,
      makharijScore: 94,
      tajweedAccuracyScore: 92,
      makharijBreakdown: {
        halq: 96,
        lisan: 92,
        shafatain: 98,
        maddAndGhunnah: 90,
      },
      detectedSpeedGraphData: [
        { verseLabel: 'الآيات 1 - 3', wpm: 44, status: 'optimal' },
        { verseLabel: 'الآيات 4 - 6', wpm: 52, status: 'fast' },
        { verseLabel: 'الآيات 7 - 10', wpm: 46, status: 'optimal' },
        { verseLabel: 'الآيات 11 - 15', wpm: 45, status: 'optimal' },
      ],
      aiAnalysisSummary: 'تلاوة متزنة وممتازة. انضباط عالي في مخارج حروف الشفتين (الباء والميم) مع سلامة القلقلة في حرف القاف.',
      teacherRecommendation: 'ينصح بالتأني القليل عند مد المنفصل في الآية 5 للحفاظ على اتساق الوتيرة.',
    },
    {
      id: 'rec_2',
      studentName: 'فاطمة الزهراء',
      surahName: 'سورة الملك',
      ayahRange: 'آية 1 - 12',
      dateUploaded: '2026-09-28',
      durationSeconds: 120,
      recitationSpeedWpm: 58,
      makharijScore: 88,
      tajweedAccuracyScore: 86,
      makharijBreakdown: {
        halq: 85,
        lisan: 88,
        shafatain: 92,
        maddAndGhunnah: 84,
      },
      detectedSpeedGraphData: [
        { verseLabel: 'الآيات 1 - 3', wpm: 58, status: 'fast' },
        { verseLabel: 'الآيات 4 - 7', wpm: 60, status: 'fast' },
        { verseLabel: 'الآيات 8 - 12', wpm: 54, status: 'optimal' },
      ],
      aiAnalysisSummary: 'سرعة التلاوة أسرع قتيلاً من الوتيرة النموذجية للتجويد. لوحظ تسرع طفيف في استيفاء غنة النون المشددة.',
      teacherRecommendation: 'إبطاء سرعة النطق وإعطاء الغنة حقها بمقدار حركتين كاملتين.',
    },
  ]);

  const [selectedSample, setSelectedSample] = useState<StudentAudioRecordingSample>(samplesList[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isAnalyzingNewAudio, setIsAnalyzingNewAudio] = useState<boolean>(false);

  const handleSimulateNewAudioUpload = () => {
    setIsAnalyzingNewAudio(true);
    setTimeout(() => {
      const newSample: StudentAudioRecordingSample = {
        id: `rec_${Date.now()}`,
        studentName: 'سارة خالد العتيبي',
        surahName: 'سورة يس',
        ayahRange: 'آية 1 - 10',
        dateUploaded: new Date().toISOString().split('T')[0],
        durationSeconds: 110,
        recitationSpeedWpm: 46,
        makharijScore: 96,
        tajweedAccuracyScore: 95,
        makharijBreakdown: {
          halq: 98,
          lisan: 95,
          shafatain: 96,
          maddAndGhunnah: 94,
        },
        detectedSpeedGraphData: [
          { verseLabel: 'الآيات 1 - 4', wpm: 45, status: 'optimal' },
          { verseLabel: 'الآيات 5 - 8', wpm: 46, status: 'optimal' },
          { verseLabel: 'الآيات 9 - 10', wpm: 48, status: 'optimal' },
        ],
        aiAnalysisSummary: 'تلاوة صوتية ناصعة ومتقنة جداً. نطق سليم لأحكام الإظهار والمد اللازم الكلمي.',
        teacherRecommendation: 'ممتازة جداً ومؤهلة للحصول على وسام ترتيل السور المباركة.',
      };

      setSamplesList([newSample, ...samplesList]);
      setSelectedSample(newSample);
      setIsAnalyzingNewAudio(false);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 text-purple-900 rounded-2xl">
            <Activity className="w-6 h-6 text-purple-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-300">
                AI Phonetic Recitation & Audio Speech Analytics 🎙️
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg font-serif mt-0.5">
              وحدة تحليل تسجيلات الطلاب الصوتية ومخارج الحروف للمعلم
            </h3>
          </div>
        </div>

        <button
          onClick={handleSimulateNewAudioUpload}
          disabled={isAnalyzingNewAudio}
          className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
        >
          {isAnalyzingNewAudio ? (
            <>
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              جاري تحليل التسجيل الصوتي بالذكاء الاصطناعي...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-amber-300" />
              رفع وتحليل تسجيل صوتي جديد 🎙️
            </>
          )}
        </button>
      </div>

      {/* Select Student Audio Sample Selector */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold text-slate-700 block">اختر التسميع الصوتي المراد تحليله:</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {samplesList.map((sample) => {
            const isSelected = selectedSample.id === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => setSelectedSample(sample)}
                className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 text-white border-purple-500 shadow-md ring-2 ring-purple-400'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-700/50 pb-1.5 mb-1.5">
                    <span className="font-extrabold text-xs text-amber-300">{sample.studentName}</span>
                    <span className="text-[10px] text-slate-400">{sample.dateUploaded}</span>
                  </div>
                  <span className="font-serif font-bold text-xs block">{sample.surahName} ({sample.ayahRange})</span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold mt-2 pt-2 border-t border-slate-700/50">
                  <span className="text-emerald-400">صحة المخارج: {sample.makharijScore}%</span>
                  <span className="text-purple-300">السرعة: {sample.recitationSpeedWpm} كلمة/د</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Audio Analysis Dashboard Box */}
      <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl border-2 border-purple-800 shadow-xl space-y-6 relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Selected Sample Player & Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
          <div className="space-y-1">
            <span className="bg-purple-900 text-purple-200 border border-purple-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              تحليل التسميع الصوتي لـ: {selectedSample.studentName}
            </span>
            <h4 className="font-extrabold text-lg text-amber-300 font-serif">
              {selectedSample.surahName} ({selectedSample.ayahRange})
            </h4>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2"
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  إيقاف مؤقت
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  استماع للتسجيل الصوتي ({selectedSample.durationSeconds} ثانية)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1 text-center">
            <span className="text-[10px] font-bold text-slate-400 block">دقة صحة مخارج الحروف</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{selectedSample.makharijScore}%</span>
            <span className="text-[10px] text-emerald-300 block">إتقان عالي جداً</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1 text-center">
            <span className="text-[10px] font-bold text-slate-400 block">متوسط سرعة التلاوة</span>
            <span className="text-2xl font-black text-amber-300 font-mono">{selectedSample.recitationSpeedWpm}</span>
            <span className="text-[10px] text-amber-200 block">كلمة / دقيقة (WPM)</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1 text-center">
            <span className="text-[10px] font-bold text-slate-400 block">درجة التجويد الشاملة</span>
            <span className="text-2xl font-black text-purple-300 font-mono">{selectedSample.tajweedAccuracyScore}%</span>
            <span className="text-[10px] text-purple-200 block">تطبيق ممتاز للأحكام</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1 text-center">
            <span className="text-[10px] font-bold text-slate-400 block">مدة التسجيل</span>
            <span className="text-2xl font-black text-teal-300 font-mono">{selectedSample.durationSeconds} ثانية</span>
            <span className="text-[10px] text-teal-200 block">تسميع كامل متصل</span>
          </div>
        </div>

        {/* Visual Charts Grid: 1) Recitation Speed Graph 2) Makharij Accuracy Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          
          {/* Chart 1: Recitation Speed Variations WPM */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h5 className="font-extrabold text-amber-300 text-xs flex items-center gap-1.5 font-serif">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                رسم بياني لسرعة التلاوة والوتيرة عبر الآيات (WPM) 📈
              </h5>
            </div>

            <div className="space-y-3 pt-2">
              {selectedSample.detectedSpeedGraphData.map((speedData, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">{speedData.verseLabel}:</span>
                    <span className={speedData.status === 'optimal' ? 'text-emerald-400' : 'text-amber-300'}>
                      {speedData.wpm} كلمة/د ({speedData.status === 'optimal' ? 'وتيرة نموذجية 🟢' : 'سريعة قليلاً 🟡'})
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, (speedData.wpm / 80) * 100)}%` }}
                      className={`h-full transition-all ${
                        speedData.status === 'optimal' ? 'bg-emerald-500' : 'bg-amber-400'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 text-center font-medium">
              الوتيرة النموذجية للتجويد والترتيل المعتدل: بين 40 إلى 50 كلمة في الدقيقة.
            </p>
          </div>

          {/* Chart 2: Makharij Phonetic Accuracy Breakdown */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h5 className="font-extrabold text-amber-300 text-xs flex items-center gap-1.5 font-serif">
                <BarChart2 className="w-4 h-4 text-purple-400" />
                رسم بياني لمدى صحة مخارج الحروف والأحكام (Phonetic Accuracy) 🎙️
              </h5>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">مخارج الحروف الحلقية (أ، هـ، ع، ح، غ، خ):</span>
                  <span className="text-emerald-400 font-mono">{selectedSample.makharijBreakdown.halq}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div style={{ width: `${selectedSample.makharijBreakdown.halq}%` }} className="bg-emerald-500 h-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">مخارج اللسان (ق، ك، ج، ش، ط، د، ت):</span>
                  <span className="text-purple-300 font-mono">{selectedSample.makharijBreakdown.lisan}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div style={{ width: `${selectedSample.makharijBreakdown.lisan}%` }} className="bg-purple-500 h-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">مخارج الشفتين (الباء، الميم، الواو):</span>
                  <span className="text-teal-300 font-mono">{selectedSample.makharijBreakdown.shafatain}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div style={{ width: `${selectedSample.makharijBreakdown.shafatain}%` }} className="bg-teal-400 h-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">أحكام المدود والغنة والإخفاء:</span>
                  <span className="text-amber-300 font-mono">{selectedSample.makharijBreakdown.maddAndGhunnah}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div style={{ width: `${selectedSample.makharijBreakdown.maddAndGhunnah}%` }} className="bg-amber-400 h-full" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* AI Analysis Summary & Teacher Action Recommendation Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 relative z-10">
          <div className="bg-purple-950/60 p-4 rounded-2xl border border-purple-800 space-y-1">
            <span className="font-extrabold text-amber-300 block flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-300" />
              ملخص تحليل الذكاء الاصطناعي للتسميع:
            </span>
            <p className="text-purple-100 font-medium leading-relaxed">{selectedSample.aiAnalysisSummary}</p>
          </div>

          <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800 space-y-1">
            <span className="font-extrabold text-emerald-300 block flex items-center gap-1">
              <UserCheck className="w-4 h-4 text-emerald-300" />
              التوصية الموجهة للطالب من المعلمة:
            </span>
            <p className="text-emerald-100 font-medium leading-relaxed">{selectedSample.teacherRecommendation}</p>
          </div>
        </div>

      </div>

    </div>
  );
};
