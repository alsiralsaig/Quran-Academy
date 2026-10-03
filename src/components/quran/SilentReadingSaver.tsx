import React, { useState, useEffect } from 'react';
import { Moon, BatteryCharging, Volume2, VolumeX, Eye, Sparkles, Sun } from 'lucide-react';

export interface SilentReadingSaverProps {
  isEnabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
}

export const SilentReadingSaver: React.FC<SilentReadingSaverProps> = ({
  isEnabled,
  onToggleEnabled,
}) => {
  const [isDimmed, setIsDimmed] = useState<boolean>(false);
  const [silenceSeconds, setSilenceSeconds] = useState<number>(0);
  const [silenceThreshold, setSilenceThreshold] = useState<number>(10); // 10 seconds default

  useEffect(() => {
    let interval: any = null;
    let audioCtx: AudioContext | null = null;
    let micStream: MediaStream | null = null;

    if (isEnabled) {
      // Start microphone listening for voice activity
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          micStream = stream;
          audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const analyser = audioCtx.createAnalyser();
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          analyser.fftSize = 256;
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          interval = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const averageVolume = sum / bufferLength;

            // If volume > threshold (voice activity detected)
            if (averageVolume > 15) {
              setSilenceSeconds(0);
              setIsDimmed(false);
            } else {
              setSilenceSeconds((prev) => {
                const next = prev + 1;
                if (next >= silenceThreshold) {
                  setIsDimmed(true);
                }
                return next;
              });
            }
          }, 1000);
        })
        .catch(() => {
          // Fallback if mic permission is denied: auto-dim after timer
          interval = setInterval(() => {
            setSilenceSeconds((prev) => {
              const next = prev + 1;
              if (next >= silenceThreshold) {
                setIsDimmed(true);
              }
              return next;
            });
          }, 1000);
        });
    } else {
      setIsDimmed(false);
      setSilenceSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (audioCtx) audioCtx.close();
      if (micStream) micStream.getTracks().forEach((t) => t.stop());
    };
  }, [isEnabled, silenceThreshold]);

  // Click / touch to wake up screen
  const handleWakeUpScreen = () => {
    setIsDimmed(false);
    setSilenceSeconds(0);
  };

  return (
    <>
      {/* Control Switch Widget in Toolbar */}
      <div className="flex items-center gap-2 bg-emerald-900/90 p-1.5 rounded-2xl border border-emerald-700 text-xs shrink-0">
        <button
          onClick={() => onToggleEnabled(!isEnabled)}
          className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            isEnabled
              ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
              : 'text-amber-200 hover:text-white'
          }`}
          title="وضع القراءة الصامتة لتقليل الإضاءة ترشيداً للبطارية عند الصمت"
        >
          <BatteryCharging className="w-4 h-4 text-slate-950" />
          <span>القراءة الصامتة 🌙🔋</span>
        </button>

        {isEnabled && (
          <select
            value={silenceThreshold}
            onChange={(e) => setSilenceThreshold(Number(e.target.value))}
            className="bg-emerald-800 text-amber-300 font-bold px-2 py-1.5 rounded-xl border border-emerald-600 focus:outline-none text-[11px]"
            title="مهلة الصمت قبل خفض الإضاءة"
          >
            <option value={5}>بعد 5ث صمت</option>
            <option value={10}>بعد 10ث صمت</option>
            <option value={15}>بعد 15ث صمت</option>
          </select>
        )}
      </div>

      {/* Dimmed Overlay Backdrop when Silent */}
      {isEnabled && isDimmed && (
        <div
          onClick={handleWakeUpScreen}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-white cursor-pointer transition-opacity duration-700 animate-in fade-in"
        >
          <div className="bg-slate-900/90 border-2 border-amber-400/80 p-6 sm:p-8 rounded-3xl max-w-md w-[90%] text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-amber-400/20 text-amber-300 rounded-2xl flex items-center justify-center mx-auto border border-amber-400/40 animate-pulse">
              <Moon className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-3 py-0.5 rounded-full">
                وضع القراءة الصامتة ترشيداً للبطارية 🌙🔋
              </span>
              <h4 className="font-serif font-black text-lg text-amber-300 pt-1">
                تم خفض إضاءة الشاشة تلقائياً
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                لم يتم اكتشاف صوت تلاوة لعدة ثوانٍ. اقرأ بصوت مرتفع أو انقر في أي مكان على الشاشة لاستعادة الإضاءة الكاملة فوراً.
              </p>
            </div>

            <button
              onClick={handleWakeUpScreen}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 mx-auto"
            >
              <Sun className="w-4 h-4 text-slate-950" />
              استعادة الإضاءة الكاملة 💡
            </button>
          </div>
        </div>
      )}
    </>
  );
};
