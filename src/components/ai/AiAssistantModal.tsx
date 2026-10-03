import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, RefreshCw, BookOpen } from 'lucide-react';
import { askQuranAssistant, generateMemorizationSchedule } from '../../services/geminiService';

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
      text: 'أهلاً بك في مساعد إتقان الذكي! 🌿 كيف يمكنني مساعدتك اليوم في تنظيم الحفظ، مراجعة القرآن، أو توضيح أحكام التجويد والتفسير الميسر؟',
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[650px] flex flex-col shadow-2xl border border-emerald-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">مساعد إتقان الذكي للقرآن والتجويد</h3>
              <p className="text-emerald-200 text-xs">مدعوم بذكاء Gemini للاستشارات القرآنية وجداول المراجعة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-emerald-700/60 rounded-xl text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/60 text-xs">
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
                className={`max-w-[80%] p-4 rounded-2xl space-y-1 shadow-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none font-sans'
                }`}
              >
                <p className="whitespace-pre-line text-xs font-medium">{msg.text}</p>
                <span className="text-[10px] opacity-70 block text-left pt-1" dir="ltr">{msg.time}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-500 font-bold p-3 bg-white rounded-2xl border w-fit">
              <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
              جاري صياغة الإجابة والجدول...
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
          <span className="font-bold text-slate-500 shrink-0">أسئلة مقترحة:</span>
          <button
            onClick={() => handleQuickPrompt('جدول مراجعة جزء عم وجزء تبارك خلال 10 أيام مع أوقات الربط')}
            className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100 shrink-0"
          >
            🗓️ جدول مراجعة جزء عم
          </button>
          <button
            onClick={() => handleQuickPrompt('شرح حكم الإدغام والإظهار والإخفاء مع أمثلة قرآنية')}
            className="px-3 py-1 bg-amber-50 text-amber-900 font-bold rounded-xl border border-amber-200 hover:bg-amber-100 shrink-0"
          >
            📖 شرح أحكام التجويد
          </button>
          <button
            onClick={() => handleQuickPrompt('ما أفضل طريقة لضبط المتشابهات اللفظية في سورة البقرة وآل عمران؟')}
            className="px-3 py-1 bg-purple-50 text-purple-900 font-bold rounded-xl border border-purple-200 hover:bg-purple-100 shrink-0"
          >
            🔍 ضبط المتشابهات اللفظية
          </button>
          <button
            onClick={() => handleQuickPrompt('تفسير وتدبر ميسر لسورة الكهف والدروس المستفادة منها')}
            className="px-3 py-1 bg-teal-50 text-teal-900 font-bold rounded-xl border border-teal-200 hover:bg-teal-100 shrink-0"
          >
            💡 تفسير وتدبر سورة الكهف
          </button>
        </div>

        {/* Footer Input Form */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
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
              placeholder="اكتب سؤالك في التجويد، التفسير، أو طلب جدول مراجعة مخصص..."
              className="flex-1 p-3 text-xs border rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl disabled:opacity-50 transition-all shadow-md flex items-center gap-1.5 text-xs"
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
