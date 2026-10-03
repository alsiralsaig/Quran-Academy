import React, { useState } from 'react';
import { HeartHandshake, Sun, Moon, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AZKAR_DATABASE } from '../../data/azkarData';
import { ZikrItem } from '../../types';

export const AzkarView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'morning' | 'evening' | 'after_prayer' | 'sleep' | 'quranic'>('morning');
  
  // Track remaining click counts for each Zikr item ID
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    AZKAR_DATABASE.forEach((z) => {
      initial[z.id] = z.count;
    });
    return initial;
  });

  const handleZikrClick = (id: string) => {
    setCounts((prev) => {
      const current = prev[id] ?? 1;
      if (current <= 0) return prev;
      return { ...prev, [id]: current - 1 };
    });
  };

  const handleResetZikr = (id: string, originalCount: number) => {
    setCounts((prev) => ({ ...prev, [id]: originalCount }));
  };

  const currentCategoryAzkar = AZKAR_DATABASE.filter((z) => z.category === activeCategory);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Azkar Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-800/60">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-700/60 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
            <HeartHandshake className="w-4 h-4 text-emerald-300" />
            حصن المسلم والأدعية
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">
            الأذكار اليومية والأدعية المأثورة
          </h2>
          <p className="text-emerald-100/80 text-xs sm:text-sm">
            عداد أذكار تفاعلي مع بيان فضائلها ومصادرها المعتمدة للسكينة والطمأنينة.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveCategory('morning')}
          className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeCategory === 'morning'
              ? 'border-amber-500 text-amber-700 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sun className="w-4 h-4 text-amber-500" />
          أذكار الصباح
        </button>

        <button
          onClick={() => setActiveCategory('evening')}
          className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeCategory === 'evening'
              ? 'border-indigo-600 text-indigo-800 bg-indigo-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Moon className="w-4 h-4 text-indigo-600" />
          أذكار المساء
        </button>

        <button
          onClick={() => setActiveCategory('after_prayer')}
          className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeCategory === 'after_prayer'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          أذكار الصلاة
        </button>

        <button
          onClick={() => setActiveCategory('sleep')}
          className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeCategory === 'sleep'
              ? 'border-purple-600 text-purple-800 bg-purple-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Moon className="w-4 h-4 text-purple-600" />
          أذكار النوم
        </button>

        <button
          onClick={() => setActiveCategory('quranic')}
          className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeCategory === 'quranic'
              ? 'border-amber-600 text-amber-900 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-amber-600" />
          أدعية قرآنية
        </button>
      </div>

      {/* Zikr Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentCategoryAzkar.map((zikr) => {
          const remainingCount = counts[zikr.id] ?? zikr.count;
          const isDone = remainingCount <= 0;

          return (
            <div
              key={zikr.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                isDone
                  ? 'bg-emerald-50/60 border-emerald-300'
                  : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-500">{zikr.categoryLabel}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{zikr.reference}</span>
                </div>

                {/* Zikr Text */}
                <p className="font-serif text-lg sm:text-xl text-slate-900 leading-relaxed font-bold">
                  {zikr.text}
                </p>

                {zikr.virtue && (
                  <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 italic">
                    ✨ الفضل: {zikr.virtue}
                  </p>
                )}
              </div>

              {/* Counter Button & Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleResetZikr(zikr.id, zikr.count)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  title="إعادة ضبط العداد"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleZikrClick(zikr.id)}
                  disabled={isDone}
                  className={`px-6 py-3 rounded-2xl font-extrabold text-sm transition-all flex items-center gap-2 shadow-md ${
                    isDone
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white hover:from-emerald-800 hover:to-teal-900 active:scale-95'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-amber-300" />
                      تم الاكتفاء (العدد مكتمل)
                    </>
                  ) : (
                    <>
                      <span>اضغط للتسبيح</span>
                      <span className="bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-xs">
                        المتبقي: {remainingCount}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
