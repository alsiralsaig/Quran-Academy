import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, Bot, User, RefreshCw, Key, Check, AlertCircle } from 'lucide-react';
import { askQuranAssistant } from '../../services/geminiService';

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
      text: 'أهلاً بك في مساعد أكاديمية القرآن الذكي! 🌿 كيف يمكنني إفادتك اليوم؟ يمكنك سؤالي عن تفسير أي سورة (مثل سورة الإخلاص، الفاتحة، الفلق)، أو أحكام التجويد، أو جداول الحفظ والمراجعة.',
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
      const reply = await askQuranAssistant(text);
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
              <h3 className="font-bold text-base sm:text-lg">مساعد إتقان الذكي للقرآن والتجويد</h3>
              <p className="text-emerald-200 text-xs">إجابات دقيقة لتفسير السور، أحكام التجويد، وجداول الحفظ</p>
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
                  {msg.text}
                </div>
                <span className="text-[10px] opacity-70 block text-left pt-1" dir="ltr">{msg.time}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-500 font-bold p-3 bg-white rounded-2xl border w-fit shadow-sm">
              <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
              جاري صياغة الإجابة القرآنية الميسرة...
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
          <span className="font-bold text-slate-500 shrink-0">أسئلة مقترحة:</span>
          <button
            onClick={() => handleQuickPrompt('تفسير بسيط لسورة الإخلاص')}
            className="px-3 py-1 bg-amber-50 text-amber-900 font-bold rounded-xl border border-amber-300 hover:bg-amber-100 shrink-0"
          >
            ✨ تفسير سورة الإخلاص
          </button>
          <button
            onClick={() => handleQuickPrompt('تفسير ميسر لسورة الفاتحة')}
            className="px-3 py-1 bg-teal-50 text-teal-900 font-bold rounded-xl border border-teal-300 hover:bg-teal-100 shrink-0"
          >
            📖 تفسير سورة الفاتحة
          </button>
          <button
            onClick={() => handleQuickPrompt('شرح حكم الإدغام والإظهار والإخفاء مع أمثلة قرآنية')}
            className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-xl border border-emerald-300 hover:bg-emerald-100 shrink-0"
          >
            💎 أحكام التجويد
          </button>
          <button
            onClick={() => handleQuickPrompt('جدول مراجعة جزء عم وجزء تبارك خلال 10 أيام')}
            className="px-3 py-1 bg-purple-50 text-purple-900 font-bold rounded-xl border border-purple-300 hover:bg-purple-100 shrink-0"
          >
            🗓️ جدول مراجعة جزء عم
          </button>
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
              placeholder="اكتب سؤالك (مثال: تفسير سورة الإخلاص، حكم الإدغام، جدول مراجعة...)"
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
