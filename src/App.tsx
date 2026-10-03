import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { QuranReader } from './components/quran/QuranReader';
import { AzkarView } from './components/azkar/AzkarView';
import { AiAssistantModal } from './components/ai/AiAssistantModal';
import { Sparkles, Heart, Shield, BookOpen, GraduationCap, Phone, Mail } from 'lucide-react';

function AppContent() {
  const { activeRole } = useApp();
  const [currentTab, setCurrentTab] = useState<'workspace' | 'quran' | 'azkar'>('workspace');
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Cairo',sans-serif]">
      {/* Top Header Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenAiModal={() => setIsAiOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: WORKSPACE / ROLE INTERFACES */}
        {currentTab === 'workspace' && (
          <div>
            {activeRole === 'admin' && <AdminDashboard />}
            {activeRole === 'teacher' && <TeacherDashboard />}
            {activeRole === 'student' && <StudentDashboard />}
          </div>
        )}

        {/* VIEW 2: QURAN READER */}
        {currentTab === 'quran' && <QuranReader />}

        {/* VIEW 3: AZKAR VIEW */}
        {currentTab === 'azkar' && <AzkarView />}

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
            
            <div className="space-y-1 text-center md:text-right">
              <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold text-base font-serif">
                <BookOpen className="w-5 h-5 text-amber-400" />
                أكاديمية إتقان لتحفيظ القرآن الكريم
              </div>
              <p className="text-slate-400 max-w-md">
                منصة متكاملة ترعى الحفظ والتلاوة بأعلى درجات الإتقان وبإشراف مباشر من معلمات مجازات.
              </p>
            </div>

            <div className="flex items-center gap-6 text-slate-300 font-semibold">
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span dir="ltr">+966 50 123 4567</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>support@etqan-quran.com</span>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-800 text-center text-slate-500 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>جميع الحقوق محفوظة © {new Date().getFullYear()} - أكاديمية إتقان لتحفيظ القرآن الكريم</p>
            <p className="flex items-center gap-1">
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
