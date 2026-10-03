import React, { useState } from 'react';
import { Award, Star, BookOpen, Flame, Sparkles, Trophy, CheckCircle2, Lock, ShieldCheck, Zap } from 'lucide-react';
import { SessionRecord, BadgeItem } from '../../types';

interface GamificationBadgesProps {
  sessions: SessionRecord[];
  studentName: string;
}

export const GamificationBadges: React.FC<GamificationBadgesProps> = ({ sessions, studentName }) => {
  // Calculate total points earned dynamically
  const completedSessionsCount = sessions.length;
  const fiveStarCount = sessions.filter((s) => s.rating === 5).length;
  const fourStarCount = sessions.filter((s) => s.rating === 4).length;

  const pointsFromSessions = fiveStarCount * 50 + fourStarCount * 35 + completedSessionsCount * 20;
  const totalPoints = 120 + pointsFromSessions; // 120 base initial points

  // Level determination
  let currentLevel = 'المبتدئ المجد';
  let levelNumber = 1;
  let nextLevelPoints = 200;
  let levelColor = 'from-teal-600 to-emerald-700';

  if (totalPoints >= 600) {
    currentLevel = 'الخاتم المتميز 👑';
    levelNumber = 4;
    nextLevelPoints = 1000;
    levelColor = 'from-amber-500 via-amber-600 to-amber-700';
  } else if (totalPoints >= 350) {
    currentLevel = 'النجم القرآني ✨';
    levelNumber = 3;
    nextLevelPoints = 600;
    levelColor = 'from-purple-600 to-indigo-700';
  } else if (totalPoints >= 150) {
    currentLevel = 'الحافظ المتقن 🌟';
    levelNumber = 2;
    nextLevelPoints = 350;
    levelColor = 'from-emerald-600 to-teal-700';
  }

  const progressPercent = Math.min(100, Math.round((totalPoints / nextLevelPoints) * 100));

  // Badges Dataset
  const badges: BadgeItem[] = [
    {
      id: 'badge_1',
      title: 'شارة التأسيس والانطلاق',
      description: 'للالتحاق بالحلقات وتفعيل الباقة الأولى بنجاح.',
      iconName: 'sparkles',
      unlocked: true,
      unlockedAt: 'منذ شهر',
      pointsRequired: 50,
    },
    {
      id: 'badge_2',
      title: 'وسام الإتقان الذهبي',
      description: 'للحصول على تقييم 5 نجوم مع درجة الإتقان في التسميع.',
      iconName: 'star',
      unlocked: fiveStarCount > 0,
      unlockedAt: 'مكتمل',
      pointsRequired: 100,
    },
    {
      id: 'badge_3',
      title: 'شارة المواظبة والاستمرار',
      description: 'لإتمام 3 حصص تفاعلية متتالية دون انقطاع.',
      iconName: 'flame',
      unlocked: completedSessionsCount >= 2,
      unlockedAt: 'مكتمل',
      pointsRequired: 150,
    },
    {
      id: 'badge_4',
      title: 'شارة التحضير والرجوع الذاتي',
      description: 'لاستخدام وضع المراجعة السريعة (Quick Review) والتسجيل الذاتي.',
      iconName: 'award',
      unlocked: true,
      unlockedAt: 'نشط',
      pointsRequired: 200,
    },
    {
      id: 'badge_5',
      title: 'تاج الحافظ الخاتم',
      description: 'للوصول إلى 600 نقطة والترقي لمستوى الخاتم المتميز.',
      iconName: 'book',
      unlocked: totalPoints >= 600,
      pointsRequired: 600,
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header Banner: Level & Points Gauge */}
      <div className={`bg-gradient-to-r ${levelColor} text-white rounded-2xl p-6 shadow-md relative overflow-hidden space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-amber-300">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-200 block">نظام نقاط الإتقان والشارات</span>
              <h3 className="font-extrabold text-2xl font-serif">{currentLevel}</h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                المستوى {levelNumber} | رصيد النقاط الحالية: <span className="font-bold text-amber-300 text-sm">{totalPoints} نقطة</span>
              </p>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center shrink-0">
            <span className="text-[10px] text-emerald-200 block">الهدف التالي</span>
            <span className="font-extrabold text-white text-sm">{nextLevelPoints} نقطة</span>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="space-y-1.5 relative z-10">
          <div className="flex justify-between text-[11px] font-bold text-emerald-100">
            <span>التقدم للمستوى القادم</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden p-0.5 border border-white/20">
            <div
              className="bg-gradient-to-r from-amber-300 to-amber-400 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Showcase Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              معرض شارات وأوسمة الإتقان
            </h4>
            <p className="text-xs text-slate-500">احصل على الشارات عند التسميع المتقن، الحضور، والمراجعة الذاتية.</p>
          </div>

          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-300">
            {badges.filter((b) => b.unlocked).length} من {badges.length} شارات مفتوحة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3 space-y-1 relative overflow-hidden ${
                badge.unlocked
                  ? 'bg-gradient-to-br from-amber-50/60 via-white to-emerald-50/40 border-amber-300 shadow-sm ring-1 ring-amber-400/20'
                  : 'bg-slate-50 border-slate-200/80 opacity-70'
              }`}
            >
              <div
                className={`p-3 rounded-2xl shrink-0 font-bold ${
                  badge.unlocked
                    ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {badge.iconName === 'sparkles' && <Sparkles className="w-6 h-6" />}
                {badge.iconName === 'star' && <Star className="w-6 h-6 fill-slate-950" />}
                {badge.iconName === 'flame' && <Flame className="w-6 h-6" />}
                {badge.iconName === 'award' && <Award className="w-6 h-6" />}
                {badge.iconName === 'book' && <BookOpen className="w-6 h-6" />}
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between gap-1">
                  <h5 className="font-extrabold text-slate-900 text-sm">{badge.title}</h5>
                  {badge.unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </div>

                <p className="text-slate-600 text-[11px] leading-relaxed">{badge.description}</p>

                <div className="pt-1 flex items-center justify-between text-[10px]">
                  {badge.unlocked ? (
                    <span className="text-emerald-700 font-bold">✨ مصلحة ومفتوحة</span>
                  ) : (
                    <span className="text-slate-400 font-medium">يتطلب {badge.pointsRequired} نقطة</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
