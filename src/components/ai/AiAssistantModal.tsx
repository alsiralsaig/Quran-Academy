import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, Bot, User, RefreshCw, Key, Check, AlertCircle } from 'lucide-react';
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

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const history = messages
        .slice(1)
        .slice(-10)
        .map((m) => ({ role: m.sender, text: m.text }));
      const reply = await askQuranAssistant(text, undefined, history);
      const botMsg: ChatMessage = {
        sender: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        sender: 'assistant',
        text: 'عذراً، حدث خطأ أثناء معالجة السؤال. يُرجى المحاولة مرة أخرى.',
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
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
          
          <div className="flex items-center gap-2">
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
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/70 text-xs">
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
                <span className="text-[10px] opacity-70 block text-left pt-1" dir="ltr">{msg.time}</span>
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
              className="flex-1 p-3 text-xs border rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-slate-50 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl disabled:opacity-50 transition-all shadow-md flex items-center gap-1.5 text-xs shrink-0"
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
