import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send, Bot, User, RefreshCw, Key, Check, AlertCircle, Mic, Square, Volume2, VolumeX, Headphones } from 'lucide-react';
import * as voice from '../../services/voice';
import { askQuranAssistant } from '../../services/geminiService';

const QUICK_PROMPTS = [
  { label: '🕌 أركان الإسلام والإيمان', prompt: 'ما هي أركان الإسلام وأركان الإيمان مع الدليل؟', cls: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' },
  { label: '🤲 صلاة الاستخارة', prompt: 'كيفية صلاة الاستخارة ودعاؤها', cls: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' },
  { label: '📖 تفسير سورة الفاتحة', prompt: 'تفسير ميسر لسورة الفاتحة', cls: 'bg-teal-50 text-teal-900 border-teal-300 hover:bg-teal-100' },
  { label: '💎 أحكام التجويد', prompt: 'شرح أحكام النون الساكنة والتنوين مع أمثلة قرآنية', cls: 'bg-sky-50 text-sky-900 border-sky-300 hover:bg-sky-100' },
  { label: '💰 زكاة المال', prompt: 'شروط زكاة المال ونصابها وكيف أحسبها؟', cls: 'bg-lime-50 text-lime-900 border-lime-300 hover:bg-lime-100' },
  { label: '🌙 أذكار الصباح', prompt: 'أذكار الصباح الثابتة من السنة', cls: 'bg-indigo-50 text-indigo-900 border-indigo-300 hover:bg-indigo-100' },
  { label: '🗓️ جدول مراجعة', prompt: 'جدول مراجعة جزء عم وجزء تبارك خلال 10 أيام', cls: 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100' },
];

/** عرض بسيط لتنسيق Markdown: **عريض** و *عريض* و ### عناوين */
function renderRich(text: string): React.ReactNode {
  return text.split('\n').map((line, i) => {
    const heading = /^\s*#{1,4}\s+/.test(line);
    const clean = line.replace(/^\s*#{1,4}\s+/, '').replace(/^(\s*)[-*]\s+/, '$1• ');
    const parts = clean.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).map((p, j) =>
      /^\*\*[^*]+\*\*$/.test(p) || /^\*[^*\s][^*]*\*$/.test(p) ? (
        <strong key={j} className="font-bold">{p.replace(/^\*\*?|\*\*?$/g, '')}</strong>
      ) : (
        <React.Fragment key={j}>{p}</React.Fragment>
      ),
    );
    return (
      <span key={i} className={heading ? 'block font-bold text-sm pt-1' : 'block'}>
        {parts}
        {!heading && clean === '' ? '\u00a0' : null}
      </span>
    );
  });
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: 'أهلاً بك في مساعد إتقان الذكي! 🌿 اسألني عن أي شيء في الدين الإسلامي: تفسير القرآن والتجويد والحفظ، العقيدة، أحكام الصلاة والصيام والزكاة والحج والمعاملات، الحديث، السيرة، الأذكار والأخلاق.',
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [userKey, setUserKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('gemini_api_key');
    if (saved) setUserKey(saved);
  }, []);

  const handleSaveKey = () => {
    if (userKey.trim()) {
      localStorage.setItem('gemini_api_key', userKey.trim());
      setKeySaved(true);
      setTimeout(() => {
        setKeySaved(false);
        setShowKeySettings(false);
      }, 1500);
    } else {
      localStorage.removeItem('gemini_api_key');
      setShowKeySettings(false);
    }
  };

  // ───────── الصوت ─────────
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'recording' | 'transcribing'>('idle');
  const [voiceError, setVoiceError] = useState('');
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    try { return localStorage.getItem('qa_auto_speak') === '1'; } catch { return false; }
  });
  const [conversation, setConversation] = useState(false);
  const conversationRef = useRef(false);
  const listenerRef = useRef<voice.Listener | null>(null);
  const recorderRef = useRef<Awaited<ReturnType<typeof voice.startRecording>> | null>(null);
  const messagesRef = useRef<ChatMessage[]>(messages);
  const loadingRef = useRef(false);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
    const el = bodyRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const stopAllVoice = () => {
    conversationRef.current = false;
    setConversation(false);
    listenerRef.current?.stop();
    listenerRef.current = null;
    recorderRef.current?.cancel();
    recorderRef.current = null;
    voice.stopSpeaking();
    setSpeakingIdx(null);
    setVoiceState('idle');
  };

  useEffect(() => {
    if (!isOpen) stopAllVoice();
    return () => { voice.stopSpeaking(); listenerRef.current?.stop(); recorderRef.current?.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!voiceError) return;
    const t = setTimeout(() => setVoiceError(''), 5000);
    return () => clearTimeout(t);
  }, [voiceError]);

  if (!isOpen) return null;

  const speakMessage = (idx: number, text: string, after?: () => void) => {
    if (!voice.canSpeak()) {
      setVoiceError('جهازك ما بيدعم القراءة بالصوت');
      return after?.();
    }
    if (!voice.hasArabicVoice()) setVoiceError('لو الصوت ما طلع عربي: ثبّت «اللغة العربية» في إعدادات «تحويل النص إلى كلام» في الموبايل');
    setSpeakingIdx(idx);
    voice.speak(text, () => {
      setSpeakingIdx((cur) => (cur === idx ? null : cur));
      after?.();
    });
  };

  const toggleSpeakMessage = (idx: number, text: string) => {
    if (speakingIdx === idx) {
      voice.stopSpeaking();
      setSpeakingIdx(null);
    } else speakMessage(idx, text);
  };

  const startVoice = async () => {
    setVoiceError('');
    voice.stopSpeaking();
    setSpeakingIdx(null);
    if (voice.canRecognize()) {
      const l = voice.startRecognition({
        onText: (t) => setInputText(t),
        onEnd: (finalText) => {
          listenerRef.current = null;
          setVoiceState('idle');
          if (finalText) handleSendMessage(finalText, true);
          else if (conversationRef.current) {
            // سكوت — نقفل وضع المحادثة
            conversationRef.current = false;
            setConversation(false);
          }
        },
        onError: (msg) => {
          setVoiceError(msg);
          conversationRef.current = false;
          setConversation(false);
        },
      });
      if (l) {
        listenerRef.current = l;
        setVoiceState('listening');
        return;
      }
    }
    if (voice.canRecord()) {
      try {
        recorderRef.current = await voice.startRecording();
        setVoiceState('recording');
      } catch {
        setVoiceError('اسمح للتطبيق باستعمال المايكروفون من إعدادات المتصفح');
        conversationRef.current = false;
        setConversation(false);
      }
      return;
    }
    setVoiceError('جهازك أو متصفحك ما بيدعم التسجيل الصوتي');
  };

  const finishRecording = async () => {
    const r = recorderRef.current;
    recorderRef.current = null;
    if (!r) return;
    setVoiceState('transcribing');
    try {
      const rec = await r.stop();
      if (!rec) {
        setVoiceState('idle');
        return setVoiceError('التسجيل قصير شديد، اضغط واتكلم ثم اضغط تاني للإرسال');
      }
      const text = await voice.transcribe(rec);
      setVoiceState('idle');
      if (text) handleSendMessage(text, true);
      else setVoiceError('ما قدرنا نفهم التسجيل، جرّب تاني بصوت أوضح');
    } catch (e) {
      setVoiceState('idle');
      setVoiceError((e as Error).message || 'تعذّر تحويل الصوت لنص');
    }
  };

  const onMicClick = () => {
    if (voiceState === 'listening') listenerRef.current?.stop();
    else if (voiceState === 'recording') finishRecording();
    else if (voiceState === 'idle') startVoice();
  };

  const toggleConversation = () => {
    if (conversationRef.current) return stopAllVoice();
    conversationRef.current = true;
    setConversation(true);
    startVoice();
  };

  const toggleAutoSpeak = () => {
    const v = !autoSpeak;
    setAutoSpeak(v);
    try { localStorage.setItem('qa_auto_speak', v ? '1' : '0'); } catch { /* */ }
    if (!v) { voice.stopSpeaking(); setSpeakingIdx(null); }
  };

  const handleSendMessage = async (textToSend?: string, viaVoice = false) => {
    const text = textToSend || inputText;
    if (!text.trim() || loadingRef.current) return;
    loadingRef.current = true;

    const userMsg: ChatMessage = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const history = messagesRef.current
        .slice(1)
        .slice(-10)
        .map((m) => ({ role: m.sender, text: m.text }));
      const reply = await askQuranAssistant(text, undefined, history);
      const botMsg: ChatMessage = {
        sender: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      };
      const idx = messagesRef.current.length + 1; // بعد رسالة المستخدم
      setMessages((prev) => [...prev, botMsg]);
      if (viaVoice || autoSpeak || conversationRef.current) {
        speakMessage(idx, reply, () => {
          if (conversationRef.current) setTimeout(() => conversationRef.current && startVoice(), 400);
        });
      }
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        sender: 'assistant',
        text: 'عذراً، حدث خطأ أثناء معالجة السؤال. يُرجى المحاولة مرة أخرى.',
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[650px] flex flex-col shadow-2xl border border-emerald-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">مساعد إتقان الذكي للعلوم الإسلامية</h3>
              <p className="text-emerald-200 text-xs">القرآن والتفسير، العقيدة، الفقه، الحديث، السيرة والأذكار</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleConversation}
              className={`p-2 rounded-xl transition-colors ${conversation ? 'bg-amber-400 text-slate-950' : 'hover:bg-emerald-800 text-emerald-100'}`}
              title="محادثة صوتية متواصلة"
              aria-label="محادثة صوتية متواصلة"
            >
              <Headphones className="w-4 h-4" />
            </button>
            <button
              onClick={toggleAutoSpeak}
              className="p-2 hover:bg-emerald-800 rounded-xl text-emerald-100 transition-colors"
              title={autoSpeak ? 'إيقاف قراءة الردود بالصوت' : 'قراءة كل الردود بالصوت'}
              aria-label="قراءة الردود بالصوت"
            >
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowKeySettings(!showKeySettings)}
              className="p-2 hover:bg-emerald-800 rounded-xl text-amber-300 transition-colors"
              title="إعدادات مفتاح Gemini API (اختياري)"
            >
              <Key className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-emerald-800 rounded-xl text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Gemini API Key Drawer */}
        {showKeySettings && (
          <div className="bg-slate-900 text-white p-4 border-b border-slate-700 text-xs space-y-2 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Key className="w-3.5 h-3.5" />
                مفتاح Gemini API الخاص بك (اختياري):
              </span>
              <span className="text-[10px] text-slate-400">يعمل النظام تلقائياً حتى بدون مفتاح</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={userKey}
                onChange={(e) => setUserKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                dir="ltr"
              />
              <button
                onClick={handleSaveKey}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0"
              >
                {keySaved ? <Check className="w-3.5 h-3.5" /> : null}
                {keySaved ? 'تم الحفظ' : 'حفظ'}
              </button>
            </div>
          </div>
        )}

        {/* Messages Body */}
        <div ref={bodyRef} className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/70 text-xs">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-amber-400 text-slate-950 shadow-sm'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] p-4 rounded-2xl space-y-1 shadow-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none font-sans'
                }`}
              >
                <div className="whitespace-pre-line text-xs font-medium space-y-1">
                  {renderRich(msg.text)}
                </div>
                <div className="flex items-center justify-between pt-1 gap-2">
                  {msg.sender === 'assistant' && index > 0 ? (
                    <button
                      onClick={() => toggleSpeakMessage(index, msg.text)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                        speakingIdx === index ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}
                    >
                      {speakingIdx === index ? <Square className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      {speakingIdx === index ? 'إيقاف' : 'استمع'}
                    </button>
                  ) : <span />}
                  <span className="text-[10px] opacity-70" dir="ltr">{msg.time}</span>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-500 font-bold p-3 bg-white rounded-2xl border w-fit shadow-sm">
              <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
              جاري إعداد الإجابة...
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
          <span className="font-bold text-slate-500 shrink-0">أسئلة مقترحة:</span>
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q.label}
              onClick={() => handleQuickPrompt(q.prompt)}
              className={`px-3 py-1 font-bold rounded-xl border shrink-0 ${q.cls}`}
            >
              {q.label}
            </button>
          ))}
        </div>

        {(voiceState !== 'idle' || conversation || voiceError) && (
          <div className={`px-4 py-2 text-[11px] font-bold flex items-center justify-between gap-2 shrink-0 ${voiceError ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-900'}`}>
            <span className="flex items-center gap-2">
              {voiceError ? <AlertCircle className="w-4 h-4" /> : <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />}
              {voiceError ||
                (voiceState === 'listening' ? 'بسمعك... اتكلم وأنا بكتب'
                  : voiceState === 'recording' ? 'جاري التسجيل... اضغط ⏹ لما تخلص'
                  : voiceState === 'transcribing' ? 'جاري تحويل صوتك لنص...'
                  : speakingIdx !== null ? 'بقرأ الرد... (اضغط 🎤 عشان تقاطع وتسأل)'
                  : loading ? 'جاري إعداد الإجابة...'
                  : 'وضع المحادثة الصوتية شغّال')}
            </span>
            {conversation && (
              <button onClick={stopAllVoice} className="px-2 py-0.5 rounded-lg bg-white border border-amber-300 text-amber-900">
                إنهاء المحادثة
              </button>
            )}
          </div>
        )}

        {/* Footer Input Form */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب أي سؤال ديني (مثال: كيفية صلاة الاستخارة، شروط الزكاة...)"
              className="flex-1 min-w-0 p-3 text-xs border rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-slate-50 focus:bg-white"
            />
            <button
              type="button"
              onClick={onMicClick}
              disabled={voiceState === 'transcribing'}
              className={`p-3 rounded-2xl shrink-0 transition-all shadow-md ${
                voiceState === 'listening' || voiceState === 'recording'
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
              } disabled:opacity-50`}
              title="اسأل بالصوت"
              aria-label="اسأل بالصوت"
            >
              {voiceState === 'listening' || voiceState === 'recording' ? <Square className="w-4 h-4" /> : voiceState === 'transcribing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl disabled:opacity-50 transition-all shadow-md flex items-center gap-1.5 text-xs shrink-0"
            >
              <Send className="w-4 h-4 rotate-180" />
              إرسال
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
