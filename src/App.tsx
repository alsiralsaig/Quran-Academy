import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { PortalHeroHeader } from './components/layout/PortalHeroHeader';
import { PwaInstallPrompt } from './components/common/PwaInstallPrompt';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { QuranReader } from './components/quran/QuranReader';
import { AzkarView } from './components/azkar/AzkarView';
import { AiAssistantModal } from './components/ai/AiAssistantModal';
import { Sparkles, BookOpen, Phone, Mail, MessageCircle } from 'lucide-react';

function AppContent() {
  const { activeRole } = useApp();
  const [currentTab, setCurrentTab] = useState<'workspace' | 'quran' | 'azkar'>('workspace');
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Cairo',sans-serif]">
      {/* PWA Mobile Installation Prompt (Android / iOS) */}
      <PwaInstallPrompt />

      {/* Top Header Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenAiModal={() => setIsAiOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Banner Hero & 3 Portals Switcher */}
        {currentTab === 'workspace' && (
          <PortalHeroHeader
            onTabChange={setCurrentTab}
            onOpenAiModal={() => setIsAiOpen(true)}
          />
        )}

        {/* VIEW 1: WORKSPACE / ROLE INTERFACES */}
        {currentTab === 'workspace' && (
          <div className="animate-in fade-in-50 duration-200">
            {activeRole === 'admin' && <AdminDashboard />}
            {activeRole === 'teacher' && <TeacherDashboard />}
            {activeRole === 'student' && <StudentDashboard />}
          </div>
        )}

        {/* VIEW 2: QURAN READER */}
        {currentTab === 'quran' && (
          <div className="animate-in fade-in-50 duration-200">
            <QuranReader />
          </div>
        )}

        {/* VIEW 3: AZKAR VIEW */}
        {currentTab === 'azkar' && (
          <div className="animate-in fade-in-50 duration-200">
            <AzkarView />
          </div>
        )}

      </main>

      {/* Floating AI Assistant Quick Trigger */}
      <button
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 border-2 border-white/60"
        title="فتح مساعد إتقان الذكي"
      >
        <Sparkles className="w-5 h-5 text-slate-950 animate-pulse" />
        <span className="text-xs">المساعد القرآني الذكي</span>
      </button>

      {/* Gemini AI Assistant Modal */}
      <AiAssistantModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-10 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="space-y-1.5 text-center md:text-right flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 bg-white p-1 rounded-xl shadow-md object-contain shrink-0" />
              <div>
                <div className="text-white font-bold text-sm font-serif">
                  أكاديمية القرآن الكريم — اقرأ
                </div>
                <p className="text-slate-400 max-w-md text-[11px]">
                  منصة متكاملة ترعى الحفظ والتلاوة بأعلى درجات الإتقان وبإشراف مباشر من معلمات مجازات.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-6 text-slate-300 font-semibold">
              <a
                href="https://wa.me/249913009060"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl border border-emerald-500/40 flex items-center gap-1.5 transition-colors text-xs"
                title="تواصل مباشر عبر الواتساب"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>واتساب الأكاديمية</span>
              </a>

              <a
                href="tel:+249913009060"
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                title="الاتصال المباشر"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span dir="ltr">+249 913 009 060</span>
              </a>

              <a
                href="mailto:info@quran-academy.com"
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>info@quran-academy.com</span>
              </a>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-800 text-center text-slate-500 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>جميع الحقوق محفوظة © {new Date().getFullYear()} - أكاديمية القرآن الكريم</p>
            <p className="flex items-center gap-1 font-serif text-amber-400/90">
              "خيرُكُم مَن تعَلَّمَ القُرآنَ وعَلَّمَهُ"
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
