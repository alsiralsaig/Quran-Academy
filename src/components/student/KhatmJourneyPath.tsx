import React, { useState } from 'react';
import {
  MapPin,
  CheckCircle2,
  Sparkles,
  Trophy,
  Award,
  Crown,
  BookOpen,
  ChevronRight,
  Star,
  Layers,
  ArrowLeft,
  Lock,
  Clock
} from 'lucide-react';

export interface KhatmMilestoneNode {
  id: string;
  title: string;
  subTitle: string;
  juzNumberRange: string;
  surahRangeText: string;
  status: 'completed' | 'in_progress' | 'locked';
  progressPercentage: number;
  dateCompleted?: string;
  teacherRating?: number;
  rewardBadgeTitle?: string;
  teacherNotes?: string;
}

export const KhatmJourneyPath: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<KhatmMilestoneNode | null>(null);

  const KHATM_MILESTONES: KhatmMilestoneNode[] = [
    {
      id: 'm1',
      title: 'محطة أُمّ الكِتَاب والبَقَرَة',
      subTitle: 'فاتحة المصحف وسنام القرآن',
      juzNumberRange: 'الجزء 1 - 3',
      surahRangeText: 'سورة الفاتحة + سورة البقرة (286 آية)',
      status: 'completed',
      progressPercentage: 100,
      dateCompleted: '2026-08-15',
      teacherRating: 5,
      rewardBadgeTitle: 'وسام حافظ الزهراوين 🏆',
      teacherNotes: 'حفظ وتثبيت ممتاز مع إتقان أحكام الإظهار والمد المتصل.',
    },
    {
      id: 'm2',
      title: 'محطة آل عِمْرَان والنِّسَاء',
      subTitle: 'تتمة السبع الطوال',
      juzNumberRange: 'الجزء 3 - 6',
      surahRangeText: 'سورة آل عمران + سورة النساء',
      status: 'in_progress',
      progressPercentage: 75,
      teacherRating: 4,
      rewardBadgeTitle: 'وسام المتقدم المتقن ⭐',
      teacherNotes: 'جاري التثبيت والمراجعة النهائية للجزء الخامس.',
    },
    {
      id: 'm3',
      title: 'محطة مُنْتَصَفِ القُرْآن (الكَهْف)',
      subTitle: 'نور ما بين الجمعتين',
      juzNumberRange: 'الجزء 15 - 16',
      surahRangeText: 'سورة الإسراء + سورة الكهف + سورة مريم',
      status: 'completed',
      progressPercentage: 100,
      dateCompleted: '2026-07-20',
      teacherRating: 5,
      rewardBadgeTitle: 'وسام نور الجمعة 🌟',
      teacherNotes: 'تسميع متقن خالي من الأخطاء في سورة الكهف.',
    },
    {
      id: 'm4',
      title: 'محطة قَلْبِ القُرْآن (يس والوَاقِعَة)',
      subTitle: 'سور الفضل والتدبر',
      juzNumberRange: 'الجزء 22 - 23',
      surahRangeText: 'سورة يس + سورة الصافات + سورة الواقعة',
      status: 'completed',
      progressPercentage: 100,
      dateCompleted: '2026-08-30',
      teacherRating: 5,
      rewardBadgeTitle: 'وسام ترتيل السور المباركة 🎖️',
      teacherNotes: 'أداء صوتي ممتاز وضبط تام لمواضع القلقلة.',
    },
    {
      id: 'm5',
      title: 'محطة جُزْء تَبَارَك (المُلْك)',
      subTitle: 'المنجية من عذاب القبر',
      juzNumberRange: 'الجزء 29',
      surahRangeText: 'من سورة الملك إلى سورة المرسلات (11 سورة)',
      status: 'completed',
      progressPercentage: 100,
      dateCompleted: '2026-09-01',
      teacherRating: 5,
      rewardBadgeTitle: 'وسام الحصن المنيع 🛡️',
      teacherNotes: 'تم حفظ السور الإحدى عشرة بتثبيت وتطبيق للأحكام.',
    },
    {
      id: 'm6',
      title: 'محطة جُزْء عَمَّ (قصار السور)',
      subTitle: 'البداية المباركة والمحكمة',
      juzNumberRange: 'الجزء 30',
      surahRangeText: 'من سورة النبأ إلى سورة الناس (37 سورة)',
      status: 'completed',
      progressPercentage: 100,
      dateCompleted: '2026-01-05',
      teacherRating: 5,
      rewardBadgeTitle: 'وسام ختام جزء عمّ 🥇',
      teacherNotes: 'تثبيت متكامل ومراجعة سريعة يومية.',
    },
    {
      id: 'm7',
      title: 'محطة خَتْمِ القُرْآنِ الكَرِيمِ كَامِلاً 👑',
      subTitle: 'تاج الوقار والدرجات العلى',
      juzNumberRange: 'القرآن الكريم كاملاً (30 جزءاً)',
      surahRangeText: '114 سورة (604 صفحة / 6236 آية)',
      status: 'locked',
      progressPercentage: 60,
      rewardBadgeTitle: 'تاج الوقار والختمة المباركة 👑',
      teacherNotes: 'الهدف النهائي المنشود - واصل المراجعة والتقدم بخطى ثابتة!',
    },
  ];

  const totalCompletedMilestones = KHATM_MILESTONES.filter((m) => m.status === 'completed').length;
  const overallKhatmPercentage = Math.round((totalCompletedMilestones / (KHATM_MILESTONES.length - 1)) * 100);

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
                Visual Khatm Progression Journey 🗺️
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg font-serif mt-0.5">
              مسار إنجاز الحفظ الملون ونقاط الطريق نحو ختم القرآن
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-left text-xs bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200">
            <span className="text-slate-500 font-bold block">نسبة التقدم نحو الختمة:</span>
            <span className="text-sm font-black text-emerald-800 font-serif">{overallKhatmPercentage}% أكملت {totalCompletedMilestones} محطات</span>
          </div>
        </div>
      </div>

      {/* Visual Zigzag Connected Path Canvas */}
      <div className="bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 p-6 sm:p-10 rounded-3xl text-white shadow-xl relative overflow-hidden space-y-8 border-2 border-emerald-800">
        
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-1 relative z-10">
          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full border border-amber-300">
            خريطة الطريق والمسار الملون للختمة المباركة 🕌
          </span>
          <p className="text-xs text-emerald-200 font-medium">
            انقر على أي محطة في المسار للتفاصيل الدقيقة وتاريخ التسميع ووسام الإنجاز الممنوح.
          </p>
        </div>

        {/* Milestone Nodes List connected with Visual Path Line */}
        <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
          {KHATM_MILESTONES.map((node, index) => {
            const isCompleted = node.status === 'completed';
            const isInProgress = node.status === 'in_progress';
            const isLastNode = index === KHATM_MILESTONES.length - 1;

            return (
              <div key={node.id} className="relative flex items-start gap-4 sm:gap-6 group">
                
                {/* Connecting Path Line to Next Node */}
                {!isLastNode && (
                  <div
                    className={`absolute right-6 sm:right-7 top-12 bottom-0 w-1 rounded-full -mb-6 z-0 transition-all ${
                      isCompleted
                        ? 'bg-gradient-to-b from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                        : isInProgress
                        ? 'bg-gradient-to-b from-amber-400 to-slate-700 animate-pulse'
                        : 'bg-slate-800 border-dashed border-r'
                    }`}
                  />
                )}

                {/* Node Milestone Circular Pin */}
                <button
                  onClick={() => setSelectedNode(node)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xl relative z-10 transition-all transform group-hover:scale-110 border-2 ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-300 text-white shadow-emerald-900/50 ring-4 ring-emerald-500/30'
                      : isInProgress
                      ? 'bg-amber-400 border-amber-200 text-slate-950 ring-4 ring-amber-400/30 animate-bounce'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  ) : isInProgress ? (
                    <Sparkles className="w-7 h-7 text-slate-950 animate-spin" />
                  ) : (
                    <Lock className="w-6 h-6 text-slate-600" />
                  )}
                </button>

                {/* Node Content Card */}
                <div
                  onClick={() => setSelectedNode(node)}
                  className={`flex-1 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-emerald-950/80 border-emerald-700/80 hover:bg-emerald-900 hover:border-emerald-500'
                      : isInProgress
                      ? 'bg-amber-950/60 border-amber-600/80 hover:bg-amber-900/80'
                      : 'bg-slate-950/60 border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                            isCompleted
                              ? 'bg-emerald-800 text-emerald-100 border-emerald-600'
                              : isInProgress
                              ? 'bg-amber-400 text-slate-950 border-amber-300'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {node.juzNumberRange}
                        </span>
                        <h4 className="font-extrabold text-sm sm:text-base font-serif text-amber-200">
                          {node.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">{node.subTitle}</p>
                    </div>

                    <div className="text-left shrink-0">
                      {isCompleted && node.dateCompleted && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/60 px-2.5 py-1 rounded-xl border border-emerald-700">
                          تاريخ الإتمام: {node.dateCompleted} ✓
                        </span>
                      )}
                      {isInProgress && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-950 px-2.5 py-1 rounded-xl border border-amber-700">
                          جاري التثبيت ({node.progressPercentage}%) ⏳
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-300">
                    <span className="font-mono text-[11px] text-amber-300/90">{node.surahRangeText}</span>
                    <span className="text-emerald-400 font-bold text-[10px] underline flex items-center gap-1">
                      تفاصيل التسميع <ArrowLeft className="w-3 h-3" />
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Selected Node Details Drawer / Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-emerald-200 dark:border-slate-800 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h4 className="font-extrabold text-slate-900 dark:text-white font-serif">{selectedNode.title}</h4>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-emerald-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-emerald-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 block">نطاق السور والأجزاء:</span>
                <p className="font-semibold text-slate-700 dark:text-slate-300">{selectedNode.surahRangeText}</p>
              </div>

              {selectedNode.rewardBadgeTitle && (
                <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200/80 text-amber-950 dark:text-amber-200 space-y-1">
                  <span className="font-extrabold text-[11px] block">الوسام الممنوح للطالب:</span>
                  <p className="font-bold text-sm text-amber-800 dark:text-amber-300">{selectedNode.rewardBadgeTitle}</p>
                </div>
              )}

              {selectedNode.teacherNotes && (
                <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-slate-500 block">ملاحظات وتقييم المعلمة:</span>
                  <p className="text-slate-800 dark:text-slate-200 italic font-medium">"{selectedNode.teacherNotes}"</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md text-xs"
            >
              تم المراجعة والعودة للمسار
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
