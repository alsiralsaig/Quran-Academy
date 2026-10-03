import React, { useState } from 'react';
import { Award, Trophy, Star, Sparkles, Flame, CheckCircle2, Lock, Share2, BookOpen, Clock, Zap, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface DigitalBadge {
  id: string;
  title: string;
  category: 'memorization' | 'attendance' | 'quiz' | 'pomodoro' | 'streak';
  description: string;
  requirement: string;
  pointsAwarded: number;
  unlocked: boolean;
  unlockedAt?: string;
  progressPercent: number; // 0 to 100
  iconType: 'trophy' | 'award' | 'star' | 'flame' | 'sparkles' | 'book';
}

interface DigitalBadgesShowcaseProps {
  studentName: string;
}

export const DigitalBadgesShowcase: React.FC<DigitalBadgesShowcaseProps> = ({ studentName }) => {
  const [selectedBadge, setSelectedBadge] = useState<DigitalBadge | null>(null);

  // Digital Badges Dataset
  const badges: DigitalBadge[] = [
    {
      id: 'badge_juz_30',
      title: 'وسام حفظ جزء كامل 🏆',
      category: 'memorization',
      description: 'وسام تقديري يمنح للطالب فور إتمام تسميع وتثبيت جزء كامل من القرآن الكريم (مثل جزء عمّ رقم 30).',
      requirement: 'حفظ وتسميع كافة سور جزء كامل بدون أخطاء.',
      pointsAwarded: 100,
      unlocked: true,
      unlockedAt: '2026-09-20',
      progressPercent: 100,
      iconType: 'trophy',
    },
    {
      id: 'badge_attendance_week',
      title: 'وسام الحضور المستمر لمدة أسبوع 🌟',
      category: 'attendance',
      description: 'شارة الانضباط العالي الممنوحة للطالب المواظب على جميع الحصص المباشرة طيلة أسبوع كامل دون أي غياب.',
      requirement: 'حضور جميع جلسات التسميع المجدولة خلال 7 أيام متتالية.',
      pointsAwarded: 75,
      unlocked: true,
      unlockedAt: '2026-09-28',
      progressPercent: 100,
      iconType: 'star',
    },
    {
      id: 'badge_surah_baqarah',
      title: 'وسام إتقان سورة البقرة 📖',
      category: 'memorization',
      description: 'تاج الحفظ المتميز لإتمام أطول سور القرآن الكريم مع مراعاة أحكام التجويد والترتيل.',
      requirement: 'ختم وتسميع سورة البقرة المباركة كاملاً.',
      pointsAwarded: 150,
      unlocked: true,
      unlockedAt: '2026-08-15',
      progressPercent: 100,
      iconType: 'book',
    },
    {
      id: 'badge_pomodoro_hero',
      title: 'وسام بطل البومودورو والتركيز ⏱️',
      category: 'pomodoro',
      description: 'شارة التركيز العالي الممنوحة للطالب الذي يتخطى 10 جلسات تركيز وبومودورو أثناء الحفظ اليومي.',
      requirement: 'إتمام 10 جلسات بومودورو تركيز (25 دقيقة لكل جلسة).',
      pointsAwarded: 50,
      unlocked: true,
      unlockedAt: '2026-10-01',
      progressPercent: 100,
      iconType: 'sparkles',
    },
    {
      id: 'badge_tajweed_master',
      title: 'وسام علامة التجويد والمتشابهات 🧠',
      category: 'quiz',
      description: 'شارة التفوق العلمية الممنوحة للطالب المحقق لنسبة 90%+ في اختبارات التجويد ومواضع الآيات.',
      requirement: 'الحصول على درجة ممتاز (90%+) في الاختبارات القصيرة الذكية.',
      pointsAwarded: 80,
      unlocked: false,
      progressPercent: 75,
      iconType: 'award',
    },
    {
      id: 'badge_daily_streak_15',
      title: 'وسام المواظبة اليومية (15 يوماً) ⚡',
      category: 'streak',
      description: 'شارة الاستمرارية الممنوحة للطالب المحافظ على وِرد الحفظ والمراجعة لـ 15 يوماً متتالياً.',
      requirement: 'تثبيت الإنجاز اليومي في تقويم الحفظ لـ 15 يوماً متواصلاً.',
      pointsAwarded: 100,
      unlocked: false,
      progressPercent: 80,
      iconType: 'flame',
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const handleOpenBadgeDetails = (badge: DigitalBadge) => {
    setSelectedBadge(badge);
    if (badge.unlocked) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#fbbf24', '#ffffff'],
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
            <Trophy className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                Digital Badges & Gamification Showcase
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg font-serif">
              معرض الأوسمة والشارات الرقمية المكتسبة
            </h3>
          </div>
        </div>

        <div className="bg-slate-100 border px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 shrink-0">
          الأوسمة المكتسبة: <span className="font-black text-emerald-700">{unlockedCount} من {badges.length}</span> 🏆
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => {
          const isUnlocked = badge.unlocked;

          return (
            <div
              key={badge.id}
              onClick={() => handleOpenBadgeDetails(badge)}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden group space-y-3 ${
                isUnlocked
                  ? 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white border-amber-400/80 shadow-lg hover:scale-[1.02]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300 opacity-90'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-14 h-14 rounded-2xl p-3 flex items-center justify-center shadow-md border ${
                  isUnlocked
                    ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
                    : 'bg-slate-200 text-slate-400 border-slate-300'
                }`}>
                  {badge.iconType === 'trophy' ? (
                    <Trophy className="w-7 h-7" />
                  ) : badge.iconType === 'star' ? (
                    <Star className="w-7 h-7 fill-current" />
                  ) : badge.iconType === 'book' ? (
                    <BookOpen className="w-7 h-7" />
                  ) : badge.iconType === 'flame' ? (
                    <Flame className="w-7 h-7" />
                  ) : (
                    <Award className="w-7 h-7" />
                  )}
                </div>

                {isUnlocked ? (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-300">
                    مكتسب (+{badge.pointsAwarded} نقطة)
                  </span>
                ) : (
                  <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    مغلق ({badge.progressPercent}%)
                  </span>
                )}
              </div>

              <div>
                <h4 className={`font-extrabold text-sm font-serif ${isUnlocked ? 'text-amber-300' : 'text-slate-900'}`}>
                  {badge.title}
                </h4>
                <p className={`text-xs mt-1 leading-relaxed ${isUnlocked ? 'text-emerald-100/90' : 'text-slate-500'}`}>
                  {badge.description}
                </p>
              </div>

              {/* Progress bar for locked badge */}
              {!isUnlocked && (
                <div className="space-y-1 pt-1">
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${badge.progressPercent}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block">المتطلب: {badge.requirement}</span>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-amber-400 text-center relative">
            <div className="w-20 h-20 bg-amber-400 text-slate-950 rounded-3xl p-4 mx-auto shadow-2xl border-4 border-amber-300 flex items-center justify-center animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full">
                {selectedBadge.unlocked ? 'وسام شرف رقمي مكتسب 🎉' : 'وسام قيد الفتح 🔒'}
              </span>
              <h3 className="text-2xl font-black font-serif text-amber-300">
                {selectedBadge.title}
              </h3>
              <p className="text-emerald-100 text-xs leading-relaxed">
                {selectedBadge.description}
              </p>
            </div>

            <div className="bg-emerald-950/90 p-4 rounded-2xl border border-emerald-700/80 text-xs space-y-2 text-right">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">شرط الاستحقاق:</span>
                <span className="font-bold text-amber-300">{selectedBadge.requirement}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">المكافأة:</span>
                <span className="font-bold text-amber-300">+{selectedBadge.pointsAwarded} نقطة إتقان</span>
              </div>
              {selectedBadge.unlockedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">تاريخ الاكتساب:</span>
                  <span className="font-bold text-white">{selectedBadge.unlockedAt}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl"
            >
              إغلاق الشارة
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
