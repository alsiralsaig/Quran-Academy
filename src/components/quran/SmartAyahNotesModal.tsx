import React, { useState, useEffect } from 'react';
import {
  FileText,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Save,
  CheckCircle2,
  X,
  Sparkles,
  BookOpen,
  Volume2
} from 'lucide-react';

export interface AyahNoteEntry {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  ayahText: string;
  textNote: string;
  audioNoteBlobUrl?: string;
  updatedAt: string;
}

export interface SmartAyahNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  ayahText: string;
  onNoteSaved?: () => void;
}

export const SmartAyahNotesModal: React.FC<SmartAyahNotesModalProps> = ({
  isOpen,
  onClose,
  surahNumber,
  surahName,
  ayahNumber,
  ayahText,
  onNoteSaved,
}) => {
  const noteKey = `quran_note_${surahNumber}_${ayahNumber}`;

  const [textNote, setTextNote] = useState<string>('');
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isPlayingRecordedAudio, setIsPlayingRecordedAudio] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<boolean>(false);

  // Load existing note from localStorage
  useEffect(() => {
    if (isOpen) {
      const savedData = localStorage.getItem(noteKey);
      if (savedData) {
        try {
          const parsed: AyahNoteEntry = JSON.parse(savedData);
          setTextNote(parsed.textNote || '');
          setAudioBlobUrl(parsed.audioNoteBlobUrl || null);
        } catch {
          setTextNote('');
          setAudioBlobUrl(null);
        }
      } else {
        setTextNote('');
        setAudioBlobUrl(null);
      }
    }
  }, [isOpen, noteKey]);

  if (!isOpen) return null;

  // Handle Recording Audio Note
  const startRecordingAudioNote = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlobUrl(url);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecordingAudio(true);
    } catch (err) {
      alert('يرجى السماح بالوصول إلى الميكروفون لتسجيل الملاحظات الصوتية.');
    }
  };

  const stopRecordingAudioNote = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecordingAudio(false);
    }
  };

  const handleSaveNote = () => {
    const noteEntry: AyahNoteEntry = {
      id: `note_${surahNumber}_${ayahNumber}`,
      surahNumber,
      surahName,
      ayahNumber,
      ayahText,
      textNote,
      audioNoteBlobUrl: audioBlobUrl || undefined,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    localStorage.setItem(noteKey, JSON.stringify(noteEntry));
    setSaveSuccessMessage(true);

    if (onNoteSaved) {
      onNoteSaved();
    }

    setTimeout(() => {
      setSaveSuccessMessage(false);
      onClose();
    }, 1200);
  };

  const handleDeleteNote = () => {
    localStorage.removeItem(noteKey);
    setTextNote('');
    setAudioBlobUrl(null);
    if (onNoteSaved) {
      onNoteSaved();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-950 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-emerald-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-2xl">
              <FileText className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                Smart Ayah Annotation 📝
              </span>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-serif mt-0.5">
                التدوين الذكي على الآية ({ayahNumber}) - سورة {surahName}
              </h3>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verse Highlight Card */}
        <div className="p-4 bg-emerald-50/80 dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block">نص الآية الكريمة:</span>
          <p className="font-serif font-extrabold text-slate-900 dark:text-slate-100 text-base leading-relaxed">
            "{ayahText}"
          </p>
        </div>

        {/* Text Note Input */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
            الملاحظات والفوائد النصية:
          </label>
          <textarea
            value={textNote}
            onChange={(e) => setTextNote(e.target.value)}
            rows={4}
            placeholder="اكتب ملاحظاتك التجويدية، التفسيرية، أو تنبيهات الحفظ الخاصة بهذه الآية..."
            className="w-full p-3.5 text-xs border rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium dark:bg-slate-900 dark:text-white dark:border-slate-800"
          />
        </div>

        {/* Voice Note Recorder Section */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-emerald-600" />
              ملاحظة صوتية مسجلة:
            </span>

            {audioBlobUrl && (
              <button
                onClick={() => setAudioBlobUrl(null)}
                className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                حذف التسجيل الصوت
              </button>
            )}
          </div>

          {/* Recording Controls */}
          {!audioBlobUrl ? (
            <div className="flex items-center justify-between gap-3">
              {isRecordingAudio ? (
                <button
                  onClick={stopRecordingAudioNote}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 animate-pulse"
                >
                  <Square className="w-4 h-4 fill-white" />
                  إيقاف تسجيل الملاحظة الصوتية
                </button>
              ) : (
                <button
                  onClick={startRecordingAudioNote}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  تسجيل ملاحظة صوتية جديدة 🎙️
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-3 rounded-xl border border-emerald-300">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  ملاحظة صوتية جاهزة للاستماع
                </span>
              </div>

              <audio src={audioBlobUrl} controls className="h-8 max-w-[200px]" />
            </div>
          )}
        </div>

        {/* Success Alert */}
        {saveSuccessMessage && (
          <div className="p-3 bg-emerald-100 text-emerald-950 rounded-2xl border border-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>تم حفظ التدوينة الذكية بنجاح في سجل الحفظ!</span>
          </div>
        )}

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t">
          <button
            onClick={handleDeleteNote}
            className="px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            حذف التدوينة
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              إلغاء
            </button>

            <button
              onClick={handleSaveNote}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              حفظ التدوينة
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
