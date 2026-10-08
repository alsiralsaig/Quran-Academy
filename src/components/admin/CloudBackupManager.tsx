import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Cloud, Download, ShieldCheck, Database, History, Info } from 'lucide-react';

/**
 * النسخ الاحتياطي — بصدق:
 * - البيانات محفوظة في قاعدة Neon (Postgres)، وNeon بتحتفظ بسجل تلقائي يسمح بالرجوع لنقطة زمنية سابقة (Restore).
 * - من هنا المدير يقدر ينزّل نسخة كاملة (JSON) لجهازه في أي وقت.
 */
export const CloudBackupManager: React.FC = () => {
  const { exportData, students, teachers, subscriptions, sessions, packages } = useApp();
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    setDownloading(true);
    try {
      await Promise.resolve(exportData());
    } finally {
      setTimeout(() => setDownloading(false), 1200);
    }
  };

  const stats = [
    { label: 'الطلاب', value: students.length },
    { label: 'المعلمين', value: teachers.length },
    { label: 'الاشتراكات', value: subscriptions.length },
    { label: 'الحصص المسجّلة', value: sessions.length },
    { label: 'الباقات', value: packages.length },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5 border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-serif">النسخ الاحتياطي</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              كل بيانات الأكاديمية محفوظة في قاعدة البيانات السحابية (Neon) — ما في حاجة محفوظة في جهازك بس.
            </p>
          </div>
        </div>
        <button
          onClick={download}
          disabled={downloading}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 min-h-[42px] disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'جاري التنزيل...' : 'تنزيل نسخة كاملة (JSON)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-xl font-black text-emerald-800">{s.value}</div>
            <div className="text-[11px] text-slate-500 font-bold">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 space-y-1.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <h4 className="font-extrabold text-emerald-950">حفظ فوري</h4>
          <p className="text-emerald-900/80 leading-relaxed">
            أي اشتراك أو إيصال أو حصة أو إشعار بيتحفظ في قاعدة البيانات لحظة إرساله، ويظهر في كل الأجهزة.
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-sky-200 bg-sky-50/60 space-y-1.5">
          <History className="w-5 h-5 text-sky-700" />
          <h4 className="font-extrabold text-sky-950">استعادة لنقطة زمنية</h4>
          <p className="text-sky-900/80 leading-relaxed">
            Neon بتحتفظ بسجل تلقائي للتغييرات. لو حصل حذف بالغلط، من لوحة Neon ← <b>Restore</b> بتقدر ترجع القاعدة لوقت سابق
            (المدة حسب خطتك في Neon).
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 space-y-1.5">
          <Database className="w-5 h-5 text-amber-700" />
          <h4 className="font-extrabold text-amber-950">نسخة في جهازك</h4>
          <p className="text-amber-900/80 leading-relaxed">
            زر «تنزيل نسخة كاملة» بينزّل ملف فيه المستخدمين والباقات والاشتراكات والحصص والإعلانات والبيانات الشخصية. احفظه في مكان آمن.
          </p>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>كلمات السر وصور الإيصالات ما بتكون في الملف لأسباب أمنية وعشان حجمه يكون صغير — هي محفوظة في القاعدة نفسها.</span>
      </div>
    </div>
  );
};
