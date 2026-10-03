import React from 'react';
import { Shield, GraduationCap, UserCheck, BookOpen, HeartHandshake, Sparkles, Award, Users, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PortalHeroHeaderProps {
  onTabChange: (tab: 'workspace' | 'quran' | 'azkar') => void;
  onOpenAiModal: () => void;
}

export const PortalHeroHeader: React.FC<PortalHeroHeaderProps> = ({ onTabChange, onOpenAiModal }) => {
  const { activeRole, switchRole, teachers, students } = useApp();

  return (
    <div className="mb-8 space-y-6">
      
      {/* Visual Hero Banner with Logo */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl border-2 border-amber-400/40 bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 text-white">
        
        {/* Banner Background Image Overlay */}
        <div className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none">
          <img src="/banner.png" alt="Academy Banner" className="w-full h-full object-cover object-center" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl p-1.5 shadow-xl border-2 border-amber-400/70 shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                منصة متكاملة لإدارة حلقات تحفيظ القرآن الكريم
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif text-white tracking-tight">
                أكاديمية <span className="text-amber-400">القرآن الكريم</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                معاً نحو جيل يحفظ كتاب الله ويتقن تلاوته وترتيله تحت إشراف نخبة من المعلمات المجازات.
              </p>
            </div>
          </div>

          {/* Quick Access Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => onTabChange('quran')}
              className="px-3.5 py-2 bg-emerald-800/80 hover:bg-emerald-700/90 text-amber-200 border border-amber-400/30 rounded-2xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>المصحف الشريف</span>
            </button>
            <button
              onClick={() => onTabChange('azkar')}
              className="px-3.5 py-2 bg-teal-800/80 hover:bg-teal-700/90 text-teal-200 border border-teal-400/30 rounded-2xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <HeartHandshake className="w-4 h-4 text-teal-300" />
              <span>حصن المسلم</span>
            </button>
            <button
              onClick={onOpenAiModal}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 text-slate-950 font-black rounded-2xl text-xs shadow-lg flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>المساعد الذكي</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Main Distinct Portal Switcher Cards (الإدارة، المعلمات، الطلاب) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <span>اختر البوابة والتطبيق المخصص:</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">بوابات مستقلة ومحمية</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* PORTAL 1: الإدارة والمجلس التعليمي */}
          <button
            onClick={() => {
              onTabChange('workspace');
              switchRole('admin');
            }}
            className={`p-5 rounded-2xl border-2 text-right transition-all duration-200 flex flex-col justify-between relative overflow-hidden group shadow-sm ${
              activeRole === 'admin'
                ? 'bg-gradient-to-br from-emerald-800 to-teal-900 text-white border-amber-400 shadow-xl scale-[1.02]'
                : 'bg-white hover:bg-emerald-50/60 text-slate-800 border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-2xl ${activeRole === 'admin' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-100 text-emerald-800'}`}>
                <Shield className="w-6 h-6 stroke-[2.2]" />
              </div>
              {activeRole === 'admin' ? (
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full">
                  البوابة المفعلة الآن 🟢
                </span>
              ) : (
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  دخول الإدارة
                </span>
              )}
            </div>

            <div className="mt-4">
              <h4 className="font-extrabold text-base">بوابة الإدارة والمجلس التعليمي</h4>
              <p className={`text-xs mt-1 leading-relaxed ${activeRole === 'admin' ? 'text-emerald-100' : 'text-slate-500'}`}>
                إدارة طلبات المعلمات، المالية والاشتراكات، البث الإعلاني، وتقارير أداء الحلقات.
              </p>
            </div>
          </button>

          {/* PORTAL 2: بوابة المعلمات */}
          <button
            onClick={() => {
              onTabChange('workspace');
              const approvedTeacher = teachers.find(t => t.status === 'approved') || teachers[0];
              switchRole('teacher', approvedTeacher?.id);
            }}
            className={`p-5 rounded-2xl border-2 text-right transition-all duration-200 flex flex-col justify-between relative overflow-hidden group shadow-sm ${
              activeRole === 'teacher'
                ? 'bg-gradient-to-br from-emerald-800 to-teal-900 text-white border-amber-400 shadow-xl scale-[1.02]'
                : 'bg-white hover:bg-emerald-50/60 text-slate-800 border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-2xl ${activeRole === 'teacher' ? 'bg-amber-400 text-slate-950' : 'bg-teal-100 text-teal-800'}`}>
                <GraduationCap className="w-6 h-6 stroke-[2.2]" />
              </div>
              {activeRole === 'teacher' ? (
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full">
                  البوابة المفعلة الآن 🟢
                </span>
              ) : (
                <span className="text-slate-400 text-xs">واجهة التدريس</span>
              )}
            </div>

            <div className="mt-4">
              <h4 className="font-extrabold text-base">بوابة المعلمات</h4>
              <p className={`text-xs mt-1 leading-relaxed ${activeRole === 'teacher' ? 'text-emerald-100' : 'text-slate-500'}`}>
                إدارة الحلقات القرآنية، تحضير الطالبات، التسميع الصوتي، ورصد التقدم اليومي.
              </p>
            </div>
          </button>

          {/* PORTAL 3: بوابة الطلاب وأولياء الأمور */}
          <button
            onClick={() => {
              onTabChange('workspace');
              const student = students[0];
              switchRole('student', student?.id);
            }}
            className={`p-5 rounded-2xl border-2 text-right transition-all duration-200 flex flex-col justify-between relative overflow-hidden group shadow-sm ${
              activeRole === 'student'
                ? 'bg-gradient-to-br from-emerald-800 to-teal-900 text-white border-amber-400 shadow-xl scale-[1.02]'
                : 'bg-white hover:bg-emerald-50/60 text-slate-800 border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-2xl ${activeRole === 'student' ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900'}`}>
                <UserCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              {activeRole === 'student' ? (
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full">
                  البوابة المفعلة الآن 🟢
                </span>
              ) : (
                <span className="text-slate-400 text-xs">واجهة الطالب</span>
              )}
            </div>

            <div className="mt-4">
              <h4 className="font-extrabold text-base">بوابة الطلاب وأولياء الأمور</h4>
              <p className={`text-xs mt-1 leading-relaxed ${activeRole === 'student' ? 'text-emerald-100' : 'text-slate-500'}`}>
                جدول الحفظ والمراجعة، مسار الختمة، وسام الإتقان، والمصحف مع التسميع التفاعلي.
              </p>
            </div>
          </button>

        </div>
      </div>

    </div>
  );
};
