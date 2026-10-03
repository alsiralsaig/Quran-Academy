import React from 'react';
import { useApp } from '../../context/AppContext';
import { Megaphone, AlertTriangle, X, Info, Sparkles } from 'lucide-react';

export const BroadcastAnnouncementBanner: React.FC = () => {
  const { broadcasts, activeRole, dismissBroadcast } = useApp();

  // Filter active broadcasts for activeRole or 'all'
  const activeBroadcasts = broadcasts.filter(
    (b) => b.active && (b.targetRole === 'all' || b.targetRole === (activeRole === 'admin' ? 'all' : `${activeRole}s` as any))
  );

  if (activeBroadcasts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6 animate-in slide-in-from-top duration-300">
      {activeBroadcasts.map((bcast) => (
        <div
          key={bcast.id}
          className={`p-4 rounded-2xl shadow-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden transition-all ${
            bcast.priority === 'urgent'
              ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white border-red-400'
              : 'bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white border-emerald-500'
          }`}
        >
          {/* Animated Background Pulse */}
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />

          <div className="flex items-start sm:items-center gap-3.5 z-10">
            <div className={`p-2.5 rounded-xl text-slate-950 font-bold ${
              bcast.priority === 'urgent' ? 'bg-amber-300 animate-bounce' : 'bg-emerald-300'
            }`}>
              {bcast.priority === 'urgent' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Megaphone className="w-5 h-5" />
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
                  {bcast.priority === 'urgent' ? 'تنبيه عاجل من الإدارة' : 'إعلان عام'}
                </span>
                <span className="text-[10px] opacity-80">{bcast.createdAt}</span>
              </div>
              <h4 className="font-extrabold text-sm sm:text-base font-serif">{bcast.title}</h4>
              <p className="text-xs text-white/95 leading-relaxed">{bcast.content}</p>
            </div>
          </div>

          <button
            onClick={() => dismissBroadcast(bcast.id)}
            className="self-end sm:self-center p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors z-10 shrink-0"
            title="إغلاق التنبيه"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
