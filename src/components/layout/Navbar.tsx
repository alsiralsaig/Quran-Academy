import React from 'react';
import { BookOpen, Sparkles, HeartHandshake, Shield, GraduationCap, UserCheck, Bot, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationCenter } from '../common/NotificationCenter';

interface NavbarProps {
  currentTab: 'workspace' | 'quran' | 'azkar';
  onTabChange: (tab: 'workspace' | 'quran' | 'azkar') => void;
  onOpenAiModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange, onOpenAiModal }) => {
  const { activeRole, switchRole, language, setLanguage, t, teachers, students } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-500 text-amber-300 flex items-center justify-center shadow-lg shadow-emerald-700/20 border border-amber-300/30">
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-xl sm:text-2xl text-slate-900 tracking-tight font-serif">
                  أكاديمية <span className="text-emerald-700 font-extrabold">إتقان</span>
                </h1>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300/60 hidden sm:inline-block">
                  تحفيظ القرآن الكريم
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">منصة تعليمية وتربوية متكاملة بصفة إشرافية ومباشرة</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => onTabChange('workspace')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                currentTab === 'workspace'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Shield className="w-4 h-4" />
              لوحة الأعمال والواجهات
            </button>

            <button
              onClick={() => onTabChange('quran')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                currentTab === 'quran'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              المصحف الشريف
            </button>

            <button
              onClick={() => onTabChange('azkar')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                currentTab === 'azkar'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              حصن المسلم والأذكار
            </button>

            <button
              onClick={onOpenAiModal}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
              المساعد الذكي
            </button>
          </nav>

          {/* Notification Center, Language Switcher & Role Switcher Pills */}
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationCenter onTabChange={onTabChange} />

            {/* Language Switcher Toggle */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-2xl border border-slate-200 transition-all flex items-center gap-1.5 shadow-xs"
              title={language === 'ar' ? 'Switch to English' : 'التحويل للغة العربية'}
            >
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <div className="bg-emerald-950 p-1 rounded-2xl border border-emerald-800/60 shadow-inner flex items-center gap-1">
              {/* Admin Button */}
              <button
                onClick={() => switchRole('admin')}
                title="واجهة الإدارة والمشرفة العامة"
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeRole === 'admin'
                    ? 'bg-emerald-500 text-emerald-950 shadow-md font-extrabold'
                    : 'text-emerald-200/70 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>الإدارة</span>
              </button>

              {/* Teacher Button */}
              <button
                onClick={() => {
                  const approvedTeacher = teachers.find(t => t.status === 'approved') || teachers[0];
                  switchRole('teacher', approvedTeacher?.id);
                }}
                title="واجهة المعلمة الحالية"
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeRole === 'teacher'
                    ? 'bg-emerald-500 text-emerald-950 shadow-md font-extrabold'
                    : 'text-emerald-200/70 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>المعلمة</span>
              </button>

              {/* Student Button */}
              <button
                onClick={() => {
                  const student = students[0];
                  switchRole('student', student?.id);
                }}
                title="واجهة الطالب/ولي الأمر"
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeRole === 'student'
                    ? 'bg-emerald-500 text-emerald-950 shadow-md font-extrabold'
                    : 'text-emerald-200/70 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>الطالب</span>
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => onTabChange('workspace')}
            className={`py-1.5 px-3 rounded-lg font-bold flex items-center gap-1 ${
              currentTab === 'workspace' ? 'bg-emerald-700 text-white' : 'text-slate-600'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            اللوحة
          </button>
          <button
            onClick={() => onTabChange('quran')}
            className={`py-1.5 px-3 rounded-lg font-bold flex items-center gap-1 ${
              currentTab === 'quran' ? 'bg-emerald-700 text-white' : 'text-slate-600'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            المصحف
          </button>
          <button
            onClick={() => onTabChange('azkar')}
            className={`py-1.5 px-3 rounded-lg font-bold flex items-center gap-1 ${
              currentTab === 'azkar' ? 'bg-emerald-700 text-white' : 'text-slate-600'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            الأذكار
          </button>
          <button
            onClick={onOpenAiModal}
            className="py-1.5 px-3 rounded-lg font-bold bg-amber-500 text-white flex items-center gap-1"
          >
            <Bot className="w-3.5 h-3.5" />
            المساعد
          </button>
        </div>

      </div>
    </header>
  );
};
