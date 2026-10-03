import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, CheckCircle2, BookOpen, Sparkles, X, Plus, Calendar, Volume2, Save } from 'lucide-react';
import { ALL_SURAHS } from '../../data/quranData';

export interface QuickReviewEntry {
  id: string;
  date: string;
  surahName: string;
  fromAyah: number;
  toAyah: number;
  notes: string;
  checklist: {
    listenedToReciter: boolean;
    repeatedDifficultAyahs: boolean;
    readTafsir: boolean;
  };
  audioUrl?: string;
  audioDurationSeconds?: number;
  isReadyForClass: boolean;
}

interface QuickReviewModeProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'etqan_student_quick_reviews';

export const QuickReviewMode: React.FC<QuickReviewModeProps> = ({ isOpen, onClose }) => {
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Form State
  const [surahName, setSurahName] = useState('سورة البقرة');
  const [fromAyah, setFromAyah] = useState(1);
  const [toAyah, setToAyah] = useState(25);
  const [notesText, setNotesText] = useState('');
  const [checklist, setChecklist] = useState({
    listenedToReciter: true,
    repeatedDifficultAyahs: false,
    readTafsir: false,
  });

  // Saved Entries State
  const [savedEntries, setSavedEntries] = useState<QuickReviewEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [
        {
          id: 'review_1',
          date: new Date().toLocaleDateString('ar-SA'),
          surahName: 'سورة البقرة',
          fromAyah: 1,
          toAyah: 20,
          notes: 'تمت مراجعة المتشابهات والتثبيت الجيد، جاهز للتسميع مع المعلمة.',
          checklist: { listenedToReciter: true, repeatedDifficultAyahs: true, readTafsir: true },
          isReadyForClass: true,
        }
      ];
    } catch {
      return [];
    }
  });

  const [toastSuccess, setToastSuccess] = useState('');

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedEntries));
    } catch (e) {
      console.error('Failed to save quick reviews:', e);
    }
  }, [savedEntries]);

  // Handle Recording Start/Stop
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('تعذر الوصول إلى الميكروفون. يرجى التأكد من سماح المتصفح بدخول الميكروفون.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioBlobUrl) return;

    if (isPlayingAudio && audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    const audio = new Audio(audioBlobUrl);
    audioElementRef.current = audio;
    audio.play();
    setIsPlayingAudio(true);

    audio.onended = () => setIsPlayingAudio(false);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();

    const newEntry: QuickReviewEntry = {
      id: `review_${Date.now()}`,
      date: new Date().toLocaleDateString('ar-SA'),
      surahName,
      fromAyah: Number(fromAyah),
      toAyah: Number(toAyah),
      notes: notesText,
      checklist,
      audioUrl: audioBlobUrl || undefined,
      audioDurationSeconds: recordingTime,
      isReadyForClass: true,
    };

    setSavedEntries((prev) => [newEntry, ...prev]);
    setNotesText('');
    setAudioBlobUrl(null);
    setRecordingTime(0);
    setToastSuccess('تم حفظ جلسة التحضير والمراجعة الذاتية بنجاح!');
    setTimeout(() => setToastSuccess(''), 4000);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-emerald-100 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
              <Mic className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                  Quick Review Mode
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg font-serif">وضع التحضير والمراجعة الذاتية السريعة</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {toastSuccess && (
          <div className="p-4 bg-emerald-50 text-emerald-900 font-bold text-xs rounded-2xl border border-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            {toastSuccess}
          </div>
        )}

        {/* Main Review Form */}
        <form onSubmit={handleSaveReview} className="space-y-5 text-xs">
          
          {/* Surah & Ayah range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block font-bold text-slate-700 mb-1">السورة المراد تحضيرها</label>
              <select
                value={surahName}
                onChange={(e) => setSurahName(e.target.value)}
                className="w-full p-2.5 border rounded-xl font-bold bg-white"
              >
                {ALL_SURAHS.map((surah) => (
                  <option key={surah.number} value={`سورة ${surah.name}`}>
                    {surah.number}. سورة {surah.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">من آية</label>
              <input
                type="number"
                min={1}
                required
                value={fromAyah}
                onChange={(e) => setFromAyah(Number(e.target.value))}
                className="w-full p-2.5 border rounded-xl font-bold bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">إلى آية</label>
              <input
                type="number"
                min={1}
                required
                value={toAyah}
                onChange={(e) => setToAyah(Number(e.target.value))}
                className="w-full p-2.5 border rounded-xl font-bold bg-white"
              />
            </div>
          </div>

          {/* Voice Note Recorder Section */}
          <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-emerald-700" />
                تسجيل صوتی ذاتي للتسميع المبدئي:
              </span>
              {recordingTime > 0 && (
                <span className="font-mono text-emerald-800 font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                  {formatSeconds(recordingTime)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
                >
                  <Mic className="w-4 h-4 text-amber-300" />
                  بدء التسجيل الصوتي الذاتي
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md animate-pulse"
                >
                  <Square className="w-4 h-4" />
                  إيقاف التسجيل ({formatSeconds(recordingTime)})
                </button>
              )}

              {audioBlobUrl && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlayback}
                    className="px-3.5 py-2.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold rounded-xl flex items-center gap-1.5"
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-emerald-800" />}
                    {isPlayingAudio ? 'إيقاف التكرار' : 'استماع للتسجيل'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudioBlobUrl(null)}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200"
                    title="حذف التسجيل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Self Preparation Checklist */}
          <div className="space-y-2">
            <span className="font-extrabold text-slate-800 block">قائمة تحقق التحضير الذاتي:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.listenedToReciter}
                  onChange={(e) => setChecklist({ ...checklist, listenedToReciter: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 font-semibold">الاستماع للقارئ المتقن</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.repeatedDifficultAyahs}
                  onChange={(e) => setChecklist({ ...checklist, repeatedDifficultAyahs: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 font-semibold">تكرار المقاطع الصعبة</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.readTafsir}
                  onChange={(e) => setChecklist({ ...checklist, readTafsir: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 font-semibold">قراءة التفسير الميسر</span>
              </label>
            </div>
          </div>

          {/* Written Self Notes */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">ملاحظاتك وسجلات التثبيت الذاتية</label>
            <textarea
              rows={2}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="اكتب ملاحظتك الذاتية (مثال: الانتباه لمد الصلة في آية 12 والتركيز على متشابهات آية 19 مع سورة النساء)..."
              className="w-full p-3 border rounded-xl font-sans"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              إغلاق
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              حفظ جلسة التحضير الذاتي
            </button>
          </div>
        </form>

        {/* Previous Self-Review Sessions List */}
        {savedEntries.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-700" />
              سجل التحضير والمراجعات الذاتية السابقة:
            </h4>

            <div className="max-h-40 overflow-y-auto space-y-2 pr-1 text-xs">
              {savedEntries.map((entry) => (
                <div key={entry.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">{entry.surahName} (آية {entry.fromAyah} - {entry.toAyah})</span>
                    <span className="text-slate-400 text-[10px]">{entry.date}</span>
                  </div>
                  {entry.notes && <p className="text-slate-600 italic text-[11px]">{entry.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
