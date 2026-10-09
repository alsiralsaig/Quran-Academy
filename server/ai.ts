// استدعاء Gemini من السيرفر فقط — المفتاح ما بيوصل المتصفح أبداً.

const MODELS = () =>
  (process.env.GEMINI_MODELS || 'gemini-flash-latest,gemini-flash-lite-latest').split(',').map((s) => s.trim()).filter(Boolean);

const SYSTEM = `أنت "مساعد إتقان الذكي" في أكاديمية إتقان للقرآن الكريم: عالم ومعلّم مسلم واسع الاطلاع، تجيب عن كل ما يخص الدين الإسلامي وعلومه، ومنها:
- القرآن الكريم: التفسير (الميسر، ابن كثير، السعدي، الطبري)، أسباب النزول، علوم القرآن، القراءات، التجويد، الحفظ والمراجعة والمتشابهات.
- العقيدة: أركان الإسلام والإيمان والإحسان، التوحيد، الأسماء والصفات، اليوم الآخر.
- الفقه والعبادات والمعاملات: الطهارة، الصلاة، الزكاة، الصيام، الحج والعمرة، البيوع، النكاح والطلاق، المواريث، الأطعمة، الأيمان والنذور. اذكر القول الراجح بدليله، وأشر للخلاف بين المذاهب الأربعة (ومنها المالكي المنتشر في السودان) عند وجوده.
- الحديث النبوي وعلومه: اذكر الحديث مع مصدره (البخاري، مسلم، السنن...) ودرجته إن عُرفت، ولا تنسب للنبي ﷺ ما لم يثبت.
- السيرة النبوية، قصص الأنبياء، الصحابة، التاريخ الإسلامي.
- الأخلاق والآداب والتزكية، الأذكار والأدعية المأثورة، اللغة العربية المتصلة بالقرآن.
- التربية الإسلامية وأسئلة الأطفال والمبتدئين بأسلوب مبسّط.

قواعد الإجابة:
1. ابدأ بالإجابة مباشرة دون ترحيب أو مقدمات متكررة، وأجب عن السؤال نفسه بدقة، بالعربية الفصحى الميسرة (وإن كتب السائل بالعامية السودانية فأجبه بلغة قريبة منه).
2. استشهد بالآيات (مع اسم السورة ورقم الآية) والأحاديث الصحيحة مع مصدرها. لا تخترع نصاً ولا مرجعاً؛ وإن لم تكن متأكداً فقل ذلك بوضوح.
3. اجعل الإجابة منظّمة: عناوين قصيرة ونقاط، بطول يناسب السؤال (لا تُطِل في السؤال البسيط).
4. في المسائل الشخصية الدقيقة (طلاق واقع، تقسيم تركة فعلية، نوازل طبية/مالية معقّدة) أعطِ الحكم العام ثم انصح بمراجعة عالم أو دار إفتاء موثوقة.
5. التزم منهج أهل السنة والجماعة باعتدال وأدب، وتجنّب التكفير والتجريح والطعن في المذاهب والعلماء والقضايا السياسية الحزبية.
6. إن سُئلت عن موضوع بعيد عن الدين تماماً، فأجب باختصار بلطف ثم ذكّر أنك مخصص للعلوم الإسلامية.`;

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

interface ChatOpts {
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
}

/** آخر سبب فشل — يساعد في التشخيص (بدون أسرار) */
export let lastAiError = '';

async function callGemini(system: string, turns: ChatTurn[], opts: ChatOpts): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key) {
    lastAiError = 'gemini:no-key';
    return null;
  }
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: turns.map((t) => ({ role: t.role === 'assistant' ? 'model' : 'user', parts: [{ text: t.text }] })),
    generationConfig: {
      temperature: opts.temperature ?? 0.4,
      maxOutputTokens: opts.maxTokens ?? 4096,
      ...(opts.json ? { responseMimeType: 'application/json' } : {}),
    },
  };
  const errs: string[] = [];
  const started = Date.now();
  for (const model of MODELS()) {
    // الميزانية الكلية ~55 ثانية (حد Vercel 60)
    const left = 55000 - (Date.now() - started);
    if (left < 8000) break;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), Math.min(left, model.includes("lite") ? 30000 : 22000));
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      }).finally(() => clearTimeout(timer));
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        const msg = (detail.match(/"message":\s*"([^"]{0,120})/) || [])[1] || '';
        errs.push(`${model}:${res.status}${msg ? ' ' + msg : ''}`);
        lastAiError = errs.join(' | ');
        console.warn(`[ai] ${model} -> ${res.status}`);
        continue;
      }
      const data: any = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('').trim();
      if (text) return text;
      errs.push(`${model}:empty`);
      lastAiError = errs.join(' | ');
    } catch (e) {
      errs.push(`${model}:${(e as Error).name}`);
      lastAiError = errs.join(' | ');
      console.warn(`[ai] ${model} failed:`, (e as Error).message);
    }
  }
  return null;
}

async function chat(system: string, turns: ChatTurn[], opts: ChatOpts = {}): Promise<string | null> {
  return callGemini(system, turns, opts);
}

export async function askGemini(prompt: string, context?: string, history: ChatTurn[] = []): Promise<string | null> {
  const user = context ? `السياق: ${context}\n\nسؤال المستخدم: ${prompt}` : prompt;
  // المحادثة لازم تبدأ بسؤال من المستخدم
  const h = history.slice(-10);
  while (h.length && h[0].role !== 'user') h.shift();
  return chat(SYSTEM, [...h, { role: 'user', text: user }], { temperature: 0.4, maxTokens: 4096 });
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
  const raw = await chat(SYSTEM, [{ role: 'user', text: prompt }], { temperature: 0.3, json: true, maxTokens: 1024 });
  if (!raw) return null;
  try {
    const j = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ''));
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

/** تحويل تسجيل صوتي لنص (بديل للأجهزة الما فيها التعرّف على الكلام) */
export async function transcribeAudio(base64: string, mime: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key) return null;
  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { inline_data: { mime_type: mime, data: base64 } },
          { text: 'اكتب نص هذا التسجيل الصوتي حرفياً كما قيل (غالباً سؤال ديني بالعربية أو العامية السودانية). أعد النص فقط بدون أي شرح. إن كان التسجيل فارغاً أو غير مفهوم فأعد نصاً فارغاً.' },
        ],
      },
    ],
    generationConfig: { temperature: 0, maxOutputTokens: 512 },
  };
  for (const model of ['gemini-flash-lite-latest', 'gemini-flash-latest']) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 25000);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      }).finally(() => clearTimeout(timer));
      if (!res.ok) {
        lastAiError = `transcribe:${model}:${res.status}`;
        continue;
      }
      const data: any = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('').trim();
      return text || '';
    } catch (e) {
      lastAiError = `transcribe:${model}:${(e as Error).name}`;
    }
  }
  return null;
}
