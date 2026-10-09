import React, { useEffect, useRef, useState } from 'react';
import { Download, Check, Pause, Trash2, WifiOff, ChevronDown, ChevronUp, BookOpen, Headphones, AlertCircle } from 'lucide-react';
import { ALL_SURAHS, Reciter } from '../../data/quranData';
import type { QuranSurah } from '../../types';
import {
  RECITER_SIZE_MB,
  TOTAL_AYAHS,
  audioStatus,
  countOfflineTextSurahs,
  deleteReciterAudio,
  downloadAudio,
  downloadQuranText,
  formatMB,
  storageEstimate,
} from '../../services/offlineQuranStorage';

interface Props {
  reciter: Reciter;
  surah: QuranSurah;
  onTextDownloaded?: () => void;
}

type Job = { kind: 'surah' | 'all'; done: number; total: number; failed: number } | null;

export const OfflineDownloadPanel: React.FC<Props> = ({ reciter, surah, onTextDownloaded }) => {
  const [open, setOpen] = useState(false);
  const [textCount, setTextCount] = useState(0);
  const [textBusy, setTextBusy] = useState('');
  const [surahSt, setSurahSt] = useState({ cached: 0, total: surah.numberOfAyahs });
  const [allSt, setAllSt] = useState({ cached: 0, total: TOTAL_AYAHS });
  const [job, setJob] = useState<Job>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [freeMB, setFreeMB] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = async () => {
    setTextCount(await countOfflineTextSurahs());
    const [s, a, est] = await Promise.all([audioStatus(reciter.id, surah.number), audioStatus(reciter.id), storageEstimate()]);
    setSurahSt(s);
    setAllSt(a);
    setFreeMB(est ? est.freeMB : null);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reciter.id, surah.number]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const textReady = textCount >= ALL_SURAHS.length;
  const fullMB = RECITER_SIZE_MB[reciter.id] || 1200;
  const remainingMB = fullMB * (1 - allSt.cached / Math.max(1, allSt.total));
  const surahMB = (fullMB * surah.numberOfAyahs) / TOTAL_AYAHS;

  const handleText = async () => {
    setMsg(null);
    const ok = await downloadQuranText(setTextBusy);
    setTextBusy('');
    await refresh();
    if (ok) {
      setMsg({ ok: true, text: 'تم حفظ نص المصحف كامل والتفسير الميسر — القراءة بقت تشتغل بدون إنترنت ✅' });
      onTextDownloaded?.();
    } else setMsg({ ok: false, text: 'تعذّر التنزيل — اتأكد من الإنترنت وجرّب تاني' });
  };

  const runAudio = async (kind: 'surah' | 'all') => {
    if (job) return;
    setMsg(null);
    if (kind === 'all') {
      const warn = `تنزيل المصحف كامل بصوت ${reciter.name}\nالحجم المتبقي تقريباً: ${formatMB(remainingMB)}\n${
        freeMB !== null ? `المساحة المتاحة للتطبيق: ${formatMB(freeMB)}\n` : ''
      }\nيُفضّل استعمال واي فاي. تقدر توقف التنزيل وتكمله بعدين من نفس المكان.\n\nمتابعة؟`;
      if (!window.confirm(warn)) return;
    }
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setJob({ kind, done: 0, total: 0, failed: 0 });
    try {
      if (!textReady) await downloadQuranText();
      const surahs = kind === 'all' ? ALL_SURAHS.map((s) => s.number) : [surah.number];
      const r = await downloadAudio(reciter.id, surahs, (done, total, failed) => setJob({ kind, done, total, failed }), ctrl.signal);
      if (ctrl.signal.aborted) setMsg({ ok: true, text: `توقف التنزيل عند ${r.done} من ${r.total} — اضغط «تنزيل» تاني عشان تكمل` });
      else if (r.failed) setMsg({ ok: false, text: `اكتمل مع ${r.failed} آية ما اتنزّلت (ضعف الشبكة) — اضغط «تنزيل» تاني لإكمالها` });
      else setMsg({ ok: true, text: kind === 'all' ? 'تم تنزيل المصحف كامل بالصوت ✅ — يشتغل بدون إنترنت' : `تم تنزيل سورة ${surah.name} ✅` });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message || 'حصل خطأ أثناء التنزيل' });
    } finally {
      abortRef.current = null;
      setJob(null);
      refresh();
    }
  };

  const stop = () => abortRef.current?.abort();

  const handleDelete = async () => {
    if (!window.confirm(`حذف كل التلاوات المحفوظة بصوت ${reciter.name}؟`)) return;
    const n = await deleteReciterAudio(reciter.id);
    setMsg({ ok: true, text: `اتحذفت ${n} آية من الجهاز` });
    refresh();
  };

  const pct = (a: number, b: number) => (b ? Math.floor((a / b) * 100) : 0);
  const surahDone = surahSt.total > 0 && surahSt.cached >= surahSt.total;
  const allDone = allSt.cached >= allSt.total;

  return (
    <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl border border-teal-700/60 shadow-md overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center justify-between gap-3 text-right">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/20 text-teal-300 rounded-xl">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm">المصحف بدون إنترنت (قراءة واستماع)</h4>
            <p className="text-[11px] text-teal-200/80">
              {job
                ? `جاري التنزيل... ${job.done} من ${job.total} آية (${pct(job.done, job.total)}%)`
                : `النص: ${textReady ? 'محفوظ ✓' : 'غير محفوظ'} • صوت ${reciter.name.replace('الشيخ ', '')}: ${
                    allDone ? 'المصحف كامل ✓' : allSt.cached ? `${pct(allSt.cached, allSt.total)}%` : 'غير محفوظ'
                  }`}
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-teal-300 shrink-0" /> : <ChevronDown className="w-5 h-5 text-teal-300 shrink-0" />}
      </button>

      {job && (
        <div className="px-4 pb-3 -mt-1">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 transition-all" style={{ width: `${pct(job.done, job.total)}%` }} />
          </div>
        </div>
      )}

      {open && (
        <div className="px-4 pb-4 space-y-3 text-xs">
          {/* النص */}
          <div className="bg-slate-950/40 rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
              <div>
                <div className="font-bold">نص المصحف كامل + التفسير الميسر</div>
                <div className="text-[10px] text-teal-200/80">
                  {textReady ? '114 سورة محفوظة في الجهاز' : `حوالي 1 ميغابايت${textCount ? ` • محفوظ ${textCount} سورة` : ''}`}
                </div>
              </div>
            </div>
            {textReady ? (
              <span className="flex items-center gap-1 text-emerald-300 font-bold shrink-0"><Check className="w-4 h-4" />محفوظ</span>
            ) : (
              <button onClick={handleText} disabled={!!textBusy} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-lg shrink-0 disabled:opacity-60 flex items-center gap-1">
                <Download className="w-3.5 h-3.5" />
                {textBusy || 'تنزيل'}
              </button>
            )}
          </div>

          {/* الصوت */}
          <div className="bg-slate-950/40 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-amber-300 shrink-0" />
              <div className="font-bold">التلاوة بصوت: {reciter.name}</div>
            </div>
            <div className="text-[10px] text-teal-200/80">لتغيير القارئ استعمل قائمة «قارئ التلاوة الصوتية» تحت. كل قارئ بيتنزّل لوحده.</div>

            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-bold">سورة {surah.name}</div>
                <div className="text-[10px] text-teal-200/80">
                  {surahSt.cached}/{surahSt.total} آية • حوالي {formatMB(surahMB)}
                </div>
              </div>
              {surahDone ? (
                <span className="flex items-center gap-1 text-emerald-300 font-bold shrink-0"><Check className="w-4 h-4" />محفوظة</span>
              ) : job?.kind === 'surah' ? (
                <button onClick={stop} className="px-3 py-1.5 bg-amber-400 text-slate-950 font-black rounded-lg shrink-0 flex items-center gap-1">
                  <Pause className="w-3.5 h-3.5" />إيقاف
                </button>
              ) : (
                <button onClick={() => runAudio('surah')} disabled={!!job} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-lg shrink-0 disabled:opacity-50 flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" />تنزيل السورة
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-teal-800/60 pt-2.5">
              <div>
                <div className="font-bold">المصحف كامل (114 سورة)</div>
                <div className="text-[10px] text-teal-200/80">
                  {allSt.cached}/{allSt.total} آية ({pct(allSt.cached, allSt.total)}%) • {allDone ? `حوالي ${formatMB(fullMB)}` : `المتبقي حوالي ${formatMB(remainingMB)}`}
                </div>
              </div>
              {allDone ? (
                <span className="flex items-center gap-1 text-emerald-300 font-bold shrink-0"><Check className="w-4 h-4" />كامل</span>
              ) : job?.kind === 'all' ? (
                <button onClick={stop} className="px-3 py-1.5 bg-amber-400 text-slate-950 font-black rounded-lg shrink-0 flex items-center gap-1">
                  <Pause className="w-3.5 h-3.5" />إيقاف مؤقت
                </button>
              ) : (
                <button onClick={() => runAudio('all')} disabled={!!job} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-lg shrink-0 disabled:opacity-50 flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" />{allSt.cached ? 'إكمال التنزيل' : 'تنزيل الكل'}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 text-[10px] text-teal-200/70">
              <span>{freeMB !== null ? `المساحة المتاحة للتطبيق: ${formatMB(freeMB)}` : ''}</span>
              {allSt.cached > 0 && !job && (
                <button onClick={handleDelete} className="flex items-center gap-1 text-rose-300 hover:text-rose-200 font-bold">
                  <Trash2 className="w-3.5 h-3.5" />حذف تلاوات هذا القارئ
                </button>
              )}
            </div>
          </div>

          <p className="text-[10px] text-teal-200/70">💡 نصيحة: لو الشبكة ضعيفة نزّل السور اللي بتحفظها أولاً. التنزيل بيكمل من وين وقف، وخلي الصفحة مفتوحة أثناء التنزيل.</p>
        </div>
      )}

      {msg && (
        <div className={`px-4 py-2 text-[11px] font-bold flex items-center gap-2 ${msg.ok ? 'bg-emerald-950/60 text-emerald-200' : 'bg-rose-950/60 text-rose-200'}`}>
          {msg.ok ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {msg.text}
        </div>
      )}
    </div>
  );
};
