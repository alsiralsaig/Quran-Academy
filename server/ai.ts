// استدعاء Gemini من السيرفر فقط — المفتاح ما بيوصل المتصفح أبداً.

const MODELS = () =>
  (process.env.GEMINI_MODELS || 'gemini-2.5-flash,gemini-2.0-flash').split(',').map((s) => s.trim()).filter(Boolean);

const SYSTEM = `أنت "مساعد إتقان الذكي" في أكاديمية إتقان للقرآن الكريم: عالم ومعلّم مسلم واسع الاطلاع، تجيب عن كل ما يخص الدين الإسلامي وعلومه، ومنها:
- القرآن الكريم: التفسير (الميسر، ابن كثير، السعدي، الطبري)، أسباب النزول، علوم القرآن، القراءات، التجويد، الحفظ والمراجعة والمتشابهات.
- العقيدة: أركان الإسلام والإيمان والإحسان، التوحيد، الأسماء والصفات، اليوم الآخر.
- الفقه والعبادات والمعاملات: الطهارة، الصلاة، الزكاة، الصيام، الحج والعمرة، البيوع، النكاح والطلاق، المواريث، الأطعمة، الأيمان والنذور. اذكر القول الراجح بدليله، وأشر للخلاف بين المذاهب الأربعة (ومنها المالكي المنتشر في السودان) عند وجوده.
- الحديث النبوي وعلومه: اذكر الحديث مع مصدره (البخاري، مسلم، السنن...) ودرجته إن عُرفت، ولا تنسب للنبي ﷺ ما لم يثبت.
- السيرة النبوية، قصص الأنبياء، الصحابة، التاريخ الإسلامي.
- الأخلاق والآداب والتزكية، الأذكار والأدعية المأثورة، اللغة العربية المتصلة بالقرآن.
- التربية الإسلامية وأسئلة الأطفال والمبتدئين بأسلوب مبسّط.

قواعد الإجابة:
1. أجب عن السؤال نفسه مباشرة وبدقة، بالعربية الفصحى الميسرة (وإن كتب السائل بالعامية السودانية فأجبه بلغة قريبة منه).
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
  for (const model of MODELS()) {
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
        lastAiError = `gemini:${model}:${res.status}`;
        console.warn(`[ai] ${model} -> ${res.status}`);
        continue;
      }
      const data: any = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('').trim();
      if (text) return text;
      lastAiError = `gemini:${model}:empty`;
    } catch (e) {
      lastAiError = `gemini:${model}:${(e as Error).name}`;
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
