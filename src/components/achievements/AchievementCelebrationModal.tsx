import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Trophy, Sparkles, Star, CheckCircle2, Share2, X, Gift } from 'lucide-react';

export interface MilestoneAchievement {
  id: string;
  title: string;
  surahOrBadge: string;
  pointsAwarded: number;
  description: string;
  iconType: 'trophy' | 'award' | 'star' | 'crown';
  dateEarned: string;
}

// Exportable Fireworks & Confetti Celebration Burst Helper
export const triggerFireworksCelebration = () => {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 45 * (timeLeft / duration);

    // Left fireworks cannon
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#ffffff'],
    });

    // Right fireworks cannon
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#fbbf24', '#34d399', '#a855f7', '#f43f5e', '#ffffff'],
    });
  }, 250);
};

interface AchievementCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: MilestoneAchievement | null;
  studentName: string;
}

export const AchievementCelebrationModal: React.FC<AchievementCelebrationModalProps> = ({
  isOpen,
  onClose,
  achievement,
  studentName,
}) => {
  // Fire Confetti and Fireworks bursts when modal opens
  useEffect(() => {
    if (isOpen) {
      triggerFireworksCelebration();
    }
  }, [isOpen]);

  if (!isOpen || !achievement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-amber-400 relative overflow-hidden text-center animate-in zoom-in-95 duration-300">
        
        {/* Glow backdrop behind badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Icon */}
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full shadow-lg border border-amber-300 animate-pulse">
            <Sparkles className="w-4 h-4 text-slate-950" />
            إنجاز مبارك جديد 🎉
          </div>

          <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl p-5 mx-auto shadow-2xl border-4 border-amber-300/80 flex items-center justify-center animate-bounce">
            {achievement.iconType === 'trophy' ? (
              <Trophy className="w-12 h-12 text-slate-950 fill-slate-950" />
            ) : achievement.iconType === 'award' ? (
              <Award className="w-12 h-12 text-slate-950" />
            ) : (
              <Star className="w-12 h-12 text-slate-950 fill-slate-950" />
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-serif text-amber-300 pt-2">
            مُبارك عليكِ يا {studentName}!
          </h2>
          <p className="text-emerald-100 text-sm font-semibold">
            {achievement.title}
          </p>
        </div>

        {/* Milestone Details Box */}
        <div className="bg-emerald-950/80 p-5 rounded-2xl border border-emerald-700/80 space-y-3 text-xs relative z-10">
          <div className="flex items-center justify-center gap-2 text-amber-300 font-extrabold text-base">
            <Gift className="w-5 h-5 text-amber-300" />
            <span>مكافأة الإنجاز: +{achievement.pointsAwarded} نقطة إتقان!</span>
          </div>

          <p className="text-emerald-100/90 leading-relaxed font-medium">
            {achievement.description}
          </p>

          <span className="text-[11px] text-emerald-300/80 block">
            تاريخ تحقيق الإنجاز: {achievement.dateEarned}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 relative z-10">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 text-slate-950" />
            استلام المكافأة ومتابعة الحفظ
          </button>
        </div>

      </div>
    </div>
  );
};
