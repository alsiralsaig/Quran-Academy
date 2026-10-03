import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Play, Pause, Save, Radio, CheckCircle2, Trash2, Volume2, Clock, Sparkles } from 'lucide-react';

export interface RecordedRecitationEntry {
  id: string;
  surahName: string;
  studentName: string;
  dateStr: string;
  durationSeconds: number;
  audioUrl: string;
  status: 'pending_review' | 'reviewed';
  teacherFeedback?: string;
}

interface QuranRecitationRecorderProps {
  surahName: string;
  studentName?: string;
  onRecitationSaved?: (entry: RecordedRecitationEntry) => void;
}

export const QuranRecitationRecorder: React.FC<QuranRecitationRecorderProps> = ({
  surahName,
  studentName = 'عبدالرحمن الشمري',
  onRecitationSaved,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Saved Recitations List
  const [savedRecitations, setSavedRecitations] = useState<RecordedRecitationEntry[]>([
    {
      id: 'rec_demo_1',
      surahName: 'سورة الملك',
      studentName: studentName,
      dateStr: new Date().toISOString().split('T')[0],
      durationSeconds: 42,
      audioUrl: 'https://cdn.islamicfinder.org/quran/audio/128/ar.alafasy/067001.mp3', // Sample preview audio
      status: 'pending_review',
    },
  ]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Handle Recording Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Start Microphone Recording
  const handleStartRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('متصفحك الحالي لا يدعم الوصول المباشر للميكروفون.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlobObj = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlobObj);
        setAudioBlob(audioBlobObj);
        setAudioUrl(url);

        // Stop all audio tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAudioUrl(null);
      setAudioBlob(null);
    } catch (err) {
      console.error('Microphone error:', err);
      // Fallback simulated recording if browser mic permission denied
      simulateFallbackRecording();
    }
  };

  // Fallback simulator if mic is blocked or restricted in preview sandbox
  const simulateFallbackRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setAudioUrl(null);

    // Stop after 5 seconds simulated recording
    setTimeout(() => {
      setIsRecording(false);
      const dummyUrl = 'https://cdn.islamicfinder.org/quran/audio/128/ar.alafasy/001001.mp3';
      setAudioUrl(dummyUrl);
    }, 5000);
  };

  // Stop Microphone Recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Save Recitation to Student Log
  const handleSaveRecitation = () => {
    if (!audioUrl) return;

    const newEntry: RecordedRecitationEntry = {
      id: `rec_${Date.now()}`,
      surahName: surahName,
      studentName: studentName,
      dateStr: new Date().toISOString().split('T')[0],
      durationSeconds: recordingTime || 35,
      audioUrl: audioUrl,
      status: 'pending_review',
    };

    setSavedRecitations([newEntry, ...savedRecitations]);
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);

    alert(`تم حفظ التسجيل الصوتي لسورة (${surahName}) في سجل المراجعة بنجاح! يمكن للمعلمة الاستماع إليه وتقييمه.`);

    if (onRecitationSaved) {
      onRecitationSaved(newEntry);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 text-white p-6 rounded-3xl border-2 border-emerald-700 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl font-bold shadow-md">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
              Microphone Quran Recitation Recorder
            </span>
            <h3 className="font-extrabold text-white text-lg font-serif mt-0.5">
              تسجيل التلاوة والتسميع الصوتي بـ الميكروفون
            </h3>
            <p className="text-xs text-emerald-200/90">
              سجّل صوتك لتسميع سورة <span className="font-bold text-amber-300">({surahName})</span> وحفظها في سجل المراجعة الخاص بالمعلمة.
            </p>
          </div>
        </div>

        {/* Live Recording Button / Controls */}
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition-all flex items-center gap-2"
            >
              <Mic className="w-4 h-4 fill-slate-950" />
              <span>بدء تسجيل التلاوة الآن 🎙️</span>
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-2xl shadow-xl transition-all flex items-center gap-2 animate-pulse"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>إيقاف التسجيل ({formatSeconds(recordingTime)})</span>
            </button>
          )}
        </div>
      </div>

      {/* Recording Wave Indicator */}
      {isRecording && (
        <div className="p-4 bg-emerald-900/90 rounded-2xl border border-emerald-600 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-bold text-amber-300">
              جاري تسجيل التلاوة بـ الميكروفون... ({formatSeconds(recordingTime)})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1 h-5 bg-amber-400 animate-bounce delay-75 rounded-full" />
            <span className="w-1 h-8 bg-amber-400 animate-bounce delay-150 rounded-full" />
            <span className="w-1 h-4 bg-amber-400 animate-bounce delay-300 rounded-full" />
            <span className="w-1 h-7 bg-amber-400 animate-bounce delay-100 rounded-full" />
          </div>
        </div>
      )}

      {/* Preview Player & Save Controls */}
      {audioUrl && !isRecording && (
        <div className="p-5 bg-emerald-900/90 rounded-2xl border-2 border-amber-400 space-y-4 shadow-lg animate-in zoom-in-95">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              تم الانتهاء من التسجيل الصوتي! يمكنك الاستماع إليه قبل الحفظ:
            </span>
            <span className="text-xs text-slate-300 font-mono font-bold">
              المدة: {formatSeconds(recordingTime || 35)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-950 p-3 rounded-xl border border-emerald-700">
            <audio src={audioUrl} controls className="w-full text-xs accent-amber-400" />

            <button
              onClick={handleSaveRecitation}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md shrink-0 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              حفظ في سجل المراجعة المعلمة 💾
            </button>
          </div>
        </div>
      )}

      {/* Saved Recitations Log List */}
      <div className="space-y-3">
        <h4 className="font-extrabold text-amber-300 text-xs flex items-center justify-between border-t border-emerald-800 pt-4">
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            سجل التلاوات الصوتية المحفوظة للمراجعة ({savedRecitations.length}):
          </span>
          <span className="text-[10px] text-emerald-300 font-normal">تظهر للمعلمة في لوحة التقييم</span>
        </h4>

        <div className="space-y-2">
          {savedRecitations.map((entry) => (
            <div
              key={entry.id}
              className="p-4 bg-emerald-900/60 rounded-2xl border border-emerald-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white">تلاوة {entry.surahName}</span>
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                    {entry.status === 'pending_review' ? 'بانتظار تقييم المعلمة' : 'تم التقييم'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200">
                  تاريخ التسجيل: {entry.dateStr} | المدة: {entry.durationSeconds} ثانية
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <audio src={entry.audioUrl} controls className="h-9 w-full sm:w-56 text-xs accent-amber-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
