// استدعاء Gemini من السيرفر فقط — المفتاح ما بيوصل المتصفح أبداً.

const MODELS = () =>
  (process.env.GEMINI_MODELS || 'gemini-2.5-flash,gemini-2.0-flash').split(',').map((s) => s.trim()).filter(Boolean);

const SYSTEM = `أنت "مساعد إتقان القرآني الذكي" - معلم قرآني ومستشار تربوي خبير في أحكام التجويد، التفسير الميسر، وطرق تحفيظ القرآن الكريم ومراجعته.
أجب بدقة على السؤال المحدد فقط، بلغة عربية فصيحة وميسرة مع الاستشهاد بالآيات الكريمة والأمثلة.
التزم بالتفاسير المعتمدة (كالتفسير الميسر وابن كثير والسعدي)، ولا تنسب قولاً لعالم دون تأكد، وإذا لم تكن متأكداً فقل ذلك بوضوح.
إذا سُئلت عن تفسير سورة معينة، فسّر تلك السورة تحديداً آية بآية مع بيان فضائلها الثابتة.
لا تُفتِ في المسائل الفقهية الخلافية الدقيقة؛ وجّه السائل لأهل العلم.`;

async function callGemini(body: unknown): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key) return null;
  for (const model of MODELS()) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20000);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      }).finally(() => clearTimeout(timer));
      if (!res.ok) {
        console.warn(`[ai] ${model} -> ${res.status}`);
        continue;
      }
      const data: any = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('').trim();
      if (text) return text;
    } catch (e) {
      console.warn(`[ai] ${model} failed:`, (e as Error).message);
    }
  }
  return null;
}

export async function askGemini(prompt: string, context?: string): Promise<string | null> {
  const user = context ? `السياق: ${context}\n\nسؤال المستخدم: ${prompt}` : `سؤال المستخدم: ${prompt}`;
  return callGemini({
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
  });
}

export interface TafsirInsight {
  tafsirOverview: string;
  asbabAlNuzul?: string;
  contemplationPoints: string[];
  memorizationTip: string;
}

export async function tafsirWithGemini(surah: string, ayah: number, text: string): Promise<TafsirInsight | null> {
  const prompt = `قدّم تفسيراً ميسراً للآية رقم ${ayah} من ${surah}: «${text}».
أعد JSON فقط بهذه المفاتيح:
{"tafsirOverview": "تفسير ميسر من 2-4 جمل", "asbabAlNuzul": "سبب النزول إن ثبت، وإلا اتركه نصاً فارغاً", "contemplationPoints": ["3 وقفات تدبرية قصيرة"], "memorizationTip": "نصيحة عملية لحفظ الآية"}`;
  const raw = await callGemini({
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, responseMimeType: 'application/json', maxOutputTokens: 1024 },
  });
  if (!raw) return null;
  try {
    const j = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, ''));
    if (typeof j.tafsirOverview !== 'string') return null;
    return {
      tafsirOverview: j.tafsirOverview,
      asbabAlNuzul: typeof j.asbabAlNuzul === 'string' && j.asbabAlNuzul.trim() ? j.asbabAlNuzul : undefined,
      contemplationPoints: Array.isArray(j.contemplationPoints) ? j.contemplationPoints.map(String).slice(0, 5) : [],
      memorizationTip: String(j.memorizationTip || ''),
    };
  } catch {
    return null;
  }
}
