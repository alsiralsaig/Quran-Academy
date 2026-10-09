// الصوت في المساعد الذكي: سؤال بالصوت (تعرّف على الكلام) + قراءة الرد بصوت عالٍ.
// 1) لو المتصفح بيدعم SpeechRecognition (كروم أندرويد) بنستعمله — مجاني وفوري.
// 2) غير كدا بنسجّل الصوت ونرسله للسيرفر يحوّله لنص (Gemini).
// القراءة بالصوت عن طريق speechSynthesis في الجهاز (صوت Google العربي).

type Rec = any;

const SR: any =
  typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;

export const canRecognize = (): boolean => !!SR;
export const canRecord = (): boolean =>
  typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof (window as any).MediaRecorder !== 'undefined';
export const canSpeak = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window;

export interface Listener {
  stop: () => void;
}

/** تعرّف مباشر على الكلام. onText بيتنادى بالنص الجزئي والنهائي. */
export function startRecognition(opts: {
  onText: (text: string, final: boolean) => void;
  onEnd: (finalText: string) => void;
  onError: (msg: string) => void;
}): Listener | null {
  if (!SR) return null;
  const rec: Rec = new SR();
  rec.lang = 'ar-SA';
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;
  let finalText = '';
  let ended = false;
  rec.onresult = (e: any) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += r[0].transcript;
      else interim += r[0].transcript;
    }
    opts.onText((finalText + ' ' + interim).trim(), !interim);
  };
  rec.onerror = (e: any) => {
    const code = e?.error || '';
    if (code === 'no-speech' || code === 'aborted') return;
    opts.onError(
      code === 'not-allowed' || code === 'service-not-allowed'
        ? 'اسمح للتطبيق باستعمال المايكروفون من إعدادات المتصفح'
        : code === 'network'
          ? 'التعرّف على الصوت محتاج إنترنت'
          : 'تعذّر التعرّف على الصوت، جرّب تاني',
    );
  };
  rec.onend = () => {
    if (ended) return;
    ended = true;
    opts.onEnd(finalText.trim());
  };
  try {
    rec.start();
  } catch {
    return null;
  }
  return {
    stop: () => {
      try {
        rec.stop();
      } catch {
        /* */
      }
    },
  };
}

/** تسجيل صوت (بديل) — بيرجع base64 عند الإيقاف. حد أقصى 60 ثانية. */
export async function startRecording(): Promise<{ stop: () => Promise<{ base64: string; mime: string } | null>; cancel: () => void }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const MR = (window as any).MediaRecorder;
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  const mime = types.find((t) => MR.isTypeSupported?.(t)) || '';
  const rec = new MR(stream, mime ? { mimeType: mime, audioBitsPerSecond: 24000 } : undefined);
  const chunks: Blob[] = [];
  rec.ondataavailable = (e: any) => e.data?.size && chunks.push(e.data);
  rec.start();
  const release = () => stream.getTracks().forEach((t) => t.stop());
  const limit = setTimeout(() => rec.state === 'recording' && rec.stop(), 60000);
  return {
    cancel: () => {
      clearTimeout(limit);
      try {
        rec.stop();
      } catch {
        /* */
      }
      release();
    },
    stop: () =>
      new Promise((resolve) => {
        clearTimeout(limit);
        const finish = async () => {
          release();
          const blob = new Blob(chunks, { type: (rec.mimeType || mime || 'audio/webm').split(';')[0] });
          if (blob.size < 1500) return resolve(null);
          const buf = new Uint8Array(await blob.arrayBuffer());
          let bin = '';
          for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + 0x8000)));
          resolve({ base64: btoa(bin), mime: blob.type || 'audio/webm' });
        };
        if (rec.state === 'inactive') finish();
        else {
          rec.onstop = finish;
          rec.stop();
        }
      }),
  };
}

export async function transcribe(rec: { base64: string; mime: string }): Promise<string> {
  const res = await fetch('/api/ai/transcribe', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'x-qa-client': '1' },
    body: JSON.stringify({ audio: rec.base64, mime: rec.mime }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'تعذّر تحويل الصوت لنص');
  return String(data.text || '').trim();
}

/* ------------------------------ القراءة بالصوت ------------------------------ */

/** تنظيف النص للقراءة: نشيل رموز التنسيق والإيموجي والأقواس */
export function cleanForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[*_#>`|~]+/g, ' ')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/[﴿﴾«»"“”()[\]{}]/g, ' ')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/ﷺ/g, ' صلى الله عليه وسلم ')
    .replace(/[-–—]{2,}/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/** تقسيم لجمل قصيرة (كروم بيقطع القراءة الطويلة) */
function chunks(text: string, max = 180): string[] {
  const parts = text.split(/(?<=[.!؟?:؛\n،])\s+/);
  const out: string[] = [];
  let cur = '';
  for (const p of parts) {
    if ((cur + ' ' + p).length > max && cur) {
      out.push(cur.trim());
      cur = p;
    } else cur += ' ' + p;
    while (cur.length > max * 1.6) {
      const cut = cur.lastIndexOf(' ', max) > 40 ? cur.lastIndexOf(' ', max) : max;
      out.push(cur.slice(0, cut).trim());
      cur = cur.slice(cut);
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter(Boolean);
}

let arabicVoice: SpeechSynthesisVoice | null = null;
function pickVoice(): SpeechSynthesisVoice | null {
  if (!canSpeak()) return null;
  const voices = window.speechSynthesis.getVoices();
  const ar = voices.filter((v) => /^ar/i.test(v.lang));
  arabicVoice = ar.find((v) => /google/i.test(v.name)) || ar.find((v) => /SA|EG|XA/i.test(v.lang)) || ar[0] || null;
  return arabicVoice;
}
if (canSpeak()) {
  pickVoice();
  window.speechSynthesis.onvoiceschanged = () => pickVoice();
}

export const hasArabicVoice = (): boolean => !!(arabicVoice || pickVoice());

let session = 0;

/** يقرأ النص بصوت عالٍ. onEnd بيتنادى لما يخلص أو يتوقف. */
export function speak(text: string, onEnd?: () => void, rate = 1): void {
  if (!canSpeak()) {
    onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const my = ++session;
  const list = chunks(cleanForSpeech(text));
  const voice = arabicVoice || pickVoice();
  let i = 0;
  // كروم أندرويد أحياناً بيوقف بعد فترة — نعمل resume دوري
  const keepAlive = setInterval(() => synth.speaking && synth.resume(), 8000);
  const done = () => {
    clearInterval(keepAlive);
    if (my === session) onEnd?.();
  };
  const next = () => {
    if (my !== session) return clearInterval(keepAlive);
    if (i >= list.length) return done();
    const u = new SpeechSynthesisUtterance(list[i++]);
    u.lang = voice?.lang || 'ar-SA';
    if (voice) u.voice = voice;
    u.rate = rate;
    u.onend = next;
    u.onerror = (e: any) => (e?.error === 'interrupted' || e?.error === 'canceled' ? clearInterval(keepAlive) : next());
    synth.speak(u);
  };
  next();
}

export function stopSpeaking(): void {
  session++;
  if (canSpeak()) window.speechSynthesis.cancel();
}
